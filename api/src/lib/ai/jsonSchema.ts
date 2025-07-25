import { type Schema, Type } from "@google/genai";
import {
  RunnableFunctionWithParse,
  RunnableToolFunction,
} from "openai/lib/RunnableFunction";
import type { ChatCompletionTool } from "openai/resources/chat/completions";
import { calcExp, calculateExpressions } from "~lib/calculateExpressions";

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

export const webSearchSchema: Schema = {
  description:
    "Web Search queries for real-time information like weather, stock prices, " +
    "currency rates, crypto currency rates, commodities, etfs, metals etc.",
  type: Type.OBJECT,
  required: ["searchQueries"],
  properties: {
    searchQueries: {
      type: Type.ARRAY,
      description: "List of web search queries",
      nullable: false,
      items: {
        type: Type.STRING,
      },
    },
  },
};

export const webSearchFunction = {
  name: "web_search",
  description:
    "Web Search queries for real-time information like weather, stock prices, " +
    "currency rates, crypto currency rates, commodities, etfs, metals etc.",
  parameters: webSearchSchema,
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

export const hissabExpFunctionOpenAI: ChatCompletionTool = {
  type: "function",
  function: {
    name: "calculate_with_hissab",
    description: "Hissab expressions corresponding to the user prompt",
    parameters: {
      type: "object",
      properties: {
        expressions: {
          type: "array",
          description: "List of Hissab expressions",
          items: {
            type: "string",
          },
        },
      },
    },
  },
};
