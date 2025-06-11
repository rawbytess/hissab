import { useState } from "react";
import { Button, Tooltip } from "@heroui/react";
import { cn } from "@/lib/utils";
import { Icon } from "@iconify/react";
import Classic from "@/components/Home/Classic.tsx";
import AISection from "@/components/Home/AISection.tsx";
import ApiSection from "@/components/Home/APISection.tsx";
import { Comparison } from "@/components/Home/Comparison.tsx";

const firstPromo = "/resources/home/first-promo.png";
const freePromo = "/resources/home/free-promo.png";
const proPromo = "/resources/home/pro-promo.png";
const sample1 = "/screens/sample1.jpg";
const sample2 = "/screens/sample2.jpg";
const hero = "/screens/hero.png";

export default function Main() {
  return (
    <>
      <section>
        <div className="flex flex-col gap-2 items-center drop-shadow-2xl tracking-widest">
          <div
            className={
              "flex flex-row align-baseline items-center gap-0 font-thin"
            }
          >
            <div className={"hero-text-size-sm text-cyan-500 max-w-[5em]"}>
              Natural Language
            </div>
            <Icon icon={"ph:plus-thin"} width={30} color="#efefef" />
            <div className={"hero-text-size-sm text-amber-500 max-w-[5em]"}>
              Hissab Engine
            </div>
            <Icon icon={"ph:plus-thin"} width={30} color="#efefef" />
            <div className={"hero-text-size-sm text-emerald-500 max-w-[5em]"}>
              Intuitive Interface
            </div>
          </div>

          <Icon
            icon={"streamline:equal-sign"}
            width={30}
            className="my-5"
            color="#efefef"
          />

          <h1
            className={
              "hero-text-size-lg font-black text-transparent bg-clip-text bg-gradient-to-r from-violet via-purple-500 to-indigo-500"
            }
          >
            World's Most Powerful Vibe Calculator
          </h1>

          <p className={cn("text-zinc-400")}>(No Exaggeration, really)</p>
        </div>

        <ul
          className={
            "flex flex-row flex-wrap justify-center gap-10 text-gray-300 mt-10 max-w-[50em]"
          }
        >
          <li className={"flex flex-row gap-2 items-center"}>
            <Icon icon={"hugeicons:artificial-intelligence-04"} width={20} />
            <p>AI Powered</p>
          </li>
          <li className={"flex flex-row gap-2 items-center"}>
            <Icon icon={"octicon:goal-24"} width={20} />
            <p>Accurate Answers</p>
          </li>
          <li className={"flex flex-row gap-2 items-center"}>
            <Icon icon={"lets-icons:lightning-duotone"} width={20} />
            <p>Lightning Fast</p>
          </li>
          <li className={"flex flex-row gap-2 items-center"}>
            <Icon icon={"pajamas:false-positive"} width={20} />
            <p>No Hallucination</p>
          </li>
          <li className={"flex flex-row gap-2 items-center"}>
            <Icon icon={"fluent:coin-multiple-24-filled"} width={20} />
            <p>Wide range of operations</p>
          </li>
          <li className={"flex flex-row gap-2 items-center"}>
            <Icon icon={"fa:language"} width={20} />
            <p>Multilingual</p>
          </li>
          <li className={"flex flex-row gap-2 items-center"}>
            <Icon icon={"mdi:finance"} width={20} />
            <p>Realtime data</p>
          </li>
        </ul>

        <img
          src={hero}
          className={"max-w-[60em] w-full drop-shadow-lg mt-10"}
        />
        <h4
          className={
            "sub-hero-text text-stone-300 tracking-wider whitespace-pre-line mt-12 max-w-[40em]"
          }
        >
          Hissab is an all in one, versatile AI Powered natural language
          calculator that ensures accurate answers. <br />
          Hissab is useful for performing quick day-to-day calculations as well
          as complex brainstorming and planning.
        </h4>
      </section>
      <section>
        <h2
          className={
            "text-transparent bg-clip-text bg-gradient-to-r from-[#60C7F0] via-[#57C785] to-[#EDDD53]"
          }
        >
          Runs on Anything with a Screen
        </h2>
        <p className={"text-xl text-gray-400"}>
          Cross-Platform? Cross It Off Your Worry List
        </p>
        <div className={"flex flex-row flex-wrap justify-around gap-5 mt-5"}>
          <Tooltip
            content={"Web"}
            showArrow
            offset={0}
            closeDelay={0}
            delay={0}
            disableAnimation
            className={"text-white bg-neutral-700 rounded-2xl"}
          >
            <Icon icon={"streamline:web-solid"} width={30} color="#efefef" />
          </Tooltip>
          <div></div>
          <Tooltip
            content={"iOS as PWA"}
            showArrow
            offset={0}
            closeDelay={0}
            delay={0}
            disableAnimation
            className={"text-white bg-neutral-700 rounded-2xl"}
          >
            <Icon icon={"lineicons:ios"} width={30} color="#efefef" />
          </Tooltip>
          <Tooltip
            content={"Android as PWA"}
            showArrow
            offset={0}
            closeDelay={0}
            delay={0}
            disableAnimation
            className={"text-white bg-neutral-700 rounded-2xl"}
          >
            <Icon icon={"uil:android"} width={30} color="#efefef" />
          </Tooltip>
          <div></div>
          <Tooltip
            content={"MacOS as PWA"}
            showArrow
            offset={0}
            closeDelay={0}
            delay={0}
            disableAnimation
            className={"text-white bg-neutral-700 rounded-2xl"}
          >
            <Icon icon={"wpf:mac-os"} width={30} color="#efefef" />
          </Tooltip>
          <Tooltip
            content={"Windows as PWA"}
            showArrow
            offset={0}
            closeDelay={0}
            delay={0}
            disableAnimation
            className={"text-white bg-neutral-700 rounded-2xl"}
          >
            <Icon icon={"bi:windows"} width={30} color="#efefef" />
          </Tooltip>
          <Tooltip
            content={"Linux as PWA"}
            showArrow
            offset={0}
            closeDelay={0}
            delay={0}
            disableAnimation
            className={"text-white bg-neutral-700 rounded-2xl"}
          >
            <Icon
              icon={"ant-design:linux-outlined"}
              width={30}
              color="#efefef"
            />
          </Tooltip>
          <div></div>
          <Tooltip
            content={"Chrome Extension & ChromeOS"}
            showArrow
            offset={0}
            closeDelay={0}
            delay={0}
            disableAnimation
            className={"text-white bg-neutral-700 rounded-2xl"}
          >
            <Icon icon={"teenyicons:chrome-solid"} width={30} color="#efefef" />
          </Tooltip>
          <Tooltip
            content={"Chrome Extension on Edge"}
            showArrow
            offset={0}
            closeDelay={0}
            delay={0}
            disableAnimation
            className={"text-white bg-neutral-700 rounded-2xl"}
          >
            <Icon icon={"ri:edge-new-fill"} width={35} color="#efefef" />
          </Tooltip>
        </div>
        <Button className="mt-10 bg-blue-700">
          <a href="/installation" className="flex flex-col">
            <p>See how to install</p>
          </a>
        </Button>
      </section>
      <Classic />
      <AISection />
      <Comparison />
      <ApiSection />
      <section>
        <h2
          className={
            "text-transparent bg-clip-text bg-gradient-to-r from-fuchsia-200 via-slate-300 to-orange-200 mb-5 text-3xl max-w-[30em]"
          }
        >
          Is Hissab a calculator app, planning & productivity tool, an AI
          assistant or a platform for developers?
          <span className={"text-gray-300 ml-3"}>🤔</span>
        </h2>
        <p className={"text-stone-300 text-2xl"}>😎 YES!</p>
      </section>
    </>
  );
}
