import { createMiddleware } from "hono/factory";
import { Bindings, userVars } from "@lib/types/envTypes";
import { HTTPException } from "hono/http-exception";

export const supabaseAppAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: userVars;
}>(async (c, next) => {
  const refresh_token = c.req.header("Refresh");
  const access_token = c.req.header("Authorization")?.split(" ")[1];
  const { supabase } = c.var;
  const { data, error } = await supabase.auth.getUser(access_token);

  if (data.user) {
    c.set("user", data.user);
  }
  // TODO: handle error properly
  if (error) {
    console.error("Error while getting user by access_token ", error);
    if (!refresh_token) {
      throw new HTTPException(403, { message: "No refresh token" });
    }

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
      c.set("user", refreshed.user);
    }
  }

  await next();
});
