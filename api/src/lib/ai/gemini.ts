import { CachedContent, GoogleGenAI } from "@google/genai";
import systemInstructions from "@lib/ai/instructions/system-instructions";
import documentation from "@lib/ai/instructions/documentation";
import { naturalAnswerSchema, hissabExpSchema } from "./jsonSchema";
import naturalResultInstructions from "@lib/ai/instructions/natural-result-instructions";
import {
  AIRequest,
  ExpWithResult,
  zHissabExp,
  zNaturalAnswer,
} from "~lib/types/AITypes";
import { CustomError, run } from "~lib/errors";

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
    const respResult = await run(
      this.ai.models.generateContent({
        model: this.hissabModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: hissabExpSchema,
          // cachedContent: this.cache.name,
          systemInstruction: systemInstructions + documentation,
        },
      }),
    );

    if (respResult.failed) {
      throw new CustomError(
        "GeminiGenContent",
        respResult.error.message,
        "Something went wrong",
      );
    }
    const aiResp = await run(() =>
      zHissabExp.safeParse(JSON.parse(respResult.data.text ?? "")),
    );
    if (aiResp.failed) {
      throw new CustomError(
        "HissabExpJSON",
        aiResp.error.message,
        "Something went wrong",
      );
    }
    if (aiResp.data.error) {
      throw new CustomError(
        "HissabExpJSON",
        aiResp.data.error.message,
        "Something went wrong",
      );
    }

    if (aiResp.data.data.expressions.length === 0) {
      throw new CustomError(
        "HissabExpJSON",
        "No expressions found",
        "This prompt did not yield any expressions.",
        400,
      );
    }
    return aiResp.data;
  }

  async getNaturalAnswer(prompt: string) {
    const aiNaturalResp = await run(
      this.ai.models.generateContent({
        model: this.naturalModel,
        contents: prompt,
        config: {
          responseMimeType: "application/json",
          responseSchema: naturalAnswerSchema,
          systemInstruction: naturalResultInstructions,
        },
      }),
    );
    if (aiNaturalResp.failed) {
      throw new CustomError(
        "NaturalAnswerJSON",
        aiNaturalResp.error.message,
        "Something went wrong",
      );
    }

    const naturalAnswer = await run(() =>
      zNaturalAnswer.parse(JSON.parse(aiNaturalResp.data.text ?? "")),
    );
    if (naturalAnswer.failed) {
      throw new CustomError(
        "HissabExpJSON",
        naturalAnswer.error.message,
        "Something went wrong",
      );
    }
    return naturalAnswer.data;
  }
}

export function getPromptWithHistory(
  body: AIRequest,
  retry: ExpWithResult[] | null = null,
) {
  const finalPrompt = body.inline
    ? `Note: This prompt is on line ${body.lineNumber}. All lines on the page are ${body.expressions
        .map((x, i) => `Line ${i}: ${x.expression} :: Result: ${x.result}`)
        .join("\n")}
      If the prompt reference any previous lines or results please use the previous line numbers in the output expressions.

      User Prompt: ${body.prompt}
      `
    : `Note: History of previous conversations: ${body.history}
        User Prompt: ${body.prompt}
    `;

  if (retry) {
    return `Your previous attempt generated some or all incorrect expressions that hissab could not parse.
Previously generated expressions: 
${JSON.stringify(
  retry.map(
    (x, i) =>
      `Line${i + 1}: ${x.expression} :: Result: ${x.error ? "ERROR" : x.result}`,
  ),
)}
Please try again. 
${finalPrompt}`;
  }
  return finalPrompt;
}
