import { zValidator } from "@hono/zod-validator";
import { config } from "@lib/config";
import { UserDB } from "@lib/db/UserDB";
import type { MetaBindings } from "@lib/types/envTypes";
import {
  generateOtp,
  generateTokens,
  loginSchema,
  sendOtpEmail,
  verifySchema,
} from "@routes/user/auth/helpers";
import { Hono } from "hono";
import { deleteCookie, getCookie, setCookie } from "hono/cookie";
import { cors } from "hono/cors";
import { verify } from "hono/jwt";
import type { DemoUser, User } from "~lib/types/userMetadata";

const app = new Hono<MetaBindings>();
app.use(
  cors({
    origin: [
      "http://localhost:5273",
      "http://localhost:5173",
      "https://dev.app.hissab.io",
      "https://app.hissab.io",
    ], // Add your frontend URLs
    allowHeaders: ["Content-Type", "Authorization"],
    allowMethods: ["POST", "GET", "OPTIONS"],
    credentials: true,
  }),
);

app.post("/login", zValidator("json", loginSchema), async (c) => {
  const { email } = c.req.valid("json");
  const db = new UserDB(c.env.USER_DB);
  let newUser = false;

  try {
    let user: User | null = await db.getUserByEmail(email);

    if (!user) {
      user = await db.createUser(email);
      newUser = true;
    }
    const expiresAt = new Date(
      Date.now() + config.auth.otpExpiration * 1000,
    ).toISOString();
    if (user.status === "banned") {
      return c.json({ error: "Your account is banned." }, 403);
    }
    if (user.status === "demo") {
      const demoUser: DemoUser | null = await db.getDemoUserById(user.id);
      if (!demoUser || new Date(demoUser.expires_at).getTime() < Date.now()) {
        return c.json({ error: "Demo account expired." }, 403);
      }
      const otp = demoUser.otp;

      await db.insertOtp(user.id, otp, expiresAt);
      return c.json({
        newUser,
        message: `An OTP has been sent to ${email}. It will expire in ${config.email.otpExpirationWords}.`,
      });
    }
    //const otp = "123456";
    const otp = generateOtp();

    await db.insertOtp(user.id, otp, expiresAt);
    await sendOtpEmail(
      email,
      otp,
      c.env.AWS_ACCESS_KEY_ID,
      c.env.AWS_SECRET_ACCESS_KEY,
    );

    return c.json({
      newUser,
      message: `An OTP has been sent to ${email}. It will expire in ${config.email.otpExpirationWords}.`,
    });
  } catch (error: any) {
    console.error("Login error:", error);
    return c.json({ error: "An internal error occurred." }, 500);
  }
});

app.post("/verify", zValidator("json", verifySchema), async (c) => {
  const { email, otp } = c.req.valid("json");
  const db = new UserDB(c.env.USER_DB);

  try {
    const user: User | null = await db.getUserByEmail(email);
    if (!user) {
      return c.json({ error: "User not found." }, 404);
    }

    const otpRecord = await db.getOtp(user.id);

    if (!otpRecord || otpRecord.otp_code !== otp) {
      return c.json({ error: "Invalid or expired OTP." }, 400);
    }

    if (user.status === "unverified") {
      await db.updateUserStatus(user.id, "active");
    }

    const userPlans = await db.getActiveUserPlans(user.id);
    const { accessToken, refreshToken } = await generateTokens(
      user,
      userPlans,
      c.env.JWT_SECRET,
      c.env.JWT_REFRESH_SECRET,
    );

    await db.createRefreshToken(user.id, refreshToken);

    await db.deleteOtp(otpRecord.id);

    setCookie(c, "access_token", accessToken, {
      httpOnly: true,
      secure: c.req.url.startsWith("https://"), // Use secure cookies in production
      sameSite: "Lax",
      path: "/",
      maxAge: config.auth.accessTokenExpiration, // 24 hours
    });
    setCookie(c, "refresh_token", refreshToken, {
      httpOnly: true,
      secure: c.req.url.startsWith("https://"),
      sameSite: "Lax",
      path: "/",
      maxAge: config.auth.refreshTokenExpiration, // 30 days
    });

    return c.json({
      user,
      userPlans,
      accessToken,
    });
  } catch (error: any) {
    console.error("Verify OTP error:", error);
    return c.json({ error: "An internal error occurred." }, 500);
  }
});

app.post("/refresh", async (c) => {
  const refreshToken = getCookie(c, "refresh_token");
  if (!refreshToken) {
    return c.json({ error: "Refresh token not found." }, 401);
  }

  const db = new UserDB(c.env.USER_DB);

  try {
    const decoded = await verify(refreshToken, c.env.JWT_REFRESH_SECRET);

    const tokenRecord = await db.getTokenRecord(refreshToken);

    if (!tokenRecord) {
      return c.json({ error: "Invalid or expired refresh token." }, 401);
    }

    const user: User | null = await db.getUserById(tokenRecord.user_id);
    if (!user) {
      return c.json({ error: "User not found." }, 404);
    }
    // Check if the user is banned
    if (user.status === "banned") {
      return c.json({ error: "Your account is banned." }, 403);
    }
    const userPlans = await db.getActiveUserPlans(user.id);
    const { accessToken } = await generateTokens(
      user,
      userPlans,
      c.env.JWT_SECRET,
      c.env.JWT_REFRESH_SECRET,
    );

    setCookie(c, "access_token", accessToken, {
      httpOnly: true,
      secure: c.req.url.startsWith("https://"),
      sameSite: "Lax",
      path: "/",
      maxAge: config.auth.accessTokenExpiration,
    });

    return c.json({ user, userPlans, accessToken });
  } catch (error) {
    console.error("Refresh token error:", error);
    deleteCookie(c, "access_token", { path: "/" });
    deleteCookie(c, "refresh_token", { path: "/" });
    return c.json({ error: "Unauthorized." }, 401);
  }
});

app.post("/logout", async (c) => {
  const refreshToken = getCookie(c, "refresh_token");
  const db = new UserDB(c.env.USER_DB);
  if (refreshToken) {
    try {
      await db.deleteRefreshToken(refreshToken);
    } catch (error) {
      console.error("Logout DB error:", error);
    }
  }

  deleteCookie(c, "access_token", { path: "/" });
  deleteCookie(c, "refresh_token", { path: "/" });

  return c.json({ message: "Successfully logged out." });
});

export default app;
