import OpenAI from "openai";
import systemInstructions from "../../lib/ai/instructions/system-instructions";
import documentation from "../../lib/ai/instructions/documentation";
import { schema } from "./jsonSchema";

export async function chatDeepseek(openai: OpenAI, prompt: string) {
  const completion = await openai.chat.completions.create({
    messages: [
      { role: "system", content: systemInstructions + documentation },
      { role: "user", content: prompt },
    ],
    model: "deepseek-chat",
    response_format: {
      type: "json_object",
      // json_schema: schema,
    },
  });

  console.log(completion.choices[0].message.content);
  return completion.choices[0].message.content;
}
