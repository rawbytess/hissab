import React, { useContext } from "react";
import { addToast, Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { cn } from "@heroui/react";

import PromptInput from "./PromptInput.tsx";
import { Infinity } from "ldrs/react";
import {
  ChatPage,
  PageContext,
} from "@/components/sidebar/pages/PagesProvider.tsx";
import { getAIResult } from "@/queries/useAIPromptQuery.tsx";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { AIRequestChat } from "../../../../lib/types/AITypes.ts";
import { PromptButtons } from "@/components/prompt/PromptButtons.tsx";
import { run } from "../../../../lib/errors.ts";
import { sleep } from "../../../../lib/utils.ts";

export function PromptWrapper() {
  const [prompt, setPrompt] = React.useState<string>("");
  const [loading, setLoading] = React.useState<boolean>(false);

  const { updateNote, currentPageNumber, currentPage } =
    useContext(PageContext);
  const { isPremium } = useContext(SessionContext);

  const currPage = currentPage as ChatPage;

  const req: AIRequestChat = {
    inline: false,
    explain: currPage.explain,
    fallback: currPage.fallback,
    prompt: prompt,
    model: currPage.model,
    file: currPage.file
      ? {
          url: currPage.file?.geminiFile?.uri ?? "",
          name: currPage.file?.name ?? "",
          mimeType: currPage.file?.mimeType ?? "",
        }
      : undefined,
    history: currPage.chats.messages
      .filter((message) => message.role === "user" || message.role === "hissab")
      .map((message) => ({
        role: message.role === "user" ? "user" : "assistant",
        content: message.content,
      })),
  };

  if (!currentPageNumber) return null;

  function formSubmit(
    e:
      | React.FormEvent<HTMLFormElement>
      | React.KeyboardEvent<HTMLInputElement>
      | KeyboardEvent,
  ) {
    e.preventDefault();
    if (prompt.length === 0) return;
    updateNote(currPage.id, "", "chat", undefined, {
      content: prompt,
      createdAt: Date.now(),
      role: "user",
    });
    setLoading(true);
    getAIResult(req)
      .then((data) => {
        if (!data) return;
        updateNote(currPage.id, "", "chat", undefined, {
          content: data.naturalAnswer,
          expressions: data.expressions.map((x) => x.expression),
          createdAt: Date.now(),
          role: "hissab",
          error: false,
        });
      })
      .catch((err) => {
        addToast({
          title: "Error",
          description: `${err.userMessage}`,
          timeout: 5000,
          shouldShowTimeoutProgress: true,
          variant: "flat",
          color: "danger",
          icon: <Icon icon="bxs:error" width="20" height="20" />,
        });
      })
      .finally(() => {
        setLoading(false);
        setPrompt("");
      });
  }

  return (
    <div className="flex flex-col gap-8 items-center justify-end pb-10 fixed bottom-10 z-50 max-w-[50em] px-4 w-fill bg-[#1c1c1c]">
      <div className="flex flex-col gap-2 rounded-2xl w-full">
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
                "absolute -top-3 left-1 ring-2 ring-stone-800 rounded-full bg-stone-900 text-stone-400 cursor-pointer",
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
              isPremium ? "ring-purple-700" : "ring-gray-600",
            )}
            onSubmit={(e) => {
              formSubmit(e);
            }}
          >
            <PromptInput
              classNames={{
                inputWrapper: "!bg-transparent shadow-none h-auto",
                innerWrapper: "relative",
                input:
                  "pt-1 pl-2 pb-6 !pr-10 text-medium disabled:cursor-not-allowed disabled:opacity-50",
              }}
              disabled={!isPremium || loading}
              minRows={3}
              maxRows={10}
              endContent={
                <div className="flex flex-col items-end gap-2">
                  {loading ? (
                    <div className={"mt-1"}>
                      <Infinity
                        size="40"
                        stroke="4"
                        stroke-length="0.15"
                        bg-opacity="0.2"
                        speed="1.3"
                        color="#8100ff"
                      ></Infinity>
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
              onKeyDown={async (e) => {
                if (e.key === "Enter" && !e.shiftKey) {
                  await formSubmit(e);
                }
              }}
              value={prompt}
              variant="flat"
              onValueChange={setPrompt}
            />
            <PromptButtons prompt={prompt} />
          </form>
        </div>
      </div>
    </div>
  );
}
