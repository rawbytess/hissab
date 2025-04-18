import { z } from "zod";

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

const zAIRequestInline = z.object({
  prompt: z.string(),
  inline: z.literal(true),
  lineNumber: z.number(),
  expressions: z.array(z.custom<ExpWithResult>()),
});

const zAIRequestChat = z.object({
  prompt: z.string(),
  inline: z.literal(false),
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
