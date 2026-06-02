import { z } from "zod";
import type { OperationTag } from "../documentation";
import type { ProductNames } from "./userMetadata";

export type ExpWithResult = {
  expression: string;
  result: string;
  error?: boolean;
  /** Human-readable reason the expression failed (engine error message). */
  errorMessage?: string;
};

/** One ordered step in a problem breakdown. */
export type SolutionStep = {
  id: string;
  /** What this step computes. */
  description: string;
  /** The formula or approach in plain math, e.g. "KE = ½·m·v²". */
  method?: string;
  /** Hissab operation categories this step likely needs. */
  operation_tags: OperationTag[];
  /** Ids of earlier steps this one depends on. */
  depends_on: string[];
};

/** Structured breakdown of a problem: the goal plus ordered steps. */
export type SolutionPlan = {
  goal: string;
  steps: SolutionStep[];
};

export type ClarificationInput = {
  name: string;
  label: string;
  reason?: string;
  expected_format?: string;
  examples?: string[];
};

export type ClarificationRequest = {
  goal: string;
  missing_inputs: ClarificationInput[];
  question: string;
};

export type AIFormatResponseType = {
  naturalAnswer: string;
  webSearchContext?: string;
  expressions: ExpWithResult[];
  /** Structured breakdown, when the problem was solved via the complex path. */
  solutionPlan?: SolutionPlan;
  /** Required user inputs that must be supplied before solving. */
  clarificationRequest?: ClarificationRequest;
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
  "gemini-2.5-flash-lite-preview-06-17",
  "gemini-2.5-flash",
  "gemini-2.5-pro",
]);

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
    id: "gemini-2.5-flash-lite-preview-06-17",
    name: "Gemini 2.5 Flash Lite",
    family: "gemini",
    description: "Gemini 2.0 Flash Lite",
    canThink: false,
  },
  medium: {
    id: "gemini-2.5-flash",
    name: "Gemini 2.5 Flash",
    family: "gemini",
    description: "Gemini 2.5 Flash",
    canThink: true,
  },
  large: {
    id: "gemini-2.5-pro",
    name: "Gemini 2.5 Pro",
    family: "gemini",
    description: "Gemini 2.5 Pro",
    canThink: true,
  },
  xlarge: {
    id: "gemini-2.5-pro",
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
  "gemini-2.5-flash-lite-preview-06-17": {
    name: "Gemini 2.5 Flash Lite",
    description: "Gemini 2.5 Flash Lite",
    family: "gemini",
    size: "small",
    canThink: false,
  },
  "gemini-2.5-flash": {
    name: "Gemini 2.5 Flash",
    description: "Gemini 2.5 Flash",
    family: "gemini",
    size: "medium",
    canThink: true,
  },
  "gemini-2.5-pro": {
    name: "Gemini 2.5 Pro",
    description: "Gemini 2.5 Pro",
    family: "gemini",
    size: "large",
    canThink: true,
  },
};

export const inLineDefaultModel: Models = "gemini-2.5-flash-lite-preview-06-17";
export const chatDefaultModel: Models = "gemini-2.5-flash";

export const modelRateLimits: {
  [key in ModelSize]: {
    [key in ProductNames]: number;
  };
} = {
  mini: {
    "AI Lite": 200,
    "AI Plus": 500,
    Some: 0,
    Handful: 0,
    Plenty: 0,
    Buttload: 0,
  },
  small: {
    "AI Lite": 50,
    "AI Plus": 100,
    Some: 0,
    Handful: 0,
    Plenty: 0,
    Buttload: 0,
  },
  medium: {
    "AI Lite": 5,
    "AI Plus": 25,
    Some: 0,
    Handful: 0,
    Plenty: 0,
    Buttload: 0,
  },
  large: {
    "AI Lite": 0,
    "AI Plus": 10,
    Some: 0,
    Handful: 0,
    Plenty: 0,
    Buttload: 0,
  },
  xlarge: {
    "AI Lite": 0,
    "AI Plus": 0,
    Some: 0,
    Handful: 0,
    Plenty: 0,
    Buttload: 0,
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
      role: z.enum(["user", "model"]),
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
