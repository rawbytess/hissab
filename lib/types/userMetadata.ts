import { z } from "zod";

export const zProductNames = z.enum([
  "AI Lite",
  "AI Plus",
  "Some",
  "Handful",
  "Plenty",
  "Buttload",
]);
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
export type Product = Record<ProductNames, ProductDetails>;

export const products: Product = {
  Some: { type: "credits", price: 5, credits: 10, expiryDays: 100 },
  Handful: { type: "credits", price: 20, credits: 100, expiryDays: 300 },
  Plenty: { type: "credits", price: 100, credits: 1000, expiryDays: 500 },
  Buttload: { type: "credits", price: 500, credits: 10000, expiryDays: 1000 },
  "AI Lite": { type: "subscription", price: 0, credits: 0, expiryDays: 0 },
  "AI Plus": { type: "subscription", price: 0, credits: 0, expiryDays: 0 },
};

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

export type UserMetadata = {
  name?: string;
  timezone?: string; // e.g., 'America/New_York'
  credits?: {
    credits?: number; // Total credits available
    almostExpired?: number; // If credits are about to expire
  };
  subscription?: {
    status: SubscriptionStatus;
    renews_at: string | null;
    ends_at: string | null;
    created_at: string;
    updated_at: string | null;
    product_name: ProductNames;
  };
  lifetime?: {
    product_name: string;
    created_at: string;
  };
};

export type CreditsDetails = {
  type: "credits";
  price: number;
  credits: number;
  expiryDays: number;
};
export type SubscriptionDetails = {
  type: "subscription";
  price: number;
  credits: number;
  expiryDays: number;
};
export type LifetimeDetails = {
  type: "lifetime";
  price: number;
};

export type ProductDetails = CreditsDetails | SubscriptionDetails;
export type UserStatus =
  | "unverified"
  | "active"
  | "inactive"
  | "banned"
  | "demo";
export type User = {
  id: string;
  email: string;
  name?: string | null;
  timezone?: string | null;
  status: UserStatus;
};

export type JWTPayload = {
  sub: string;
  email: string;
  exp: number;
  metadata: UserMetadata;
};

export type DemoUser = {
  id: string; // Unique identifier for the demo user
  email: string; // Email address of the demo user
  otp: string;
  expires_at: string;
  created_at: string; // ISO date string
};

export type UserPlan = {
  user_id: string; // Unique identifier for the user
  customer_id: string; // Unique identifier for the customer
  created_at: string; // ISO date string when the plan was created
  ends_at: string | null; // ISO date string when the plan ends, or null if it doesn't end
  renews_at: string | null; // ISO date string when the plan renews, or null if it doesn't renew
  updated_at: string; // ISO date string when the plan was last updated
  subscription_id: string | null; // Unique identifier for the subscription, or null if not applicable
  product_name: ProductNames; // Name of the product associated with the plan
  status: string; // Status of the plan (e.g., active, cancelled)
};
