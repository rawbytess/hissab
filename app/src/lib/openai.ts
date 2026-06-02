import type {
  ChatCompletionMessageParam,
  ChatCompletionTool,
} from "openai/resources/chat/completions";
import { aicache } from "@/lib/cache.ts";
import {
  fileAsDataUrl,
  type StoredNotebookFile,
} from "@/lib/idb-stores/file-store.ts";
import type { LLMClient } from "@/lib/llmClient.ts";
import { calculateExpressions } from "../../../lib/calculateExpressions.ts";
import {
  getFullDocumentation,
  systemInstructions,
} from "../../../lib/documentation/index.ts";
import { CustomError } from "../../../lib/errors.ts";
import type { AIFormatResponseType } from "../../../lib/types/AITypes.ts";

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

export async function llmGenerate(
  openai: LLMClient,
  model: string,
  userPrompt: string,
  history: ChatCompletionMessageParam[],
  files: StoredNotebookFile[] = [],
): Promise<AIFormatResponseType> {
  if (userPrompt.length === 0)
    throw new CustomError("EmptyPrompt", "Empty Prompt", "");
  const cacheResult = aicache.get(userPrompt);

  if (cacheResult) {
    if (cacheResult.error)
      throw new CustomError(
        "FetchResponse",
        cacheResult.error,
        cacheResult.error,
      );
    return cacheResult;
  }
  const messages: ChatCompletionMessageParam[] = [
    { role: "system", content: systemInstructions() + getFullDocumentation() },
  ];

  if (files.length > 0) {
    messages.push({
      role: "user",
      content: files.map((file) =>
        file.kind === "image"
          ? {
              type: "image_url",
              image_url: { url: fileAsDataUrl(file) },
            }
          : {
              type: "file",
              file: {
                filename: file.name,
                file_data: fileAsDataUrl(file),
              },
            },
      ) as never,
    });
  }
  messages.push(...history);
  messages.push({ role: "user", content: userPrompt });
  console.log(messages);

  const finalResponse: AIFormatResponseType = {
    naturalAnswer: "",
    expressions: [],
  };

  const tools = [hissabExpFunctionOpenAI];
  for (let i = 0; i < 10; i++) {
    const response = await openai.chat.completions.create({
      messages,
      model,
      stream: false,
      tools,
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
                id:
                  (
                    responseMessage.tool_calls[0] as {
                      function?: { name?: string };
                    }
                  ).function?.name ?? responseMessage.tool_calls[0].id,
              },
              ...responseMessage.tool_calls.slice(1),
            ],
          }
        : responseMessage;

    messages.push(newResponseMessage); // Add assistant's response to messages

    if (responseMessage.tool_calls && responseMessage.tool_calls.length > 0) {
      console.log(
        `[Action] Assistant wants to call ${responseMessage.tool_calls.length} function(s).`,
      );

      for (const toolCall of responseMessage.tool_calls) {
        if (toolCall.type === "function") {
          const functionName = toolCall.function.name;
          const functionArgs: { expressions: string[] } = JSON.parse(
            toolCall.function.arguments,
          );

          try {
            if (functionName === "calculate_with_hissab") {
              const results = await calculateExpressions(
                functionArgs.expressions,
              );
              finalResponse.expressions.push(...results);
            } else {
              console.warn(
                `[Warning] Unknown function called: ${functionName}`,
              );
            }
          } catch (funcError: any) {
            console.error(
              `[Error] Error executing function ${functionName}:`,
              funcError,
            );
          }
          messages.push({
            tool_call_id: toolCall.function.name,
            role: "tool",
            content: JSON.stringify(finalResponse.expressions),
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
