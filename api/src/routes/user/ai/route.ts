import { Hono } from "hono";
import { Gemini } from "@lib/ai/gemini";
import { Bindings, userVars } from "@lib/types/envTypes";
import { cors } from "hono/cors";
import { supabaseAppAuth } from "@middlewares/supabaseAppAuth";
import { User } from "@supabase/supabase-js";
import { userMetadata } from "../../../../../lib/types/userMetadata";
import { isPremiumUser } from "../../../../../lib/getPremiumStatus";
import { modelMap } from "@lib/utils";
import { zValidator } from "@hono/zod-validator";

import {
  AIExpressionsType,
  AIFormatResponseType,
  AIRequest,
  AIResponseType,
  zAIRequest,
} from "../../../../../lib/types/AITypes";
import { createSupabaseClient } from "@middlewares/createSupabaseClient";
import { calculateExpressions } from "../../../../../lib/calculateExpressions";
import { Variables } from "engine";
import { NaturalAnswerType } from "@lib/ai/jsonSchema";
import { sleep } from "../../../../../lib/utils";

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
  const userMetadata = user.user_metadata as userMetadata;
  const isPremium = isPremiumUser(userMetadata);
  if (!isPremium) {
    return c.json({ error: "Not a premium user" }, 405);
  }
  const modelName = body.inline
    ? "gemini-2.0-flash-lite"
    : modelMap[userMetadata.subscription.product_name as "AI Lite" | "AI Plus"];

  await sleep(1000);
  const response: AIFormatResponseType = {
    naturalAnswer: "This is Answer",
    expressions: [
      { expression: "1+1", result: "2" },
      { expression: "2+2", result: "4" },
    ],
  };
  return c.json(response);

  /*
  const geminiModel = new Gemini(c.env.GEMINI_API_KEY, modelName);
  const prompt = body.inline
    ? `Note: This prompt is on line ${body.lineNumber}. All lines on the page are ${body.expressions
        .map((x, i) => `Line ${i}: ${x.expression} :: Result: ${x.result}`)
        .join("\n")}
      If the prompt reference any previous lines or results please use the previous line numbers in the output expressions.

      User Prompt: ${body.prompt}
      `
    : `Note: History of previous conversations: ${body.history}
        User Prompt: ${body.prompt}
    `;
  const AIResponse = await geminiModel.getExpressions(prompt);

  if (!AIResponse || !AIResponse?.text) {
    return c.json({ error: "Error" }, 510);
  }

  const aiResp = JSON.parse(AIResponse.text) as AIExpressionsType; // check is AIResponse is AIExpressionsType
  if (aiResp.expressions.length === 0) {
    return c.json({ error: "No expressions found" }, 510);
  }
  const localVariables: Variables = {};
  const results = await calculateExpressions(
    aiResp.expressions,
    localVariables,
    isPremium,
  );

  const aiNaturalResp = await geminiModel.getNaturalAnswer(
    JSON.stringify(results),
  );
  if (!aiNaturalResp || !aiNaturalResp?.text) {
    return c.json({ error: "Error" }, 510);
  }

  const naturalAnswer = JSON.parse(aiNaturalResp.text) as NaturalAnswerType;
  const response: AIFormatResponseType = {
    naturalAnswer: naturalAnswer.naturalAnswer,
    expressions: results,
  };
  return c.json(response); */
});

export default app;
