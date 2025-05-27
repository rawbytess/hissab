import {
  createPartFromUri,
  createUserContent,
  GoogleGenAI,
  Part,
} from "@google/genai";
import documentation from "@lib/ai/instructions/documentation";
import { hissabExpFunction } from "./jsonSchema";
import {
  AIFormatResponseType,
  inLineDefaultModel,
  Models,
  ModelsMap,
} from "~lib/types/AITypes";
import { CustomError, run } from "~lib/errors";
import { FileUpload } from "~lib/types/fileTypes";
import { calculateExpressions } from "~lib/calculateExpressions";
import { ProductNames } from "~lib/types/userMetadata";

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
    files:
      | { url: string; mimeType: string; name: string }
      | undefined = undefined,
    isPremium: ProductNames | null = null,
  ): Promise<AIFormatResponseType> {
    const contents: (string | Part | {})[] = [prompt];
    if (files && isPremium && isPremium === "AI Plus") {
      contents.push(createPartFromUri(files.url, files.mimeType));
    }
    const thinkingConfig = ModelsMap[this.hissabModel].canThink
      ? { thinkingBudget: 0 }
      : undefined;

    const respResult = await run(
      this.ai.models.generateContent({
        model: this.hissabModel,
        contents: createUserContent(contents),
        config: {
          thinkingConfig: thinkingConfig,
          tools: [{ functionDeclarations: [hissabExpFunction] }],
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
      const functionCall = respResult.data.functionCalls[0];

      const results = await run(
        calculateExpressions(
          functionCall.args!.expressions as string[],
          !!isPremium,
        ),
      );
      if (results.failed) {
        throw new CustomError(
          "Unknown",
          "Something went wrong",
          "Something went wrong",
          500,
        );
      }
      contents.push({
        role: "model",
        parts: [{ functionCall: functionCall }],
      });

      contents.push({
        role: "user",
        parts: [
          {
            functionResponse: {
              name: hissabExpFunction.name,
              response: { result: results.data },
            },
          },
        ],
      });

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
        expressions: results.data,
      };
    }

    if (!respResult.data.text)
      throw new CustomError(
        "GeminiGenContent",
        "Something went wrong",
        "Something went wrong",
      );
    return {
      naturalAnswer: respResult.data.text,
      expressions: [],
    };
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
