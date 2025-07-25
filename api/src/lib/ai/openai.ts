import documentation from "@lib/ai/instructions/documentation";
import systemInstructions from "@lib/ai/instructions/system-instructions";
import { hissabExpFunction } from "@lib/ai/jsonSchema";
import OpenAI from "openai";
import { RunnableToolFunction } from "openai/lib/RunnableFunction";
import {
  type ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import { calcExp, calculateExpressions } from "~lib/calculateExpressions";
import { CustomError } from "~lib/errors";
import {
  type AIFormatResponseType,
  ExpWithResult,
  type ModelFamily,
  type Models,
  ModelsMap,
} from "~lib/types/AITypes";
import type { ProductNames } from "~lib/types/userMetadata";

const urlMap: {
  [key in ModelFamily]: string;
} = {
  gemini: "https://generativelanguage.googleapis.com/v1beta/openai/",
};

export function initOpenAI(apiKey: string, modelFamily: ModelFamily): OpenAI {
  return new OpenAI({
    apiKey,
    baseURL: urlMap[modelFamily],
  });
}

export async function generate(
  openai: OpenAI,
  model: Models,
  systemInstructions: string,
  userPrompt: string,
  files:
    | { url: string; mimeType: string; name: string }
    | undefined = undefined,
  isPremium: ProductNames | null = null,
): Promise<AIFormatResponseType> {
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemInstructions + documentation },
    { role: "user", content: userPrompt },
  ];
  const reasoning_effort = ModelsMap[model].canThink ? null : undefined;
  const finalResponse = {
    naturalAnswer: "",
    expressions: [],
  };

  const tools = [hissabExpFunction];
  for (let i = 0; i < 10; i++) {
    const response = await openai.chat.completions.create({
      messages,
      model,
      stream: false,
      // tools,
      reasoning_effort,
      tool_choice: "auto",
    });
    const responseMessage = response.choices[0].message;

    const newResponseMessage: ChatCompletionMessageParam =
      responseMessage.tool_calls && responseMessage.tool_calls.length > 0
        ? {
            ...responseMessage,
            tool_calls: [
              {
                ...responseMessage.tool_calls[0],
                id: responseMessage.tool_calls[0].function.name, // Ensure the first tool call ID matches the function name
              },
              ...responseMessage.tool_calls.slice(1),
            ],
          }
        : responseMessage;

    messages.push(newResponseMessage); // Add assistant's response to messages

    let functionResponseContent: any;
    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      console.log(
        `[Action] Assistant wants to call ${responseMessage.tool_calls.length} function(s).`,
      );

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type === "function") {
          const functionName = toolCall.function.name;
          const functionArgs = JSON.parse(toolCall.function.arguments);

          try {
            if (functionName === "calculate_with_hissab") {
              functionResponseContent = await calcExp({
                expressions: functionArgs.expressions,
              });
            } else {
              console.warn(
                `[Warning] Unknown function called: ${functionName}`,
              );
              functionResponseContent = {
                error: `Function ${functionName} not found.`,
              };
            }
          } catch (funcError: any) {
            console.error(
              `[Error] Error executing function ${functionName}:`,
              funcError,
            );
            functionResponseContent = {
              error: `Error in ${functionName}: ${funcError.message || "Unknown error"}`,
            };
          }
          messages.push({
            tool_call_id: toolCall.function.name,
            role: "tool",
            content: JSON.stringify(functionResponseContent),
          });
          console.log(
            `[Function Result] Added result for ${functionName} (ID: ${toolCall.id})`,
          );
        }
      }
    } else {
      console.log("\n--- Final Assistant Response ---");
      if (responseMessage.content) {
        console.log(responseMessage.content);
        finalResponse.naturalAnswer = responseMessage.content || "";
        finalResponse.expressions = functionResponseContent?.expressions || [];
        return finalResponse;
      } else {
        console.log(
          "[Info] Assistant did not provide a textual response this turn (might have only made tool calls previously).",
        );
      }
    }
  }
  return finalResponse;
}
