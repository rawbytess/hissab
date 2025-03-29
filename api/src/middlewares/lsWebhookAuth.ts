import { createMiddleware } from "hono/factory";
import { Bindings } from "../types/envTypes";
import { hexToUint8Array } from "../lib/utils";

export const lsWebhookAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: {
    body: {};
  }; // @ts-ignore
}>(async (c, next) => {
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
  // console.log("Body: ", body);
  const verified = await crypto.subtle.verify(
    "HMAC",
    key,
    hexToUint8Array(signature),
    rawBody,
  );
  console.log("Verified: ", verified);
  if (!verified) {
    return c.json({ error: "Unauthorized" }, 401);
  }

  const verifiedBody = JSON.parse(body);

  c.set("body", verifiedBody);

  await next();
});
