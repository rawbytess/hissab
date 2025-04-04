import { createMiddleware } from "hono/factory";
import { Bindings } from "@lib/types/envTypes";
import { z } from "zod";
import { zLSWebhook } from "@lib/types/lemonSqueezyTypes";

type LSWebhook = z.infer<typeof zLSWebhook>;

export const lsZod = createMiddleware<{
  Bindings: Bindings;
  Variables: {
    body: LSWebhook;
  }; // @ts-ignore
}>(async (c, next) => {
  const body = c.var.body;
  try {
    const validatedData: LSWebhook = zLSWebhook.parse(body);
    console.log("Validation successful:", validatedData);
  } catch (error) {
    return c.json({ error: "Invalid body" }, 422);
  }
  await next();
});
