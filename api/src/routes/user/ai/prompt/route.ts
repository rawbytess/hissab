import { Hono } from "hono";
import { getAIResponse, getGeminiModel } from "../../../../lib/ai/gemini";
import { Bindings } from "../../../../types/envTypes";
import { cors } from "hono/cors";
import { AIResponseType } from "../../../../../../lib/types/AIResponse";
import { chatDeepseek } from "../../../../lib/ai/deepseek";
import OpenAI from "openai";

const app = new Hono<{ Bindings: Bindings }>();
app.use("/*", cors());

app.post("/prompt", async (c) => {
  const requestBody = await c.req.json();
  const prompt = requestBody["prompt"];
  if (typeof prompt !== "string") {
    return c.json({ error: "Bad request. No prompt found." }, 400);
  }
  if (prompt === "Error") {
    return c.json({ error: "Error" }, 400);
  }
  console.log("Prompt: ", prompt);

  const openai = new OpenAI({
    baseURL: "https://api.deepseek.com",
    apiKey: c.env.DEEPSEEK_API_KEY,
  });

  const AIResponse = await chatDeepseek(openai, prompt);
  if (!AIResponse) {
    return c.json({ error: "Error" }, 400);
  }
  return c.json({ AIResponse: JSON.parse(AIResponse) });

  /*
    const geminiModel = getGeminiModel(c.env.GEMINI_API_KEY);
    const response = await getAIResponse(geminiModel, prompt);
    const AIResponse = response.response.text();
    return c.json({ AIResponse: JSON.parse(AIResponse) });
    await sleep(2000);
    const AIResponse: AIResponseType = {
      AIResponse: {
        expressions: ["1234+234", "now in taiwan"],
      },
    };
    return c.json(AIResponse);
    */
});

export default app;
