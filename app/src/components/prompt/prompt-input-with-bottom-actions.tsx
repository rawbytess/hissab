import React, { useContext, useEffect } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";

import PromptInput from "./PromptInput.tsx";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AIResponseType } from "../../../../lib/types/AIResponse.ts";

export default function Component() {
  const [prompt, setPrompt] = React.useState<string>("");
  const { editorOperations } = useContext(PageContext);
  const queryClient = useQueryClient();

  const AIResponse = useQuery<AIResponseType>({
    queryKey: ["AIResponse", prompt],
    enabled: false,
    refetchOnWindowFocus: false,
    refetchOnReconnect: false,
    refetchOnMount: false,
    retry: false,
    queryFn: async () => {
      if (prompt.length === 0) return;
      const response = await fetch("http://localhost:8787/ai/prompt", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ prompt: prompt }),
      });
      if (!response.ok) {
        throw new Error("Failed to fetch AI response" + response.status);
      }
      return response.json();
    },
  });

  useEffect(() => {
    if (AIResponse.data) {
      editorOperations.insertText(
        AIResponse.data.AIResponse.expressions.join("\n"),
      );
      queryClient.removeQueries({ queryKey: ["AIResponse", prompt] });
      return;
    }
    if (AIResponse.error) {
      queryClient.removeQueries({ queryKey: ["AIResponse", prompt] });
      return;
    }
  }, [
    AIResponse.data,
    AIResponse.error,
    editorOperations,
    prompt,
    queryClient,
  ]);

  return (
    <div className="flex h-full flex-col gap-8 items-center justify-end mx-5 mb-10">
      <div className="flex flex-col gap-2 rounded-2xl max-w-[50em] w-full relative">
        {prompt.length && (
          <Tooltip
            showArrow
            offset={-5}
            delay={1000}
            content="Clear Prompt"
            className={"text-white bg-neutral-700 rounded-2xl"}
          >
            <Icon
              className={cn(
                "[&>path]:stroke-[2px]",
                "absolute -top-3 -left-3 ring-2 ring-stone-800 rounded-full bg-stone-900 text-stone-400 cursor-pointer",
              )}
              onClick={() => setPrompt("")}
              icon="mdi:clear-circle"
              width={20}
            />
          </Tooltip>
        )}
        <div className="flex flex-col gap-4 rounded-2xl">
          <form
            className={cn(
              "flex flex-col items-start rounded-medium text-white  transition-colors  bg-gray-800 hover:bg-blue-950",
              "focus-within:bg-blue-950  ring-2  hover:ring-blue-500 focus-within:ring-blue-500",
              AIResponse.error ? "ring-red-500 " : "ring-gray-600",
            )}
            onSubmit={async (e) => {
              e.preventDefault();
              if (prompt.length === 0) return;
              await AIResponse.refetch();
            }}
          >
            <PromptInput
              classNames={{
                inputWrapper: "!bg-transparent shadow-none h-auto",
                innerWrapper: "relative",
                input: "pt-1 pl-2 pb-6 !pr-10 text-medium",
              }}
              minRows={3}
              maxRows={10}
              startContent={
                <div className={"flex flex-col -ml-2"}>
                  <Tooltip
                    showArrow
                    offset={-5}
                    delay={1000}
                    content="Previous Prompt"
                    className={"text-white bg-neutral-700 rounded-2xl"}
                  >
                    <Button
                      isIconOnly
                      variant={"light"}
                      size={"sm"}
                      className={"text-white"}
                    >
                      <Icon
                        className={cn(
                          "[&>path]:stroke-[2px]",
                          !prompt
                            ? "text-default-600"
                            : "text-primary-foreground",
                        )}
                        icon="material-symbols-light:arrow-back-2"
                        width={20}
                      />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    showArrow
                    delay={1000}
                    offset={-5}
                    content="See Prompts history"
                    className={"text-white bg-neutral-700 rounded-2xl"}
                  >
                    <Button
                      isIconOnly
                      variant={"light"}
                      size={"sm"}
                      className={"text-white "}
                    >
                      <Icon
                        className={cn(
                          "[&>path]:stroke-[2px]",
                          !prompt
                            ? "text-default-600"
                            : "text-primary-foreground",
                        )}
                        icon="mdi:clipboard-text-history-outline"
                        width={20}
                      />
                    </Button>
                  </Tooltip>
                  <Tooltip
                    showArrow
                    offset={-5}
                    delay={1000}
                    content="Previous Prompt"
                    className={"text-white bg-neutral-700 rounded-2xl"}
                  >
                    <Button
                      isIconOnly
                      variant={"light"}
                      size={"sm"}
                      className={"text-white "}
                    >
                      <Icon
                        className={cn(
                          "[&>path]:stroke-[2px]",
                          "scale-x-[-1]",
                          !prompt
                            ? "text-default-600"
                            : "text-primary-foreground",
                        )}
                        icon="material-symbols-light:arrow-back-2"
                        width={20}
                      />
                    </Button>
                  </Tooltip>
                </div>
              }
              endContent={
                <div className="flex flex-col items-end gap-2">
                  {AIResponse.isLoading ? (
                    <div className={"mt-1"}>
                      {/** eslint-disable-next-line @typescript-eslint/ban-ts-comment
                   @ts-expect-error **/}
                      <l-infinity
                        size="40"
                        stroke="4"
                        stroke-length="0.15"
                        bg-opacity="0.2"
                        speed="1.3"
                        color="#8100ff"
                      ></l-infinity>
                    </div>
                  ) : (
                    <Tooltip
                      showArrow
                      offset={-5}
                      delay={1000}
                      content="Send Prompt"
                      className={"text-white bg-neutral-700 rounded-2xl"}
                    >
                      <Button
                        isIconOnly
                        isDisabled={prompt.length === 0}
                        radius="lg"
                        size="lg"
                        variant="light"
                        type={"submit"}
                        className={cn(
                          !prompt ? "text-gray-700 " : "text-[#8100ff]",
                        )}
                      >
                        <Icon icon="lets-icons:send-duotone-line" width={50} />
                      </Button>
                    </Tooltip>
                  )}
                </div>
              }
              radius="lg"
              onKeyUp={async (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  e.preventDefault();
                  if (prompt.length === 0) return;
                  await AIResponse.refetch();
                }
              }}
              value={prompt}
              variant="flat"
              onValueChange={setPrompt}
            />
          </form>
        </div>
        <div className={"flex flex-row justify-between items-center mx-2"}>
          <p className="text-tiny text-default-400">{prompt.length}/2000</p>
          {AIResponse.error && (
            <p className={"text-tiny text-red-400"}>
              {AIResponse.error.message +
                AIResponse.error.message +
                AIResponse.error.message +
                AIResponse.error.message}
            </p>
          )}
        </div>
      </div>
    </div>
  );
}
