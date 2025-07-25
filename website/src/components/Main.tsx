import { Button, Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useState } from "react";
import AISection from "@/components/Home/AISection.tsx";
import ApiSection from "@/components/Home/APISection.tsx";
import Classic from "@/components/Home/Classic.tsx";
import { Comparison } from "@/components/Home/Comparison.tsx";
import Platforms from "@/components/Home/Platforms.tsx";
import { cn } from "@/lib/utils";

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
            World's Most <br /> Powerful Calculator
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

      <Classic />
      <AISection />
      <Comparison />
      <Platforms />
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
