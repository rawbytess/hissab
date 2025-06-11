import { createMiddleware } from "hono/factory";
import { Bindings, lsVars } from "@lib/types/envTypes";
import { HTTPException } from "hono/http-exception";

export const adminAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: lsVars;
}>(async (c, next) => {
  const authHeader = c.req.header("Authorization");
  const adminKey = c.env.SUPABASE_ADMIN_KEY;

  if (!authHeader || !adminKey) {
    throw new HTTPException(403, { message: "Unauthorized" });
  }

  const [scheme, token] = authHeader.split(" ");
  if (scheme !== "Bearer" || token !== adminKey) {
    throw new HTTPException(403, { message: "Unauthorized" });
  }

  await next();
});
