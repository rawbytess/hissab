import { CachedContent, GoogleGenAI } from "@google/genai";
import systemInstructions from "@lib/ai/instructions/system-instructions";
import documentation from "@lib/ai/instructions/documentation";
import { naturalAnswerSchema, hissabExpSchema } from "./jsonSchema";
import naturalResultInstructions from "@lib/ai/instructions/natural-result-instructions";

export class Gemini {
  private ai: GoogleGenAI;
  private hissabModel: string;
  private naturalModel: string;
  private cache: CachedContent;

  constructor(apiKey: string, model: string) {
    this.ai = new GoogleGenAI({ apiKey });
    this.hissabModel = model;
    this.naturalModel = "gemini-1.5-flash-8b";
  }
  async init() {
    this.cache = await this.ai.caches.create({
      model: this.hissabModel,
      config: {
        displayName: "hissab-context-cache",
        systemInstruction: systemInstructions + documentation,
      },
    });
  }

  async getExpressions(prompt: string) {
    return this.ai.models.generateContent({
      model: this.hissabModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: hissabExpSchema,
        // cachedContent: this.cache.name,
        systemInstruction: systemInstructions + documentation,
      },
    });
  }

  async getNaturalAnswer(prompt: string) {
    return this.ai.models.generateContent({
      model: this.naturalModel,
      contents: prompt,
      config: {
        responseMimeType: "application/json",
        responseSchema: naturalAnswerSchema,
        systemInstruction: naturalResultInstructions,
      },
    });
  }
}
