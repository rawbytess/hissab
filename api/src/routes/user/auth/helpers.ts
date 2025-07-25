import { SESClient, SendEmailCommand } from "@aws-sdk/client-ses";
import { config } from "@lib/config";
import { sign } from "hono/jwt";
import { customAlphabet } from "nanoid";
import { z } from "zod";
import {
  type CreditsDetails,
  type JWTPayload,
  type ProductNames,
  products,
  type SubscriptionStatus,
  type User,
  type UserMetadata,
  type UserPlan,
} from "~lib/types/userMetadata";

export function generateOtp(): string {
  const nanoid = customAlphabet("0123456789", 6);
  return nanoid();
}

export async function generateTokens(
  user: User,
  userPlans: UserPlan[],
  jwt_secret: string,
  jwt_refresh_secret: string,
): Promise<{ accessToken: string; refreshToken: string }> {
  const now = Math.floor(Date.now() / 1000);
  const userMetadata: UserMetadata = {};
  const currentDate = new Date();
  userMetadata.name = user.name ?? undefined;
  userMetadata.timezone = user.timezone ?? undefined;

  userPlans.forEach((userPlan) => {
    if (products[userPlan.product_name].type === "subscription") {
      userMetadata.subscription = {
        status: userPlan.status as SubscriptionStatus,
        renews_at: userPlan.renews_at,
        ends_at: userPlan.ends_at,
        created_at: userPlan.created_at,
        updated_at: userPlan.updated_at,
        product_name: userPlan.product_name as ProductNames,
      };
    } else if (products[userPlan.product_name].type === "credits") {
      const product = products[userPlan.product_name] as CreditsDetails;
      const ccredits = product.credits || 0;
      const almostExpired =
        new Date(userPlan.ends_at!) <
        new Date(currentDate.getTime() + 604800000)
          ? product.credits
          : 0;
      userMetadata.credits = {
        credits: (userMetadata?.credits?.credits || 0) + ccredits,
        almostExpired:
          (userMetadata?.credits?.almostExpired || 0) + almostExpired,
      };
    }
  });

  const accessTokenPayload: JWTPayload = {
    sub: user.id,
    email: user.email,
    exp: now + config.auth.accessTokenExpiration,
    metadata: userMetadata,
  };
  const accessToken = await sign(accessTokenPayload, jwt_secret);

  const refreshTokenPayload = {
    sub: user.id,
    exp: now + config.auth.refreshTokenExpiration,
  };
  const refreshToken = await sign(refreshTokenPayload, jwt_refresh_secret);

  return { accessToken, refreshToken };
}

export async function sendOtpEmail(
  toEmail: string,
  otp: string,
  aws_access_key_id: string,
  aws_secret_access_key: string,
) {
  const sesClient = new SESClient({
    region: config.email.awsRegion,
    credentials: {
      accessKeyId: aws_access_key_id,
      secretAccessKey: aws_secret_access_key,
    },
  });

  const command = new SendEmailCommand({
    Destination: { ToAddresses: [toEmail] },
    Message: {
      Body: {
        Html: {
          Charset: "UTF-8",
          Data: config.email.htmlTemplate(
            otp,
            config.email.otpExpirationWords,
            config.app.name,
            config.app.themeColor,
            config.app.logoUrl,
          ),
        },
        Text: {
          Charset: "UTF-8",
          Data: `Your one-time password is: ${otp}. It will expire in ${config.email.otpExpirationWords}`,
        },
      },
      Subject: {
        Charset: "UTF-8",
        Data: config.email.subject,
      },
    },
    Source: config.email.sourceEmail,
  });

  try {
    const response = await sesClient.send(command);
    console.log("Email sent successfully:", response.MessageId);
    return { success: true };
  } catch (error) {
    console.error("Failed to send email:", error);
    return { success: false, error: "Failed to send email" };
  }
}

export const loginSchema = z.object({
  email: z.string().email("Invalid email format"),
});

export const verifySchema = z.object({
  email: z.string().email(),
  otp: z.string().length(6, "OTP must be 6 digits"),
});
