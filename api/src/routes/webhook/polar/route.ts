import { UserDB } from "@lib/db/UserDB";
import type { MetaBindings } from "@lib/types/envTypes";
import { addDaysToDate, addDaysToDateStr } from "@lib/utils";
import { Hono } from "hono";
import { HTTPException } from "hono/http-exception";
import { Webhook } from "standardwebhooks";
import {
  type ProductNames,
  products,
  type User,
} from "~lib/types/userMetadata";

const app = new Hono<MetaBindings>();

app.post(
  "/",
  async (c, next) => {
    const middleware = verifyWebhookSignature({
      secret: c.env.POLAR_WEBHOOK_SECRET,
    });
    return await middleware(c, next);
  },
  async (c) => {
    // const eventJSON = await c.req.json();
    // const event = WebhookOrderPaidPayload$inboundSchema.parse(eventJSON);
    const event = await c.req.json();
    const eventId = c.req.header("webhook-id");
    if (!eventId) {
      throw new HTTPException(400, { message: "Missing webhook ID" });
    }
    const db = new UserDB(c.env.USER_DB);

    if (event.type === "order.paid") {
      const data = event.data;
      const email = data.customer.email;
      const customerID = data.customer_id;
      let user: User | null = await db.getUserByEmail(email);
      if (!user) {
        user = await db.createUser(email);
      }

      if (!user)
        throw new Error(`User with email ${email} not found or created`);

      const isSubscription = data.subscription !== null;

      const endsAt = isSubscription
        ? data.subscription.current_period_end
        : addDaysToDateStr(
            data.created_at,
            products[data.product.name as ProductNames].expiryDays,
          );
      await db
        .insertUserPlan(
          eventId,
          user.id,
          customerID,
          data.created_at,
          endsAt,
          data.subscription?.id ?? null,
          data.product.name,
          isSubscription ? data.subscription?.status : data.status,
        )
        .catch((err) => {
          console.error("Error inserting user plan:", err, "Event:", event);
          return c.json(
            { success: false, error: "Error inserting user plan" },
            200,
          );
        });
      const name = data.customer.name;
      if (name !== null) await db.updateUserName(user.id, name);
    }

    return c.json({ success: true, message: "Webhook received" });
  },
);

export function verifyWebhookSignature({ secret }: { secret: string }) {
  return async (c: any, next: Function) => {
    const bodyBuffer = await c.req.text();
    const base64Secret = btoa(
      new TextDecoder().decode(new TextEncoder().encode(secret)),
    );
    const wh = new Webhook(base64Secret);
    const parsed = wh.verify(bodyBuffer, c.req.header());
    if (!parsed) {
      throw new HTTPException(403, { message: "Invalid webhook signature" });
    }
    await next();
  };
}

export default app;
