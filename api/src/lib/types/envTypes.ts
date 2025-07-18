import type { UserRateLimiter } from "@lib/durableObjects/UserRateLimiter";
import type { LSWebhook } from "@lib/types/lemonSqueezyTypes";
import type { SupabaseClient } from "@supabase/supabase-js";
import type { ModelSize } from "~lib/types/AITypes";
import type { ProductNames, userMetadata } from "~lib/types/userMetadata";

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
	USER_DB: D1Database; // The D1 Database binding for user data
	PERPLEXITY_API_KEY: string;
	AWS_ACCESS_KEY_ID: string; // AWS access key ID for SES
	AWS_SECRET_ACCESS_KEY: string; // AWS secret access key
	POLAR_WEBHOOK_SECRET: string; // Secret for verifying Polar webhooks
	POLAR_ACCESS_TOKEN: string; // Access token for Polar API
	JWT_SECRET: string; // Secret for signing access tokens
	JWT_REFRESH_SECRET: string; // Secret for signing refresh tokens
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
