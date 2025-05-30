import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  Button,
  cn,
  DropdownSection,
  Selection,
  Tooltip,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useContext, useEffect, useMemo, useState } from "react";
import { getMaxCharacterLimit } from "../../../../lib/getPremiumStatus.ts";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import UploadModal from "@/components/prompt/UploadModal.tsx";
import {
  chatDefaultModel,
  modelRateLimits,
  Models,
  ModelSize,
  ModelsMap,
} from "../../../../lib/types/AITypes.ts";
import {
  ChatPage,
  PageContext,
} from "@/components/sidebar/pages/PagesProvider.tsx";
import { ProductNames } from "../../../../lib/types/userMetadata.ts";

export function PromptButtons({ prompt }: { prompt: string }) {
  const { isPremium } = useContext(SessionContext);
  const { currentPage, toggleExplain, toggleFallback } =
    useContext(PageContext);
  const maxPromptLength = useMemo(
    () => getMaxCharacterLimit(isPremium ?? ""),
    [isPremium],
  );
  const currPage = currentPage as ChatPage;

  return (
    <div className="flex w-full items-center justify-between  gap-2 overflow-auto px-4 pb-4">
      <div className="flex w-full gap-1 md:gap-3">
        <ModelListDropdown isPremium={isPremium} />
        <UploadModal />
      </div>
      {maxPromptLength ? (
        <p
          className={cn(
            "text-tiny",
            prompt.length > maxPromptLength
              ? "text-red-400"
              : "text-default-400",
          )}
        >
          {prompt.length}/{maxPromptLength}
          {prompt.length > maxPromptLength && (
            <span className="ml-2">
              Exceeded max length of {maxPromptLength} characters. Excess
              characters will be ignored
            </span>
          )}
        </p>
      ) : null}
    </div>
  );
}

function ModelListDropdown({ isPremium }: { isPremium?: string | null }) {
  const { currentPage, updateModel, currentPageNumber } =
    useContext(PageContext);

  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set([currentPage?.model ?? "medium"]),
  );
  useEffect(() => {
    updateModel(currentPageNumber, Array.from(selectedKeys)[0] as ModelSize);
  }, [currentPageNumber, selectedKeys, updateModel]);

  return (
    <Dropdown className={"text-white"}>
      <DropdownTrigger>
        <Button
          size="sm"
          isDisabled={isPremium !== "AI Plus" && isPremium !== "AI Lite"}
          startContent={
            <Icon
              className="text-white"
              icon="hugeicons:artificial-intelligence-04"
              width={16}
            />
          }
          variant="solid"
          className={"capitalize"}
        >
          {Array.from(selectedKeys)[0]}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        selectedKeys={selectedKeys}
        selectionMode="single"
        variant="solid"
        onSelectionChange={setSelectedKeys}
      >
        <DropdownItem
          key={"small"}
          description={`${modelRateLimits["small"][isPremium as ProductNames]} prompts per day`}
          isDisabled={modelRateLimits["small"][isPremium as ProductNames] === 0}
          startContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path
                fill="#448aff"
                d="M15 8.014A7.457 7.457 0 0 0 8.014 15h-.028A7.456 7.456 0 0 0 1 8.014v-.028A7.456 7.456 0 0 0 7.986 1h.028A7.457 7.457 0 0 0 15 7.986z"
              />
            </svg>
          }
        >
          <p className={"text-xs"}>Small</p>
        </DropdownItem>

        <DropdownItem
          key={"medium"}
          description={`${modelRateLimits["medium"][isPremium as ProductNames]} prompts per day`}
          isDisabled={
            modelRateLimits["medium"][isPremium as ProductNames] === 0
          }
          startContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path
                fill="#448aff"
                d="M15 8.014A7.457 7.457 0 0 0 8.014 15h-.028A7.456 7.456 0 0 0 1 8.014v-.028A7.456 7.456 0 0 0 7.986 1h.028A7.457 7.457 0 0 0 15 7.986z"
              />
            </svg>
          }
        >
          <p className={"text-xs"}>Medium</p>
        </DropdownItem>

        <DropdownItem
          key={"large"}
          description={
            modelRateLimits["large"][isPremium as ProductNames] > 0
              ? `${modelRateLimits["large"][isPremium as ProductNames]} prompts per day`
              : "Upgrade to AI Plus to use this model"
          }
          isDisabled={modelRateLimits["large"][isPremium as ProductNames] === 0}
          startContent={
            <svg
              xmlns="http://www.w3.org/2000/svg"
              width="16"
              height="16"
              viewBox="0 0 16 16"
            >
              <path
                fill="#448aff"
                d="M15 8.014A7.457 7.457 0 0 0 8.014 15h-.028A7.456 7.456 0 0 0 1 8.014v-.028A7.456 7.456 0 0 0 7.986 1h.028A7.457 7.457 0 0 0 15 7.986z"
              />
            </svg>
          }
        >
          <p className={"text-xs"}>Large</p>
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
