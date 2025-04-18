import { Hono } from "hono";
import { Gemini, getPromptWithHistory } from "@lib/ai/gemini";
import { Bindings, userVars } from "@lib/types/envTypes";
import { cors } from "hono/cors";
import { supabaseAppAuth } from "@middlewares/supabaseAppAuth";
import { User } from "@supabase/supabase-js";
import { userMetadata } from "~lib/types/userMetadata";
import { getMaxCharacterLimit, isPremiumUser } from "~lib/getPremiumStatus";
import { modelMap } from "@lib/utils";
import { zValidator } from "@hono/zod-validator";

import {
  AIFormatResponseType,
  AIRequest,
  HissabExpType,
  zAIRequest,
  zHissabExp,
  zNaturalAnswer,
} from "~lib/types/AITypes";
import { createSupabaseClient } from "@middlewares/createSupabaseClient";
import { Variables } from "engine";
import { z } from "zod";
import { run } from "~lib/errors";
import { sleep } from "~lib/utils";
import { calculateExpressions } from "~lib/calculateExpressions";
import { ContentfulStatusCode } from "hono/dist/types/utils/http-status";

const app = new Hono<{
  Bindings: Bindings;
  Variables: userVars;
}>();
app.use(cors());
app.use(createSupabaseClient);
app.use(supabaseAppAuth);

app.post("/", zValidator("json", zAIRequest), async (c) => {
  const { user } = c.var;
  const body = c.req.valid("json");
  const isPremium = isPremiumUser(user);
  if (!isPremium) {
    return c.body("Not a subscribed user", 403);
  }
  const modelName = body.inline
    ? "gemini-2.0-flash-lite"
    : modelMap[user.subscription.product_name as "AI Lite" | "AI Plus"];

  const geminiModel = new Gemini(c.env.GEMINI_API_KEY, modelName);
  const maxPromptLength = getMaxCharacterLimit(user.subscription.product_name);
  if (body.prompt.length > maxPromptLength) {
    body.prompt = body.prompt.slice(0, maxPromptLength);
  }
  const prompt = getPromptWithHistory(body);
  const AIResponse = await run(geminiModel.getExpressions(prompt));
  if (AIResponse.failed) {
    console.error({ message: AIResponse.error.message });
    return c.body(
      AIResponse.error.userMessage,
      AIResponse.error.statusCode as ContentfulStatusCode,
    );
  }
  // TODO Log prompt with AIResponse expressions

  const results = await run(
    calculateExpressions(AIResponse.data.data.expressions, isPremium),
  );
  if (results.failed) {
    return c.body("Something went wrong", 500);
  }
  if (results.data.some((x) => x.error)) {
    console.warn({ expressions: results.data, prompt: body.prompt });
    return c.json(
      {
        naturalAnswer: "Some of the expressions did not produce results",
        expressions: results.data,
      },
      206,
    );
  }
  const aiNaturalResp = await run(
    geminiModel.getNaturalAnswer(
      JSON.stringify(
        results.data.map(
          (x, i) => `Line${i + 1}: ${x.expression} :: Result: ${x.result}`,
        ),
      ),
    ),
  );
  if (aiNaturalResp.failed) {
    console.error({ message: aiNaturalResp.error.message });
    return c.body(
      aiNaturalResp.error.userMessage,
      aiNaturalResp.error.statusCode as ContentfulStatusCode,
    );
  }
  const response: AIFormatResponseType = {
    naturalAnswer: aiNaturalResp.data.naturalAnswer,
    expressions: results.data,
  };
  return c.json(response);
});

export default app;
