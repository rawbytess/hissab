import {
  Dropdown,
  DropdownTrigger,
  DropdownMenu,
  DropdownItem,
  addToast,
} from "@heroui/react";
import { Icon } from "@iconify/react";
import React, { useContext } from "react";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";

export default function ChatMessageOptions({
  index,
  role,
  email,
  message,
  expressions,
}: {
  index: number;
  role: "hissab" | "user";
  email: string;
  message: string;
  expressions?: string[];
}) {
  const { currentPageNumber, deleteChatMessage } = useContext(PageContext);

  return (
    <Dropdown className={"bg-blue-950 text-gray-300"}>
      <DropdownTrigger>
        {role === "hissab" ? (
          <img
            src="/icons/32.png"
            className={"w-6 h-6 cursor-pointer rounded-full shadow"}
          />
        ) : (
          <img
            src={`https://robohash.org/${email}.png`}
            className={
              "w-6 h-6 rounded-full bg-purple-700 ring-2 ring-purple-500 cursor-pointer shadow"
            }
          />
        )}
      </DropdownTrigger>
      <DropdownMenu>
        <DropdownItem
          key="copy"
          startContent={
            <Icon icon="fluent:copy-16-filled" width="16" height="16" />
          }
          onPress={() => {
            navigator.clipboard.writeText(message).then(() => {
              addToast({
                title: "Copied!",
                timeout: 2000,
                shouldShowTimeoutProgress: true,
                variant: "solid",
              });
            });
          }}
        >
          Copy
        </DropdownItem>
        <DropdownItem
          key="delete"
          className="text-danger"
          color="danger"
          startContent={
            <Icon icon="fluent:delete-16-filled" width="16" height="16" />
          }
          onPress={() => deleteChatMessage(currentPageNumber, index)}
        >
          Delete
        </DropdownItem>
      </DropdownMenu>
    </Dropdown>
  );
}
