import { GoogleGenAI } from "@google/genai";
import systemInstructions from "@lib/ai/instructions/system-instructions";
import documentation from "@lib/ai/instructions/documentation";
import { schema } from "./jsonSchema";

export class Gemini {
  private ai: GoogleGenAI;
  private model: string;
  private cache: string;

  constructor(apiKey: string, model: string) {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }

  async chat(prompt: string) {
    return this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        systemInstruction: systemInstructions + documentation,
      },
    });
  }
}
