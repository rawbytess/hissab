import OpenAI from "openai";
import systemInstructions from "./instructions/system-instructions";
import documentation from "./instructions/documentation";

const openai = new OpenAI();

const completion = await openai.chat.completions.create({
  model: "gpt-4o-mini",
  messages: [
    { role: "system", content: systemInstructions + documentation },
    {
      role: "user",
      content: "Write a haiku about recursion in programming.",
    },
  ],
  store: true,
  temperature: 0.1,
});

console.log(completion.choices[0].message);
