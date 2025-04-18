import { ChatPage } from "@/components/sidebar/pages/PagesProvider.tsx";
import { PromptWrapper } from "@/components/prompt/PromptWrapper.tsx";
import { useContext, useEffect, useRef } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { ScrollShadow } from "@heroui/react";
import { InChatEditor } from "@/components/sidebar/chat/InChatEditor.tsx";
import { cn } from "@/lib/utils.ts";
import { Icon } from "@iconify/react";

export function ChatPageWrapper({ page }: { page: ChatPage }) {
  const { session } = useContext(SessionContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollTop = messagesEndRef.current.scrollHeight;
      }
    }, 10);
  }, [page]);

  if (!page.chats) return null;
  const { messages } = page.chats;
  if (!messages) return null;

  return (
    <div className="flex flex-col max-w-[50em] w-full font-inter min-h-full mx-auto">
      <ScrollShadow
        size={100}
        className="flex-grow w-full chat-scrollbar p-5 overscroll-auto"
        ref={messagesEndRef}
      >
        {messages.map((message, index) => (
          <div
            key={index}
            className={cn(
              `flex p-1 my-5`,
              message.role === "user" ? "justify-end" : "justify-start",
            )}
          >
            <div
              className={cn(
                `flex flex-row gap-2 items-center`,
                message.role === "hissab" ? "w-full" : "",
              )}
            >
              <div
                className={cn(
                  `rounded py-1 px-2 text-[#efefef] w-full`,
                  message.role === "user" ? "bg-gray-700 " : "",
                  message.role === "hissab" && message.error
                    ? "text-red-500"
                    : "",
                )}
              >
                {message.role === "hissab" && message.error ? (
                  <div className="flex gap-2 items-center">
                    <Icon icon="bxs:error" width="24" height="24" />
                    {message.content}
                  </div>
                ) : (
                  message.content
                )}
                {message.role === "hissab" &&
                  message.expressions.length > 0 && (
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
