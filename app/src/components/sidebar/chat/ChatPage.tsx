import {
  Page,
  PageContext,
} from "@/components/sidebar/pages/PagesProvider.tsx";
import { PromptWrapper } from "@/components/prompt/PromptWrapper.tsx";
import { Icon } from "@iconify/react";
import { useContext, useEffect, useRef } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { ScrollShadow } from "@heroui/react";
import { InChatEditor } from "@/components/sidebar/chat/InChatEditor.tsx";

export function ChatPage({ page }: { page: Page }) {
  const { session } = useContext(SessionContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
    }
  }, [page]);

  if (!page.chats) return null;
  const { messages } = page.chats;
  if (!messages) return null;

  return (
    <div className="flex flex-col max-w-[50em] w-full font-inter min-h-full mx-auto">
      <ScrollShadow
        hideScrollBar
        size={100}
        className="flex-grow w-full"
        ref={messagesEndRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex p-1 my-5 ${message.role === "user" ? "justify-end" : "justify-start"}`}
          >
            <div className={"flex flex-row gap-2 items-center"}>
              <div
                className={`rounded py-1 px-2 text-[#efefef] ${
                  message.role === "user" ? "bg-gray-700 " : ""
                }`}
              >
                {message.content}
                {message.role === "hissab" && message.expressions && (
                  <InChatEditor expressions={message.expressions} />
                )}
              </div>
              {message.role === "user" && (
                <img
                  src={`https://robohash.org/${session?.user.email}.png`}
                  className={
                    "w-6 h-6 rounded-full bg-purple-700 ring-2 ring-purple-500"
                  }
                />
              )}
            </div>
          </div>
        ))}
      </ScrollShadow>
      <PromptWrapper />
    </div>
  );
}
