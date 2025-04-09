import { CachedContent, GoogleGenAI } from "@google/genai";
import systemInstructions from "@lib/ai/instructions/system-instructions";
import documentation from "@lib/ai/instructions/documentation";
import { schema } from "./jsonSchema";

export class Gemini {
  private ai: GoogleGenAI;
  private model: string;
  private cache: CachedContent;

  constructor(apiKey: string, model: string) {
    this.ai = new GoogleGenAI({ apiKey });
    this.model = model;
  }
  async init() {
    this.cache = await this.ai.caches.create({
      model: this.model,
      config: {
        displayName: "hissab-context-cache",
        systemInstruction: systemInstructions + documentation,
      },
    });
  }

  async chat(prompt: string) {
    return this.ai.models.generateContent({
      model: this.model,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: schema,
        // cachedContent: this.cache.name,
        systemInstruction: systemInstructions + documentation,
      },
    });
  }
}
