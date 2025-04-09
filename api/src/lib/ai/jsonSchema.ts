import { Schema, Type } from "@google/genai";

export const schema: Schema = {
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
