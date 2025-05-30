import { Schema, Type } from "@google/genai";

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

export const hissabExpFunction = {
  name: "calculate_with_hissab",
  description: "Hissab expressions corresponding to the user prompt",
  parameters: hissabExpSchema,
};
