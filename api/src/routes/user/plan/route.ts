import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { Bindings } from "../../../types/envTypes";
import { cors } from "hono/cors";
import { supabaseAppAuth } from "../../../middlewares/supabaseAppAuth";

const app = new Hono<{ Bindings: Bindings; Variables: { user: {} } }>();
app.use("/*", cors());
app.use("/*", supabaseAppAuth);

app.get("/", async (c) => {
  const supabase = createClient(
    c.env.SUPABASE_API_URL,
    c.env.SUPABASE_ADMIN_KEY,
  );

  console.log(c.var.user);
  return c.json({ val: c.var.user });

  //const { data, error } = await supabase.from("plans").select("*");

  //return c.json({ data });
});
export default app;
