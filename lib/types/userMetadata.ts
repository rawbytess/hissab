import { z } from "zod";

export const zProductNames = z.enum(["AI Lite", "AI Plus"]);
export const zSubscriptionStatus = z.enum([
  "on_trial",
  "active",
  "paused",
  "cancelled",
  "past_due",
  "expired",
]);

export type ProductNames = z.infer<typeof zProductNames>;
export type SubscriptionStatus = z.infer<typeof zSubscriptionStatus>;

export type userMetadata = {
  user_name: string;
  timezone: string;
  subscription: {
    status: SubscriptionStatus;
    renews_at: string;
    ends_at: string | null;
    created_at: string;
    updated_at: string;
    product_name: ProductNames;
    variant_name: string;
  };
  lifetime:
    | [
        {
          product_name: string;
          variant_name: string;
          created_at: string;
          updated_at: string;
        },
      ]
    | null;
};
