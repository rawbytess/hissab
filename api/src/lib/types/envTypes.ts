import { SupabaseClient } from "@supabase/supabase-js";
import { LSWebhook } from "@lib/types/lemonSqueezyTypes";
import { userMetadata } from "~lib/types/userMetadata";
import { UserRateLimiter } from "@lib/durableObjects/UserRateLimiter";

export type Bindings = {
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
  DEEPSEEK_API_KEY: string;
  LEMONSQUEEZY_SIGNING_SECRET: string;
  SUPABASE_API_URL: string;
  SUPABASE_ADMIN_KEY: string;
  SUPABASE_PUBLIC_KEY: string;
  SUPABASE_JWT_SECRET: string;
  USER_RATE_LIMITER: DurableObjectNamespace<UserRateLimiter>;
};
export type supabaseVars = {
  supabase: SupabaseClient;
};
export type userVars = {
  user: userMetadata & { user_id: string };
} & supabaseVars;

export type lsVars = {
  body: LSWebhook;
} & userVars;
