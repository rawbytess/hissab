import { createMiddleware } from "hono/factory";
import { createClient, User } from "@supabase/supabase-js";
import { Bindings } from "@lib/types/envTypes";
import { HTTPException } from "hono/http-exception";

export const supabaseAppAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: {
    user: { user: User };
  };
}>(async (c, next) => {
  const refresh_token = c.req.header("Refresh");
  const access_token = c.req.header("Authorization")?.split(" ")[1];

  console.log("Access token: ", access_token);
  const supabase = createClient(
    c.env.SUPABASE_API_URL,
    c.env.SUPABASE_ADMIN_KEY,
  );
  const { data, error } = await supabase.auth.getUser(access_token);

  if (data.user) {
    c.set("user", { user: data.user });
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
      c.set("user", {
        user: refreshed.user,
      });
    }
  }

  await next();
});
