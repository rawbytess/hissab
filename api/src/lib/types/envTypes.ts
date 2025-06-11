import { SupabaseClient } from "@supabase/supabase-js";
import { LSWebhook } from "@lib/types/lemonSqueezyTypes";
import { ProductNames, userMetadata } from "~lib/types/userMetadata";
import { UserRateLimiter } from "@lib/durableObjects/UserRateLimiter";
import { ModelSize } from "~lib/types/AITypes";

export type Bindings = {
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
  DEEPSEEK_API_KEY: string;
  LEMONSQUEEZY_SIGNING_SECRET: string;
  SUPABASE_PROJECT_URL: string;
  SUPABASE_ADMIN_KEY: string;
  SUPABASE_PROJECT_ANON_KEY: string;
  SUPABASE_JWT_SECRET: string;
  USER_RATE_LIMITER: DurableObjectNamespace<UserRateLimiter>;
  LOGS_DB: D1Database;
  PERPLEXITY_API_KEY: string;
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

export type MetaBindings = {
  Bindings: Bindings;
  Variables: userVars;
};

export interface LogData {
  prompt: string;
  history: any | null;
  line_number: number | null;
  results: any[] | null;
  final_answer: string | null;
}

export type RateLimitStorage = {
  model: ModelSize;
  count: number;
  timezone: string;
};

export type CreateUser = {
  name: string;
  email: string;
  tier?: ProductNames;
  expirationDays?: number;
  expirationMonths?: number;
  expirationYears?: number;
  timezone: string;
  demo?: number;
};
