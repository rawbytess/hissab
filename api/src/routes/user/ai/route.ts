import { Hono } from "hono";
import { Gemini } from "@lib/ai/gemini";
import { Bindings } from "@lib/types/envTypes";
import { cors } from "hono/cors";
import { supabaseAppAuth } from "@middlewares/supabaseAppAuth";
import { User } from "@supabase/supabase-js";
import { userMetadata } from "../../../../../lib/types/userMetadata";
import { isPremiumUser } from "../../../../../lib/getPremiumStatus";
import { modelMap } from "@lib/utils";
import { validator } from "hono/validator";

const app = new Hono<{
  Bindings: Bindings;
  Variables: { user: { user: User } };
}>();
app.use(cors());
app.post(
  "/",
  supabaseAppAuth,
  validator("json", (value, c) => {
    console.log(value);
    if (typeof value !== "object" || !value.prompt) {
      return { error: "Bad request. No prompt found." };
    }
    return null;
  }),
  async (c) => {
    const { user } = c.var.user;
    const userMetadata = user.user_metadata as userMetadata;
    const isPremium = isPremiumUser(userMetadata);
    if (!isPremium) {
      return c.json({ error: "Not a premium user" }, 405);
    }
    const modelName =
      modelMap[
        userMetadata.subscription.product_name as "AI Lite" | "AI Plus"
      ] ?? "gemini-1.0-flash-lite";
    const requestBody = await c.req.json();
    const prompt = requestBody["prompt"];
    if (typeof prompt !== "string") {
      return c.json({ error: "Bad request. No prompt found." }, 402);
    }
    if (prompt === "Error") {
      return c.json({ error: "Error" }, 400);
    }
    console.log("Prompt: ", prompt);
    return c.json({ AIResponse: { expressions: ["Hello"] } });
    /*
    const geminiModel = new Gemini(c.env.GEMINI_API_KEY, modelName);
    const AIResponse = await geminiModel.chat(prompt);

    if (!AIResponse || !AIResponse?.text) {
      return c.json({ error: "Error" }, 510);
    }
    return c.json({
      AIResponse: JSON.parse(AIResponse.text),
    });*/
  },
);

export default app;
