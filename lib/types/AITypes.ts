import { z } from "zod";

export type AIExpressionsType = {
  expressions: string[];
};

export type AIResponseType = {
  naturalAnswer: string;
  expressions: string[];
};

export type ExpWithResult = {
  expression: string;
  result: string;
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

export type AIRequest = z.infer<typeof zAIRequest>;
export type AIRequestInline = z.infer<typeof zAIRequestInline>;
export type AIRequestChat = z.infer<typeof zAIRequestChat>;
