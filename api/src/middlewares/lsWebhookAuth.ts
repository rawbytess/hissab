import { createMiddleware } from "hono/factory";
import { Bindings, lsVars } from "@lib/types/envTypes";
import { hexToUint8Array } from "@lib/utils";
import { HTTPException } from "hono/http-exception";

export const lsWebhookAuth = createMiddleware<{
  Bindings: Bindings;
  Variables: lsVars;
}>(async (c, next) => {
  const signature = c.req.header("X-Signature");
  const secret = c.env.LEMONSQUEEZY_SIGNING_SECRET;

  if (!signature || !secret) {
    throw new HTTPException(403, { message: "Invalid signature" });
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
    throw new HTTPException(403, { message: "Invalid signature" });
  }

  const verifiedBody = JSON.parse(body);
  c.set("body", verifiedBody);
  await next();
});
