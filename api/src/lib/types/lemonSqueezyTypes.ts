import { z } from "zod";

export const zSubscriptionObject = z.object({
  meta: z.object({
    test_mode: z.boolean(),
    webhook_id: z.string(),
    event_name: z.enum([
      "subscription_created",
      "subscription_updated",
      "subscription_cancelled",
      "subscription_paused",
      "subscription_unpaused",
      "subscription_resumed",
      "subscription_expired",
    ]),
  }),
  data: z.object({
    type: z.literal("subscriptions"),
    id: z.string(),
    attributes: z.object({
      customer_id: z.number(),
      order_id: z.number(),
      user_email: z.string().email(),
      user_name: z.string(),
      product_name: z.string(),
      variant_name: z.string(),
      status: z.enum([
        "on_trial",
        "active",
        "paused",
        "cancelled",
        "past_due",
        "expired",
      ]),
      cancelled: z.boolean(),
      renews_at: z.string(),
      ends_at: z.string(),
      created_at: z.string(),
      updated_at: z.string(),
      first_subscription_item: z.object({
        subscription_id: z.number(),
      }),
    }),
  }),
});

export const zOrderObject = z.object({
  meta: z.object({
    test_mode: z.boolean(),
    webhook_id: z.string(),
    event_name: z.enum(["order_created", "order_refunded"]),
  }),
  data: z.object({
    type: z.literal("orders"),
    id: z.string(),
    attributes: z.object({
      user_name: z.string(),
      user_email: z.string().email(),
    }),
  }),
});

export const zLSWebhook = z.union([zSubscriptionObject, zOrderObject]);
export type SubscriptionObject = z.infer<typeof zSubscriptionObject>;
export type OrderObject = z.infer<typeof zOrderObject>;
export type LSWebhook = z.infer<typeof zLSWebhook>;
