import { ChatPage } from "@/components/sidebar/pages/PagesProvider.tsx";
import { PromptWrapper } from "@/components/prompt/PromptWrapper.tsx";
import { useContext, useEffect, useRef } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { InChatEditor } from "@/components/sidebar/chat/InChatEditor.tsx";
import { cn } from "@/lib/utils.ts";
import ChatMessageOptions from "@/components/sidebar/chat/ChatMessageOptions.tsx";

export function ChatPageWrapper({ page }: { page: ChatPage }) {
  const { session } = useContext(SessionContext);
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const { messages } = page.chats;
  useEffect(() => {
    setTimeout(() => {
      if (messagesEndRef.current) {
        messagesEndRef.current.scrollIntoView();
      }
    }, 10);
  }, [page]);

  if (!page.chats) return null;
  if (!messages) return null;

  return (
    <div className="flex flex-col max-w-[50em] w-full mx-auto mb-[15em]">
      {messages.map((message, index) => (
        <div
          key={index}
          className={cn(
            `flex p-1 my-5 relative whitespace-pre-line`,
            message.role === "user" ? "justify-end" : "justify-start",
          )}
        >
          {message.role === "hissab" && (
            <ChatMessageOptions
              index={index}
              role={"hissab"}
              email={session?.user.email ?? ""}
              message={message.content}
            />
          )}
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
                  {message.content}
                  {message.role === "hissab" &&
                    message.expressions.length > 0 && (
                      <InChatEditor expressions={message.expressions} />
                    )}
                </div>
              ) : (
                message.content
              )}
              {message.role === "hissab" && message.expressions.length > 0 && (
                <InChatEditor expressions={message.expressions} />
              )}
            </div>
            {message.role === "user" && (
              <ChatMessageOptions
                index={index}
                role={"user"}
                email={session?.user.email ?? ""}
                message={message.content}
              />
            )}
          </div>
        </div>
      ))}

      <div ref={messagesEndRef} />
      <PromptWrapper />
    </div>
  );
}
