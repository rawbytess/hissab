import { ChatPage } from "@/components/sidebar/pages/PagesProvider.tsx";
import { PromptWrapper } from "@/components/prompt/PromptWrapper.tsx";
import { forwardRef, useContext, useEffect, useRef } from "react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { InChatEditor } from "@/components/sidebar/chat/InChatEditor.tsx";
import { cn } from "@/lib/utils.ts";
import ChatMessageOptions from "@/components/sidebar/chat/ChatMessageOptions.tsx";
import { Avatar, Card, CardBody, CardHeader, CardProps } from "@heroui/react";
import { Icon } from "@iconify/react";

const featuresCategories = [
  {
    key: "capabilities",
    title: "Capabilities",
    icon: (
      <Icon icon="solar:magic-stick-3-linear" color="SlateBlue" width={30} />
    ),
    descriptions: [
      "All sorts of general calculations, unit conversions, date and time calculations, and so much more.",
      "Multimodal with file attachments",
      "Choice of various size models",
    ],
  },
  {
    key: "examples",
    title: "Examples",
    icon: <Icon icon="solar:mask-happly-linear" color="DarkCyan" width={30} />,
    descriptions: [
      "My monthly income is $6,200. I spend $1,800 on rent, $400 on utilities, $600 on food, and $350 on transportation. I also have a student loan payment of $200 per month. If I save 15% of my remaining income, how much will I have saved in 5 years?",
      "I'm planning a trip from London to Tokyo. If the flight time is 12 hours and 30 minutes, and I leave London at 10:00 AM GMT, what time will I arrive in Tokyo local time?",
      "I have a dataset of test scores: 78, 85, 92, 68, 75, 89. What is the average and standard deviation of these scores?",
    ],
  },
  {
    key: "limitations",
    title: "Limitations",
    icon: (
      <Icon icon="solar:shield-warning-outline" color="LimeGreen" width={30} />
    ),
    descriptions: [
      "May occassionaly generate incorrect hissab expressions. Please verify the expressions.",
      "For calculations that hissab does not support, it will fallback to LLMs which may hallucinate.",
      "Rate limits apply.",
    ],
  },
];

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
  if (messages.length === 0)
    return (
      <div className="flex flex-col max-w-[50em] w-full mx-auto mb-[15em]">
        <div className="flex w-full flex-col items-center justify-center gap-2 mb-32">
          <Avatar size="md" src="/icons/64.png" />
          <h1 className="text-xl font-medium text-default-600">
            What can I calculate for you today?
          </h1>
        </div>
        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 md:grid-cols-3">
          {featuresCategories.map((category) => (
            <FeatureCard
              key={category.key}
              descriptions={category.descriptions}
              icon={category.icon}
              title={category.title}
            />
          ))}
        </div>
        <PromptWrapper />
      </div>
    );

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
              expressions={message.expressions}
            />
          )}
          <div
            className={cn(
              `flex flex-row gap-2 items-end`,
              message.role === "hissab" ? "w-full" : "",
            )}
          >
            <div
              className={cn(
                `rounded px-4 text-[#efefef] w-full`,
                message.role === "user" ? "bg-gray-700 py-2" : "",
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
              {message.role === "hissab" &&
                message.webSearchContext &&
                message.webSearchContext.length > 0 && (
                  <div className="mt-5 text-sm text-gray-400">
                    <div className="font-semibold">Real time data context:</div>
                    {message.webSearchContext
                      .split("\n")
                      .map((x) => removeNumericPattern(x.trim()))
                      .join("\n")}
                    .
                  </div>
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

export type FeatureCardProps = CardProps & {
  title: string;
  descriptions: string[];
  icon: React.ReactNode;
};

const FeatureCard = forwardRef<HTMLDivElement, FeatureCardProps>(
  ({ title, descriptions = [], icon, ...props }, ref) => {
    return (
      <Card
        ref={ref}
        className="bg-stone-800 ring-2 ring-stone-600"
        shadow="none"
        {...props}
      >
        <CardHeader className="flex flex-col gap-2 px-4 pb-4 pt-6">
          {icon}
          <p className="text-sm text-stone-400">{title}</p>
        </CardHeader>
        <CardBody className="flex flex-col gap-2">
          {descriptions.map((description, index) => (
            <div
              key={index}
              className="flex min-h-[50px] rounded-medium bg-stone-600 px-3 py-2 text-stone-400"
            >
              <p className="text-xs">{description}</p>
            </div>
          ))}
        </CardBody>
      </Card>
    );
  },
);

function removeNumericPattern(str: string) {
  const pattern = /(\[\d+\])+\.$/;
  return str.replace(pattern, "");
}
