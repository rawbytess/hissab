import { Schema, Type } from "@google/genai";
import { z } from "zod";

export const hissabExpSchema: Schema = {
  description: "List of Hissab Expressions",
  type: Type.OBJECT,
  required: ["expressions"],
  properties: {
    expressions: {
      type: Type.ARRAY,
      description: "List of Hissab expressions",
      nullable: false,
      items: {
        type: Type.STRING,
      },
    },
  },
};

export const naturalAnswerSchema: Schema = {
  description: "Natural Answer",
  type: Type.OBJECT,
  required: ["naturalAnswer"],
  properties: {
    naturalAnswer: {
      type: Type.STRING,
      description: "Natural answer to the query",
      nullable: false,
    },
  },
};

const zHissabExp = z.object({
  expressions: z.array(z.string()),
});

const zNaturalAnswer = z.object({
  naturalAnswer: z.string(),
});

export type HissabExpType = z.infer<typeof zHissabExp>;
export type NaturalAnswerType = z.infer<typeof zNaturalAnswer>;
