import { Hono } from "hono";
import { createClient } from "@supabase/supabase-js";
import { Bindings } from "../../envTypes";
import { cors } from "hono/cors";

const app = new Hono<{ Bindings: Bindings }>();
app.use("/*", cors());

app.post("/webhook", async (c) => {
  const signature = c.req.header("X-Signature");
  const secret = c.env.LEMONSQUEEZY_SIGNING_SECRET;

  if (!signature || !secret) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const key = await crypto.subtle.importKey(
    "raw",
    new TextEncoder().encode(secret),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["verify"],
  );

  const body = await c.req.text();
  const rawBody = new TextEncoder().encode(body);

  const verified = await crypto.subtle.verify(
    "HMAC",
    key,
    hexToUint8Array(signature),
    rawBody,
  );

  if (!verified) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const bodyJson = JSON.parse(body);

  const supabase = createClient(
    c.env.SUPABASE_API_URL,
    c.env.SUPABASE_ADMIN_KEY,
  );

  const eventName = bodyJson?.meta?.event_name;
  console.log(bodyJson);

  return c.json({ ok: true });
});

export default app;

function hexToUint8Array(hex: string) {
  const x = hex.match(/.{1,2}/g);
  if (!x) {
    return new Uint8Array();
  }
  return new Uint8Array(x.map((byte) => parseInt(byte, 16)));
}
