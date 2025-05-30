import { createMiddleware } from "hono/factory";
import { Bindings, userVars } from "@lib/types/envTypes";
import { HTTPException } from "hono/http-exception";
import { verify } from "hono/jwt";
import { userMetadata } from "~lib/types/userMetadata";
import { run } from "~lib/errors";

export const supabaseAppAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: userVars;
}>(async (c, next) => {
  const access_token = c.req.header("Authorization")?.split(" ")[1];
  if (!access_token) {
    throw new HTTPException(403, { message: "No access token" });
  }
  const result = await run(verify(access_token, c.env.SUPABASE_JWT_SECRET));

  if (result.failed) {
    const refresh_token = c.req.header("Refresh");
    if (!refresh_token) {
      throw new HTTPException(403, { message: "No refresh token" });
    }
    const { supabase } = c.var;
    const { data: refreshed, error: refreshError } =
      await supabase.auth.refreshSession({
        refresh_token,
      });

    if (refreshError) {
      console.error("Error while refreshing token", refreshError);
      throw new HTTPException(403, {
        message: " Error while refreshing token",
      });
    }

    if (refreshed.user) {
      c.set("user", {
        ...(refreshed.user.user_metadata as userMetadata),
        user_id: refreshed.user.id,
      });
    }
  } else {
    c.set("user", {
      ...(result.data.user_metadata as userMetadata),
      user_id: result.data.id as string,
    });
  }
  await next();
});
