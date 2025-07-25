import { Part } from "@google/genai";
import { zValidator } from "@hono/zod-validator";
import { Gemini } from "@lib/ai/gemini";
import systemInstructions from "@lib/ai/instructions/system-instructions";
import { UserDB } from "@lib/db/UserDB";
import type { UserRateLimiter } from "@lib/durableObjects/UserRateLimiter";
import type { LogData, MetaBindings } from "@lib/types/envTypes";
import { Hono, type MiddlewareHandler } from "hono";
import { getCookie } from "hono/cookie";
import { cors } from "hono/cors";
import type { ContentfulStatusCode } from "hono/dist/types/utils/http-status";
import { verify } from "hono/jwt";
import { run } from "~lib/errors";
import { getMaxCharacterLimit, isPremiumUser } from "~lib/getPremiumStatus";
import {
  type Models,
  ModelsList,
  ModelsMap,
  zAIRequest,
} from "~lib/types/AITypes";
import type { ProductNames } from "~lib/types/userMetadata";
import { sleep } from "~lib/utils";

const app = new Hono<MetaBindings>();
app.use(
  cors({
    origin: [
      "https://hissab.app",
      "https://app.hissab.app",
      "http://localhost:5173",
    ],
    allowMethods: ["POST"],
    allowHeaders: ["Content-Type", "Authorization"],
    credentials: true,
  }),
);

export const authMiddleware: MiddlewareHandler = async (c, next) => {
  const token = getCookie(c, "access_token");
  if (!token) {
    return c.json({ error: "Unauthorized: No access token" }, 401);
  }
  try {
    const payload = await verify(token, c.env.JWT_SECRET);
    c.set("user", payload);
    await next();
  } catch (err) {
    return c.json({ error: "Unauthorized: Invalid token" }, 401);
  }
  return c.json({ error: "Unauthorized: Invalid token" }, 401);
};

app.post(
  "/",
  authMiddleware,
  zValidator("json", zAIRequest, (result, c) => {
    if (!result.success) return c.text("Invalid request", 400);
    return;
  }),
  async (c) => {
    const { user } = c.var;
    const body = c.req.valid("json");
    const userdb = new UserDB(c.env.USER_DB);
    const plansdb = await userdb.getActiveUserPlans(user.sub);
    const plans = plansdb.map((p) => p.product_name);
    // const isPremium = isPremiumUser(user);

    if (plans.length === 0) {
      return c.body("Not a subscribed user", 403);
    }
    const modelName = ModelsList[body.model].id;

    const id = c.env.USER_RATE_LIMITER.idFromName(user.sub);
    const rateLimiter = c.env.USER_RATE_LIMITER.get(id);

    const hasRateLimit = await rateLimiter.checkRateLimit(
      plans,
      body.model,
      user.metadata.timezone || "UTC",
      user.sub,
    );
    if (!hasRateLimit) {
      return c.body(
        `Today's rate limit exceeded for ${body.model} models`,
        429,
      );
    }
    const sysInst = systemInstructions(
      body.explain,
      body.fallback,
      plans.includes("AI Lite"),
    );

    const geminiModel = new Gemini(c.env.GEMINI_API_KEY, modelName);
    // const openAI = initOpenAI(c.env.GEMINI_API_KEY, "gemini");
    const maxPromptLength = getMaxCharacterLimit(
      user?.metadata?.subscription?.product_name || "free",
    );
    const sliced_prompt =
      body.prompt.length > maxPromptLength
        ? body.prompt.slice(0, maxPromptLength)
        : body.prompt;
    const history: {}[] = [];

    if (body.inline)
      history.push({
        role: "model",
        parts: [
          {
            text: `Note: All lines on the page are ${body.expressions
              .map((x) => `${x.expression} :: Result: ${x.result}`)
              .join("\n")}
      If the prompt reference any previous lines or results please use the previous line numbers in the output expressions.
      User prompt is on line ${body.lineNumber}.`,
          },
        ],
      });
    else {
      const parts: {}[] = body.history.map((chat) => {
        return {
          role: chat.role,
          parts: [{ text: chat.content }],
        };
      });
      history.push(...parts);
    }

    const AIResponse = await run(
      geminiModel.getExpressions(
        sysInst,
        sliced_prompt,
        history,
        body.file,
        plans,
        c.env.PERPLEXITY_API_KEY,
        c.env.FILES_R2_BUCKET,
      ),
      // generate(openAI, modelName, sysInst, prompt, body.file, isPremium),
    );

    const AIResponse1 = {
      data: {
        naturalAnswer: "My answer is this",
        expressions: [],
      },
      failed: false,
      error: { message: "Error", userMessage: "Error", statusCode: 500 },
    };

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
          plans,
          modelName,
          user.metadata.timezone || "UTC",
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
        plans,
        modelName,
        user.metadata.timezone || "UTC",
      ),
    );

    return c.json(AIResponse.data, 200);
  },
);

async function logData(
  db: D1Database,
  log: LogData,
  rateLimiter: DurableObjectStub<UserRateLimiter> | null,
  plans: ProductNames[],
  modelName: Models,
  timezone: string,
) {
  if (rateLimiter)
    await rateLimiter.incrementRateLimit(
      plans,
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
