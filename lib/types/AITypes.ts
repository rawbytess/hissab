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
  "gemini-2.5-flash-preview-04-17",
  "gemini-2.5-pro-preview-05-06",
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

export const ModelsList: {
  [key in ModelSize]: {
    id: Models;
    name: string;
    family: ModelFamily;
    description: string;
    canThink: boolean;
  };
} = {
  mini: {
    id: "gemini-2.0-flash-lite",
    name: "Gemini 2.0 Flash Lite",
    family: "gemini",
    description: "Gemini 2.0 Flash Lite",
    canThink: false,
  },
  small: {
    id: "gemini-2.0-flash",
    name: "Gemini 2.0 Flash",
    family: "gemini",
    description: "Gemini 2.0 Flash",
    canThink: false,
  },
  medium: {
    id: "gemini-2.5-flash-preview-04-17",
    name: "Gemini 2.5 Flash",
    family: "gemini",
    description: "Gemini 2.5 Flash",
    canThink: true,
  },
  large: {
    id: "gemini-2.5-pro-preview-05-06",
    name: "Gemini 2.5 Pro",
    family: "gemini",
    description: "Gemini 2.5 Pro",
    canThink: true,
  },
  xlarge: {
    id: "gemini-2.5-pro-preview-05-06",
    name: "Gemini 2.5 Pro",
    family: "gemini",
    description: "Gemini 2.5 Pro",
    canThink: true,
  },
};

export const ModelsMap: {
  [key in Models]: {
    name: string;
    family: ModelFamily;
    description: string;
    size: ModelSize;
    canThink: boolean;
  };
} = {
  "gemini-2.0-flash-lite": {
    name: "Gemini 2.0 Flash Lite",
    description: "Gemini 2.0 Flash Lite",
    family: "gemini",
    size: "mini",
    canThink: false,
  },
  "gemini-2.0-flash": {
    name: "Gemini 2.0 Flash",
    description: "Gemini 2.0 Flash",
    family: "gemini",
    size: "small",
    canThink: false,
  },
  "gemini-2.5-flash-preview-04-17": {
    name: "Gemini 2.5 Flash",
    description: "Gemini 2.5 Flash",
    family: "gemini",
    size: "medium",
    canThink: true,
  },
  "gemini-2.5-pro-preview-05-06": {
    name: "Gemini 2.5 Pro",
    description: "Gemini 2.5 Pro",
    family: "gemini",
    size: "large",
    canThink: true,
  },
};

export const inLineDefaultModel: Models = "gemini-2.0-flash";
export const chatDefaultModel: Models = "gemini-2.5-flash-preview-04-17";

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
  model: zModelSize,
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
  model: zModelSize,
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
