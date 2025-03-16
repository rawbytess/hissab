import React, { useContext, useEffect } from "react";
import { Button, Spinner, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";

import PromptInput from "./prompt-input";
import { PageContext } from "@/components/pages/PagesProvider.tsx";
import { useQuery, useQueryClient } from "@tanstack/react-query";
import { AIResponseType } from "../../../../types/AIResponse.ts";

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
    if (!AIResponse.data) return;
    editorOperations.insertText(
      AIResponse.data.AIResponse.expressions.join("\n"),
    );
    queryClient.removeQueries({ queryKey: ["AIResponse"] });
  }, [AIResponse.data, editorOperations, prompt, queryClient]);

  return (
    <div className="flex flex-col gap-4 rounded-2xl">
      <form
        className="flex flex-col items-start rounded-medium bg-gray-800 transition-colors hover:bg-blue-950
      focus-within:bg-blue-950 text-white ring-2 ring-gray-600 hover:ring-blue-500 focus-within:ring-blue-500"
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
                  variant={"solid"}
                  size={"sm"}
                  className={"text-white"}
                >
                  <Icon
                    className={cn(
                      "[&>path]:stroke-[2px]",
                      !prompt ? "text-default-600" : "text-primary-foreground",
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
                  variant={"solid"}
                  size={"sm"}
                  className={"text-white "}
                >
                  <Icon
                    className={cn(
                      "[&>path]:stroke-[2px]",
                      !prompt ? "text-default-600" : "text-primary-foreground",
                    )}
                    icon="mdi:clipboard-text-history-outline"
                    width={20}
                  />
                </Button>
              </Tooltip>
              <Tooltip
                showArrow
                delay={1000}
                offset={-5}
                content="Next Prompt"
                className={"text-white bg-neutral-700 rounded-2xl"}
              >
                <Button
                  isIconOnly
                  variant={"solid"}
                  size={"sm"}
                  className={"text-white "}
                >
                  <Icon
                    className={cn(
                      "[&>path]:stroke-[2px]",
                      "scale-x-[-1]",
                      !prompt ? "text-default-600" : "text-primary-foreground",
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
                    size="32"
                    stroke="2"
                    stroke-length="0.15"
                    bg-opacity="0.2"
                    speed="1.3"
                    color="#8100ff"
                  ></l-infinity>
                </div>
              ) : (
                <Tooltip showArrow content="Send prompt">
                  <Button
                    isIconOnly
                    isDisabled={prompt.length === 0}
                    radius="lg"
                    size="sm"
                    variant="solid"
                    type={"submit"}
                    className={cn(
                      !prompt ? "text-gray-700 " : "text-[#8100ff]",
                    )}
                  >
                    <Icon icon="material-symbols:send" width={40} />
                  </Button>
                </Tooltip>
              )}
            </div>
          }
          radius="lg"
          value={prompt}
          variant="flat"
          onValueChange={setPrompt}
        />
      </form>
    </div>
  );
}
