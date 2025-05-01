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
        <Button
          size="sm"
          disabled={isPremium !== "AI Plus"}
          startContent={
            <Icon
              className={currPage?.explain ? "text-purple-300" : "text-white"}
              icon="fluent:apps-list-detail-20-filled"
              width={16}
            />
          }
          onPress={() => {
            toggleExplain(currentPage?.id ?? "");
          }}
          className={currPage?.explain ? "bg-purple-700" : ""}
          variant="solid"
        >
          Explain
        </Button>
        <Tooltip
          content={
            <div>
              Hybrid Mode on: Use Hissab + LLMs to compute expressions. When
              Hybrid mode is off, only Hissab is used for calculations.
            </div>
          }
          className={"text-gray-300 bg-stone-800"}
        >
          <Button
            size="sm"
            disabled={isPremium !== "AI Plus"}
            startContent={
              <Icon
                className={
                  currPage?.fallback ? "text-purple-300" : "text-white"
                }
                icon="fluent:apps-list-detail-20-filled"
                width={16}
              />
            }
            onPress={() => {
              toggleFallback(currentPage?.id ?? "");
            }}
            className={currPage?.fallback ? "bg-purple-700" : ""}
            variant="solid"
          >
            Hybrid Mode
          </Button>
        </Tooltip>
      </div>
      {maxPromptLength && (
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
      )}
    </div>
  );
}

export default function ModelListDropdown({
  isPremium,
}: {
  isPremium?: string | null;
}) {
  const { currentPage, updateModel, currentPageNumber } =
    useContext(PageContext);

  const [selectedKeys, setSelectedKeys] = useState<Selection>(
    new Set([currentPage?.model ?? chatDefaultModel]),
  );
  useEffect(() => {
    updateModel(currentPageNumber, Array.from(selectedKeys)[0] as Models);
  }, [currentPageNumber, selectedKeys, updateModel]);

  return (
    <Dropdown className={"text-white"}>
      <DropdownTrigger>
        <Button
          size="sm"
          disabled={isPremium !== "AI Plus"}
          startContent={
            <Icon
              className="text-white"
              icon="hugeicons:artificial-intelligence-04"
              width={16}
            />
          }
          variant="solid"
        >
          {ModelsMap[Array.from(selectedKeys)[0] as Models].name}
        </Button>
      </DropdownTrigger>
      <DropdownMenu
        disallowEmptySelection
        selectedKeys={selectedKeys}
        selectionMode="single"
        variant="solid"
        onSelectionChange={setSelectedKeys}
      >
        <DropdownSection title="Small">
          {(Object.keys(ModelsMap) as Models[])
            .filter((model) => ModelsMap[model].size === "small")
            .map((model) => (
              <DropdownItem
                key={model}
                description={`${modelRateLimits["small"][isPremium as ProductNames]} prompts per day`}
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
                <p className={"text-xs"}>{ModelsMap[model].name}</p>
              </DropdownItem>
            ))}
        </DropdownSection>
        <DropdownSection title="Medium">
          {(Object.keys(ModelsMap) as Models[])
            .filter((model) => ModelsMap[model].size === "medium")
            .map((model) => (
              <DropdownItem
                key={model}
                description={`${modelRateLimits["medium"][isPremium as ProductNames]} prompts per day`}
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
                <p className={"text-xs"}>{ModelsMap[model].name}</p>
              </DropdownItem>
            ))}
        </DropdownSection>
        <DropdownSection title="Large">
          {(Object.keys(ModelsMap) as Models[])
            .filter((model) => ModelsMap[model].size === "large")
            .map((model) => (
              <DropdownItem
                key={model}
                description={`${modelRateLimits["large"][isPremium as ProductNames]} prompts per day`}
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
                <p className={"text-xs"}>{ModelsMap[model].name}</p>
              </DropdownItem>
            ))}
        </DropdownSection>
      </DropdownMenu>
    </Dropdown>
  );
}
