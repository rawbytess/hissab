import {
  GenerativeModel,
  GoogleGenerativeAI,
  SchemaType,
  Schema,
} from "@google/generative-ai";
import systemInstructions from "./instructions/system-instructions";
import documentation from "./instructions/documentation";

const schema: Schema = {
  description: "List of Hissab Expressions",
  type: SchemaType.OBJECT,
  required: ["expressions"],
  properties: {
    expressions: {
      type: SchemaType.ARRAY,
      description: "List of Hissab expressions",
      nullable: false,
      items: {
        type: SchemaType.STRING,
      },
    },
  },
};

export function getGeminiModel(apiKey: string) {
  return new GoogleGenerativeAI(apiKey).getGenerativeModel({
    model: "gemini-2.0-flash",
    generationConfig: {
      responseMimeType: "application/json",
      responseSchema: schema,
    },
  });
}

export function getAIResponse(model: GenerativeModel, prompt: string) {
  return model.generateContent(systemInstructions + documentation + prompt);
}
