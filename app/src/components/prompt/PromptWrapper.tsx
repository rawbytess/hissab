import React, { useContext, useMemo } from "react";
import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";

import PromptInput from "./PromptInput.tsx";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";
import { useAIPromptQuery } from "@/queries/useAIPromptQuery.tsx";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";

export function PromptWrapper() {
  const [prompt, setPrompt] = React.useState<string>("");
  const { editorOperations, updateNote, currentPage } = useContext(PageContext);
  const { metadata, isPaid } = useContext(SessionContext);

  const AIResponse = useAIPromptQuery(prompt, editorOperations.insertText);
  const maxPromptLength = useMemo(() => {
    if (isPaid) {
      return metadata?.subscription?.product_name === "AI Lite"
        ? 500
        : metadata?.subscription?.product_name === "AI Plus"
          ? 2000
          : 0;
    }
    return 0;
  }, [metadata, isPaid]);
  if (!currentPage) return null;

  async function formSubmit(
    e:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLInputElement>
      | KeyboardEvent,
  ) {
    e.preventDefault();
    if (prompt.length === 0) return;
    updateNote(currentPage!.id, "", "chat", {
      content: prompt,
      createdAt: Date.now(),
      role: "user",
    });
    await AIResponse.refetch();
    setPrompt("");
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-end mx-5 mb-10">
      <div className="flex flex-col gap-2 rounded-2xl max-w-[50em] w-full relative">
        {prompt.length > 0 && (
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
              "flex flex-col items-start rounded-medium text-white  transition-colors  bg-[#1c1c1c]  ring-2",
              AIResponse.error ? "ring-red-500 " : "ring-purple-700",
              isPaid ? "ring-purple-700" : "ring-gray-600",
            )}
            onSubmit={async (e) => {
              await formSubmit(e);
            }}
          >
            <PromptInput
              classNames={{
                inputWrapper: "!bg-transparent shadow-none h-auto",
                innerWrapper: "relative",
                input:
                  "pt-1 pl-2 pb-6 !pr-10 text-medium disabled:cursor-not-allowed disabled:opacity-50",
              }}
              disabled={!isPaid}
              minRows={3}
              maxRows={10}
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
                  await formSubmit(e);
                }
              }}
              value={prompt}
              variant="flat"
              onValueChange={setPrompt}
            />
          </form>
        </div>
        <div className={"flex flex-row justify-between items-center mx-2"}>
          {maxPromptLength && (
            <p className="text-tiny text-default-400">
              {prompt.length}/{maxPromptLength}
            </p>
          )}
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
