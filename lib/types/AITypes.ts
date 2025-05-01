import { z } from "zod";
import { ProductNames } from "./userMetadata";

export type ExpWithResult = {
  expression: string;
  result: string;
  error?: boolean;
};

export type AIFormatResponseType = {
  naturalAnswer: string;
  expressions: ExpWithResult[];
};

export type AIFormatRequestType = {
  expressions: ExpWithResult[];
};

export const zModelSize = z.enum([
  "mini",
  "small",
  "medium",
  "large",
  "xlarge",
]);
export type ModelSize = z.infer<typeof zModelSize>;

export type ModelFamily = "gemini";
export const zModels = z.enum([
  "gemini-2.0-flash-lite",
  "gemini-2.0-flash",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
]);
/*
small -
 llama 4 Scout
 gpt 4.1 nano

medium -
  llama 4 Maverick
  gpt 4.1 mini

large -
  Deepseek r1 distill llama 70B
  o4-mini

xlarge -
  o3
 */
export type Models = z.infer<typeof zModels>;

export const ModelsMap: {
  [key in Models]: {
    name: string;
    family: ModelFamily;
    description: string;
    size: ModelSize;
  };
} = {
  "gemini-2.0-flash-lite": {
    name: "Gemini 2.0 Flash Lite",
    description: "Gemini 2.0 Flash Lite",
    family: "gemini",
    size: "mini",
  },
  "gemini-2.0-flash": {
    name: "Gemini 2.0 Flash",
    description: "Gemini 2.0 Flash",
    family: "gemini",
    size: "small",
  },
  "gemini-2.5-flash": {
    name: "Gemini 2.5 Flash",
    description: "Gemini 2.5 Flash",
    family: "gemini",
    size: "medium",
  },
  "gemini-2.5-pro": {
    name: "Gemini 2.5 Pro",
    description: "Gemini 2.5 Pro",
    family: "gemini",
    size: "large",
  },
};

export const inLineDefaultModel: Models = "gemini-2.0-flash";
export const chatDefaultModel: Models = "gemini-2.5-flash";

export const modelRateLimits: {
  [key in ModelSize]: {
    [key in ProductNames]: number;
  };
} = {
  mini: {
    "AI Lite": 200,
    "AI Plus": 500,
  },
  small: {
    "AI Lite": 50,
    "AI Plus": 100,
  },
  medium: {
    "AI Lite": 5,
    "AI Plus": 25,
  },
  large: {
    "AI Lite": 0,
    "AI Plus": 10,
  },
  xlarge: {
    "AI Lite": 0,
    "AI Plus": 0,
  },
};

const zAIRequestInline = z.object({
  prompt: z.string(),
  inline: z.literal(true),
  lineNumber: z.number(),
  expressions: z.array(z.custom<ExpWithResult>()),
  explain: z.boolean().default(false),
  fallback: z.boolean().default(true),
  model: zModels,
  file: z
    .object({
      name: z.string(),
      url: z.string(),
      mimeType: z.string(),
    })
    .optional(),
});

const zAIRequestChat = z.object({
  prompt: z.string(),
  inline: z.literal(false),
  model: zModels,
  explain: z.boolean().default(false),
  fallback: z.boolean().default(true),
  file: z
    .object({
      name: z.string(),
      url: z.string(),
      mimeType: z.string(),
    })
    .optional(),
  history: z.array(
    z.object({
      role: z.enum(["user", "assistant"]),
      content: z.string(),
    }),
  ),
});
export const zAIRequest = z.discriminatedUnion("inline", [
  zAIRequestInline,
  zAIRequestChat,
]);

export const zHissabExp = z.object({
  expressions: z.array(z.string()),
});

export const zNaturalAnswer = z.object({
  naturalAnswer: z.string(),
});

export type HissabExpType = z.infer<typeof zHissabExp>;
export type NaturalAnswerType = z.infer<typeof zNaturalAnswer>;
export type AINaturelAnswerType = HissabExpType & NaturalAnswerType;

export type AIRequest = z.infer<typeof zAIRequest>;
export type AIRequestInline = z.infer<typeof zAIRequestInline>;
export type AIRequestChat = z.infer<typeof zAIRequestChat>;
