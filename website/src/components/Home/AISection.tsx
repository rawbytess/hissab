import { Button, Card, CardBody, CardHeader, Tab, Tabs } from "@heroui/react";
import Video from "@/components/Video.tsx";
import { Icon } from "@iconify/react";
import HissabExample from "@/components/HissabExample.tsx";
import { useEffect, useState } from "react";

const prompts = [
  "Apply a 20% discount to 500 dollars",
  "Convert 10 miles to kilometers",
  "Calculate the average of 10, 20, and 30",
  "I earn $4500 per month, spend $1200 on rent, $600 on food, and $200 on utilities. How much do I save per year?",
  "What is the square root of 144?",
  "If 40% of a number is 200, what is the original number?",
  "If I start a 2-hour movie at 7:30 PM, what time will it end?",
  "How many ways can I choose 4 students from a class of 10?",
  "Find the LCM of 12, 18, and 30. Then calculate the GCD of the same numbers. What is the product of the LCM and GCD?",
  "Calculate the variance of 45, 56, 67, 78, 89.",
  "How many days are between July 4, 2022, and December 25, 2022?",
  "Add 0b1010 and 0x1F4 and convert the result to octal.",
  "Find the complementary color of yellow",
  "A train leaves Station A at 8:15 AM and arrives at Station B at 11:45 AM. The distance is 165 kilometers. What was the average speed of the train in km/h?",
  "what is the remainder when 123 is divided by 11?",
  "I was born on 15th June 1995. How old am I today?",
  "I want to mix a red (#FF0000) paint with a blue (#0000FF) paint. What is the resulting color in RGB?",
  "A startup’s revenue grows from 50k in 4 years. What’s the CAGR?",
  "A flight from NYC to London is 7 hours. If I leave at 3:45 PM EST, what’s the arrival time in london?",
];

function AISection() {
  const [windowWidth, setWindowWidth] = useState(0);
  const handleResize = () => {
    setWindowWidth(window.innerWidth);
  };
  useEffect(() => {
    setWindowWidth(window.innerWidth); // Accessing window API safely on the client
    window.addEventListener("resize", handleResize);
  }, []);
  return (
    <section>
      <div className="flex flex-col items-center justify-center w-full p-4 text-light">
        <h2
          className={
            "text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100"
          }
        >
          ...Then we added the Magic
        </h2>
        <p className={"text-xl text-gray-400"}>
          Understands your words. Calculates with precision.
        </p>

        <div className="flex flex-row gap-5 flex-wrap justify-center mt-4">
          {prompts.map((prompt, index) => (
            <GradientBorder key={index}>
              <p className="text-light font-light tracking-wider text-xs">
                {prompt}
              </p>
            </GradientBorder>
          ))}
        </div>
      </div>
      <div className="flex items-center flex-col ring-2 promo-imgs ring-stone-600 bg-stone-900 max-w-[50em]">
        <Tabs
          aria-label="Options"
          className={"items-center"}
          isVertical={windowWidth < 680}
          variant={windowWidth > 680 ? "underlined" : "light"}
          classNames={{
            base: "mt-2 mb-4 w-full justify-around",
            panel: "p-0",
            tabList: `${windowWidth < 680 ? "flex-wrap" : ""}`,
          }}
        >
          <Tab
            key="inline"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"lets-icons:line-in-alt"}
                  width={16}
                  className={""}
                  color="#efefef"
                />
                Inline AI
              </div>
            }
          >
            <p className={"text-gray-400 mb-3"}>
              Inline AI prompts for quick answers
            </p>
            <img
              src={"/screens/inlineai.png"}
              className={"rounded-b-2xl max-w-[60em] w-full"}
            />
          </Tab>
          <Tab
            key="chat"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"gridicons:chat"}
                  width={16}
                  className={""}
                  color="#efefef"
                />
                Chat bot
              </div>
            }
          >
            <p className={"text-gray-400 mb-3"}>
              Chat with Hissab AI for complex questions.
            </p>
            <img src={"/screens/chatai.png"} className={"rounded-b-2xl"} />
          </Tab>
          <Tab
            key="multimodal"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"bxs:file-doc"}
                  width={16}
                  className={""}
                  color="#efefef"
                />
                Multimodal
              </div>
            }
          >
            <p className={"text-gray-400 mb-3"}>
              Attach and refer documents and images in your chats
            </p>
            <img src={"/screens/multimodal.png"} className={"rounded-b-2xl"} />
          </Tab>
          <Tab
            key="Multilingual"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"fa:language"}
                  width={16}
                  className={""}
                  color="#efefef"
                />
                Multilingual
              </div>
            }
          >
            <p className={"text-gray-400 mb-3"}>
              Hissab AI can understand and respond in multiple languages.
            </p>
            <img src={"/screens/languages.png"} className={"rounded-b-2xl"} />
          </Tab>
          <Tab
            key="realtime"
            title={
              <div className={"flex flex-row gap-2 items-center"}>
                <Icon
                  icon={"mdi:finance"}
                  width={16}
                  className={""}
                  color="#efefef"
                />
                Realtime data
              </div>
            }
          >
            <p className={"text-gray-400 mb-3"}>
              Access real-time data like stock prices, weather, currency rates,
              and more.
            </p>
            <img
              src={"/screens/realtimechat.png"}
              className={"rounded-b-2xl"}
            />
          </Tab>
        </Tabs>
      </div>

      <Button className="mt-6 bg-blue-700 shadow-2xl">
        <a href="/pricing" className="">
          <p>See all Subscription options</p>
        </a>
      </Button>
    </section>
  );
}

function GradientBorder({
  children,
  className,
}: {
  children: React.ReactNode;
  className?: string;
}) {
  const classes = [
    "gray-400",
    "gray-500",
    "gray-600",
    "gray-700",
    "gray-800",
    "slate-400",
    "slate-500",
    "slate-600",
    "slate-700",
    "slate-800",
    "stone-400",
    "stone-500",
    "stone-600",
    "stone-700",
    "stone-800",
    "zinc-400",
    "zinc-500",
    "zinc-600",
    "zinc-700",
    "zinc-800",
    "neutral-400",
    "neutral-500",
    "neutral-600",
    "neutral-700",
    "neutral-800",
  ];
  const gradientDirection = Math.random() < 0.5 ? "to-r" : "to-l";
  const randomColorTo = classes[Math.floor(Math.random() * classes.length)];
  const randomColorFrom = classes[Math.floor(Math.random() * classes.length)];
  const randomColorVia = classes[Math.floor(Math.random() * classes.length)];
  return (
    <div
      className={`rounded-3xl p-px bg-gradient-${gradientDirection} 
      from-${randomColorFrom} via-${randomColorVia} to-${randomColorTo} ${className}`}
    >
      <div className="bg-dark py-2 px-4 rounded-[calc(1.5rem-1px)]">
        {children}
      </div>
    </div>
  );
}

export default AISection;
