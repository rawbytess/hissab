import React from "react";
import { cn } from "@/lib/utils.ts";
import { Icon } from "@iconify/react";
import { Image, Link } from "@heroui/react";

export function Comparison() {
  return (
    <section>
      <div className="flex flex-col items-center justify-center w-full p-4 text-light">
        <h2
          className={
            "text-transparent bg-clip-text bg-gradient-to-r from-neutral-300 via-teal-100 to-red-400"
          }
        >
          Competitors? We Did the Math
        </h2>
        <p className={"text-xl text-gray-400"}>
          Hissab is the only calculator that combines full natural language with
          absolute accuracy.
        </p>
        <ComparisonTable />
      </div>
    </section>
  );
}

export const columns = [
  { name: "Features", uid: "features" },
  {
    name: (
      <div className={"flex flex-col items-center"}>
        <Image src="/img/logomark.svg" className={"w-6"} alt="Hissab logo" />
        <p className={"text-lg"}>Hissab</p>
      </div>
    ),
    uid: "hissab",
  },
  { name: "Default calculator apps", uid: "default-calculator" },
  { name: "LLMs (like ChatGPT)", uid: "llms" },
  { name: "Numi", uid: "numi" },
  { name: "Soulver", uid: "soulver" },
  { name: "Google Search", uid: "google-search" },
  { name: "Apple Math Notes", uid: "apple-math-notes" },
];

export const features = [
  [
    "Just type and calculate",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
      Free
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
      Free, Limited
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
      Free or Paid
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
      Paid
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
      Paid
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
      Free
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
      Free
    </div>,
  ],
  [
    "Available on all platforms",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
  ],
  [
    "Organize calculations as notes",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
    </div>,
    ,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
  ],
  [
    "Revisit and edit calculations",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
  ],
  [
    "Variables & Cascading results ",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
  ],
  [
    "Unit conversion, Date time, and advanced operations",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
      Limited to unit conversion
    </div>,
  ],
  [
    "Full natural language with AI",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
      Limited
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
  ],
  [
    "Accurate Answers",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
      Can Hallucinate
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
  ],
  [
    "Refer custom documents and images in calculations",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
  ],
  [
    "Realtime data",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
      Limited
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"eva:checkmark-outline"} width={24} color={"#8B8000"} />
      Limited
    </div>,
  ],
  [
    "Multilingual",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
  ],
  [
    "Rest APIs",
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
      (Coming Soon)
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon={"meteor-icons:check-double"} width={24} color={"#66FF99"} />
    </div>,
    <div className={"flex flex-col gap-2 items-center"}>
      <Icon icon="entypo:cross" color={"red"} width={24} />
    </div>,
  ],
];

function ComparisonTable() {
  return (
    <table
      aria-label="Example table with custom cells"
      className={
        "bg-stone-800 ring-2 ring-stone-600 rounded-2xl mt-10 text-light"
      }
    >
      <thead className={""}>
        <tr className={"border-b-2 border-stone-600"}>
          {columns.map((column, i) => (
            <th
              key={column.uid}
              className={cn(
                "text-light font-normal py-2 px-4 pb-2 max-w-[8em] text-xs border-r-1 border-stone-600 align-bottom",
                i === 1 ? "bg-purple-700 border-b-2 border-stone-500" : "",
                i === columns.length - 1 ? "border-r-0" : "",
              )}
            >
              {column.name}
            </th>
          ))}
        </tr>
      </thead>
      <tbody>
        {features.map((item, i) => (
          <tr
            key={i}
            className={cn(
              "border-b-1 border-stone-600",
              i % 2 === 0 ? "bg-stone-900" : "",
              i === features.length - 1 ? "border-b-0" : "",
            )}
          >
            {item.map((columnKey, ind) => (
              <td
                key={ind}
                className={cn(
                  "px-1 py-2 text-xs max-w-[8em] text-light font-light border-r-1 border-stone-600",
                  ind === 1 ? "bg-purple-700 border-b-1 border-stone-500" : "",
                  ind === 1 && i === features.length - 1 ? "border-b-0" : "",
                  ind === 0 ? "font-normal max-w-[12em]  pr-2 text-right" : "",
                  ind === item.length - 1 ? "border-r-0" : "",
                )}
              >
                {item[ind]}
              </td>
            ))}
          </tr>
        ))}
      </tbody>
    </table>
  );
}
