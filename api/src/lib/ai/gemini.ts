import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
  Part,
} from "@google/genai";
import documentation from "@lib/ai/instructions/documentation";
import { hissabExpFunction, webSearchFunction } from "./jsonSchema";
import {
  AIFormatResponseType,
  ExpWithResult,
  inLineDefaultModel,
  Models,
  ModelsMap,
} from "~lib/types/AITypes";
import { CustomError, run } from "~lib/errors";
import { FileUpload } from "~lib/types/fileTypes";
import { calculateExpressions } from "~lib/calculateExpressions";
import { ProductNames } from "~lib/types/userMetadata";
import { webSearch } from "@lib/webSearch";
import { print } from "~lib/utils";

async function blobToBase64(blob: any) {
  // Convert the Blob to an ArrayBuffer
  const arrayBuffer = await blob.arrayBuffer();

  // Convert the ArrayBuffer to a Uint8Array
  const uint8Array = new Uint8Array(arrayBuffer);

  // Convert the Uint8Array to a binary string
  let binaryString = "";
  for (let i = 0; i < uint8Array.length; i++) {
    binaryString += String.fromCharCode(uint8Array[i]);
  }

  // Encode the binary string to Base64
  return btoa(binaryString);
}
export class Gemini {
  private ai: GoogleGenAI;
  private hissabModel: Models;

  constructor(apiKey: string, model: Models) {
    this.ai = new GoogleGenAI({ apiKey });
    this.hissabModel = model;
  }

  async getExpressions(
    systemInstructions: string,
    prompt: string,
    history: {}[],
    files:
      | { url: string; mimeType: string; name: string }
      | undefined = undefined,
    isPremium: ProductNames | null = null,
    SEARCH_API_KEY: string | null = null,
  ): Promise<AIFormatResponseType> {
    const contents: (string | Part | {})[] = [
      ...history,
      { role: "user", parts: [{ text: prompt }] },
    ];

    if (files && isPremium && isPremium === "AI Plus") {
      contents.push({
        role: "user",
        parts: [createPartFromUri(files.url, files.mimeType)],
      });
    }
    const thinkingConfig = ModelsMap[this.hissabModel].canThink
      ? { thinkingBudget: 0 }
      : undefined;

    const hissabExps: ExpWithResult[] = [];
    let webSearchContext = "";
    const tools =
      isPremium === "AI Plus"
        ? [hissabExpFunction, webSearchFunction]
        : [hissabExpFunction];

    for (let i = 0; i < 10; i++) {
      const respResult = await run(
        this.ai.models.generateContent({
          model: this.hissabModel,
          contents: contents,
          config: {
            thinkingConfig: thinkingConfig,
            tools: [{ functionDeclarations: tools }],
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

      if (
        respResult.data.functionCalls &&
        respResult.data.functionCalls.length > 0
      ) {
        for (const toolCall of respResult.data.functionCalls) {
          contents.push({
            role: "model",
            parts: [{ functionCall: toolCall }],
          });

          if (toolCall.name === webSearchFunction.name) {
            const searchQueries = toolCall.args!.searchQueries as string[];
            const Results = await run(
              webSearch(searchQueries, SEARCH_API_KEY!),
            );
            if (Results.failed)
              throw new CustomError(
                "FetchResponse",
                Results.error.message,
                "Unable to get real-time information",
              );
            webSearchContext += Results.data;

            contents.push({
              role: "user",
              parts: [
                {
                  functionResponse: {
                    name: toolCall.name,
                    response: { searchResults: Results.data },
                  },
                },
              ],
            });
          } else if (toolCall.name === hissabExpFunction.name) {
            const results = await run(
              calculateExpressions(
                toolCall.args!.expressions as string[],
                !!isPremium,
              ),
            );
            if (results.failed) {
              throw new CustomError(
                "Unknown",
                "Something went wrong",
                "Hissab failed to calculate expressions",
                500,
              );
            }
            hissabExps.push(...results.data);

            contents.push({
              role: "user",
              parts: [
                {
                  functionResponse: {
                    name: toolCall.name,
                    response: { result: results.data },
                  },
                },
              ],
            });
          }
        }
      } else if (respResult.data.text) {
        if (respResult.data.text.length === 0) {
          throw new CustomError(
            "GeminiGenContent",
            "Something went wrong",
            "Something went wrong",
          );
        }
        return {
          naturalAnswer: respResult.data.text,
          webSearchContext: webSearchContext,
          expressions: hissabExps,
        };
      } else {
        const final_response = await this.ai.models.generateContent({
          model: this.hissabModel,
          contents: contents,
          config: {
            tools: [{ functionDeclarations: [hissabExpFunction] }],
            systemInstruction: systemInstructions,
          },
        });
        if (!final_response.text)
          throw new CustomError(
            "GeminiGenContent",
            "Something went wrong",
            "Something went wrong",
          );
        return {
          naturalAnswer: final_response.text,
          webSearchContext: webSearchContext,
          expressions: hissabExps,
        };
      }
    }
    throw new CustomError(
      "GeminiGenContent",
      "Failed to generate content after multiple attempts",
      "Something went wrong",
    );
  }

  async uploadFile(file: FileUpload, fileBlob?: Blob) {
    return await this.ai.files.upload({
      file: fileBlob || file.url,
      config: {
        mimeType: file.mimeType,
        displayName: file.name,
      },
    });
  }
}
