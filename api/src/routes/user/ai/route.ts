import { Hono } from "hono";
import { Gemini } from "@lib/ai/gemini";
import { Bindings, userVars } from "@lib/types/envTypes";
import { cors } from "hono/cors";
import { supabaseAppAuth } from "@middlewares/supabaseAppAuth";
import { getMaxCharacterLimit, isPremiumUser } from "~lib/getPremiumStatus";
import { zValidator } from "@hono/zod-validator";

import { Models, ModelsMap, zAIRequest } from "~lib/types/AITypes";
import { createSupabaseClient } from "@middlewares/createSupabaseClient";
import { run } from "~lib/errors";
import { ContentfulStatusCode } from "hono/dist/types/utils/http-status";
import { sleep } from "~lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { ProductNames } from "~lib/types/userMetadata";
import { UserRateLimiter } from "@lib/durableObjects/UserRateLimiter";
import systemInstructions from "@lib/ai/instructions/system-instructions";

const app = new Hono<{
  Bindings: Bindings;
  Variables: userVars;
}>();
app.use(cors());
app.use(createSupabaseClient);
app.use(supabaseAppAuth);

app.post(
  "/",
  zValidator("json", zAIRequest, (result, c) => {
    if (!result.success) return c.text("Invalid request", 400);
    return;
  }),
  async (c) => {
    const { user, supabase } = c.var;
    const body = c.req.valid("json");
    const isPremium = isPremiumUser(user);
    if (!isPremium) {
      return c.body("Not a subscribed user", 403);
    }
    const modelName = body.model;

    const id = c.env.USER_RATE_LIMITER.idFromName(user.user_id);
    const rateLimiter = c.env.USER_RATE_LIMITER.get(id);

    const hasRateLimit = await rateLimiter.checkRateLimit(
      isPremium,
      ModelsMap[modelName].size,
    );
    console.log(hasRateLimit);
    if (!hasRateLimit) {
      return c.body(
        `Today's rate limit exceeded for ${ModelsMap[modelName].size} models`,
        429,
      );
    }
    const sysInst = systemInstructions(body.explain, body.fallback);

    const geminiModel = new Gemini(c.env.GEMINI_API_KEY, modelName);
    const maxPromptLength = getMaxCharacterLimit(
      user.subscription.product_name,
    );
    const sliced_prompt =
      body.prompt.length > maxPromptLength
        ? body.prompt.slice(0, maxPromptLength)
        : body.prompt;

    const prompt = body.inline
      ? `Note: This prompt is on line ${body.lineNumber}. All lines on the page are ${body.expressions
          .map((x, i) => `${x.expression} :: Result: ${x.result}`)
          .join("\n")}
      If the prompt reference any previous lines or results please use the previous line numbers in the output expressions.

      User Prompt: ${sliced_prompt}
      `
      : `Note: History of previous conversations: ${body.history}
        User Prompt: ${sliced_prompt}
    `;

    const AIResponse = await run(
      geminiModel.getExpressions(sysInst, prompt, body.file, isPremium),
    );
    /* const AIResponse = {
      data: {
        naturalAnswer: "",
        expressions: [],
      },
      failed: false,
      error: { message: "Error", userMessage: "Error", statusCode: 500 },
    }; */

    if (AIResponse.failed) {
      c.executionCtx.waitUntil(
        logData(
          supabase,
          {
            prompt: body.prompt,
            history: body.inline ? body.expressions : body.history,
            line_number: body.inline ? body.lineNumber : null,
            results: null,
            final_answer: null,
          },
          null,
          isPremium,
          modelName,
        ),
      );
      console.error({ message: AIResponse.error.message });
      return c.body(
        AIResponse.error.userMessage,
        AIResponse.error.statusCode as ContentfulStatusCode,
      );
    }
    c.executionCtx.waitUntil(
      logData(
        supabase,
        {
          prompt: body.prompt,
          history: body.inline ? body.expressions : body.history,
          line_number: body.inline ? body.lineNumber : null,
          results: AIResponse.data.expressions,
          final_answer: AIResponse.data.naturalAnswer,
        },
        rateLimiter,
        isPremium,
        modelName,
      ),
    );

    return c.json(AIResponse.data, 200);
  },
);

async function logData(
  supabase: SupabaseClient,
  log: {},
  rateLimiter: DurableObjectStub<UserRateLimiter> | null,
  isPremium: ProductNames,
  modelName: Models,
) {
  if (rateLimiter)
    await rateLimiter.incrementRateLimit(isPremium, ModelsMap[modelName].size);
  const { error } = await supabase.from("prompts").insert(log);
  if (error) {
    console.error(log, error);
  }
}

export default app;
