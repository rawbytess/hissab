import { Hono } from "hono";
import { Gemini } from "@lib/ai/gemini";
import { Bindings, LogData, MetaBindings, userVars } from "@lib/types/envTypes";
import { cors } from "hono/cors";
import { supabaseAppAuth } from "@middlewares/supabaseAppAuth";
import { getMaxCharacterLimit, isPremiumUser } from "~lib/getPremiumStatus";
import { zValidator } from "@hono/zod-validator";

import { Models, ModelsList, ModelsMap, zAIRequest } from "~lib/types/AITypes";
import { createSupabaseClient } from "@middlewares/createSupabaseClient";
import { run } from "~lib/errors";
import { ContentfulStatusCode } from "hono/dist/types/utils/http-status";
import { sleep } from "~lib/utils";
import { SupabaseClient } from "@supabase/supabase-js";
import { ProductNames } from "~lib/types/userMetadata";
import { UserRateLimiter } from "@lib/durableObjects/UserRateLimiter";
import systemInstructions from "@lib/ai/instructions/system-instructions";

const app = new Hono<MetaBindings>();
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
    const modelName = ModelsList[body.model].id;

    const id = c.env.USER_RATE_LIMITER.idFromName(user.user_id);
    const rateLimiter = c.env.USER_RATE_LIMITER.get(id);

    const hasRateLimit = await rateLimiter.checkRateLimit(
      isPremium,
      body.model,
      user.timezone,
      user.user_id,
    );
    if (!hasRateLimit) {
      return c.body(
        `Today's rate limit exceeded for ${body.model} models`,
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
    /*const AIResponse = {
      data: {
        naturalAnswer: "My answer is this",
        expressions: [],
      },
      failed: false,
      error: { message: "Error", userMessage: "Error", statusCode: 500 },
    };*/
    const db = c.env.LOGS_DB;

    if (AIResponse.failed) {
      c.executionCtx.waitUntil(
        logData(
          db,
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
          user.timezone,
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
        db,
        {
          prompt: body.prompt,
          history: body.inline ? body.expressions : body.history,
          line_number: body.inline ? body.lineNumber : null,
          results:
            AIResponse.data.expressions.length > 0
              ? AIResponse.data.expressions
              : null,
          final_answer: AIResponse.data.naturalAnswer,
        },
        rateLimiter,
        isPremium,
        modelName,
        user.timezone,
      ),
    );

    return c.json(AIResponse.data, 200);
  },
);

async function logData(
  db: D1Database,
  log: LogData,
  rateLimiter: DurableObjectStub<UserRateLimiter> | null,
  isPremium: ProductNames,
  modelName: Models,
  timezone: string,
) {
  if (rateLimiter)
    await rateLimiter.incrementRateLimit(
      isPremium,
      ModelsMap[modelName].size,
      timezone,
    );
  await db
    .prepare(
      `INSERT INTO interactions (model, prompt, history, line_number, results, final_answer)
    VALUES (?, ?, ?, ?, ?, ?)`,
    )
    .bind(
      modelName,
      log.prompt,
      log.history ? JSON.stringify(log.history) : null,
      log.line_number,
      log.results ? JSON.stringify(log.results) : null,
      log.final_answer,
    )
    .run();
}

export default app;
