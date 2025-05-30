import { createMiddleware } from "hono/factory";
import { Bindings, supabaseVars } from "@lib/types/envTypes";
import { createClient } from "@supabase/supabase-js";

export const createSupabaseClient = createMiddleware<{
  Bindings: Bindings;
  Variables: supabaseVars;
}>(async (c, next) => {
  const supabase = createClient(
    c.env.SUPABASE_PROJECT_URL,
    c.env.SUPABASE_ADMIN_KEY,
  );
  c.set("supabase", supabase);
  await next();
});
