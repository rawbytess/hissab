import { SupabaseClient, User } from "@supabase/supabase-js";
import { LSWebhook } from "@lib/types/lemonSqueezyTypes";

export type Bindings = {
  GEMINI_API_KEY: string;
  OPENAI_API_KEY: string;
  DEEPSEEK_API_KEY: string;
  LEMONSQUEEZY_SIGNING_SECRET: string;
  SUPABASE_API_URL: string;
  SUPABASE_ADMIN_KEY: string;
};
export type supabaseVars = {
  supabase: SupabaseClient;
};
export type userVars = {
  user: User;
} & supabaseVars;

export type lsVars = {
  body: LSWebhook;
} & userVars;
