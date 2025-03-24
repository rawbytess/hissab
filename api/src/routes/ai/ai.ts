import { Hono } from "hono";
import { getAIResponse, getGeminiModel } from "./gemini";
import { Bindings } from "../../envTypes";
import { cors } from "hono/cors";
import { AIResponseType } from "../../../../types/AIResponse";

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

  // const geminiModel = getGeminiModel(c.env.GEMINI_API_KEY);
  // const response = await getAIResponse(geminiModel, prompt);
  // const AIResponse = response.response.text();
  // return c.json({ AIResponse: JSON.parse(AIResponse) });
  await sleep(2000);
  const AIResponse: AIResponseType = {
    AIResponse: {
      expressions: ["1234+234", "now in taiwan"],
    },
  };
  return c.json(AIResponse);
});

export default app;

function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
