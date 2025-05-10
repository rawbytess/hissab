import { useState } from "react";
import { Tooltip } from "@heroui/react";
import { cn } from "@/lib/utils";

const firstPromo = "/resources/home/first-promo.png";
const freePromo = "/resources/home/free-promo.png";
const proPromo = "/resources/home/pro-promo.png";

export default function Main() {
  const [fnlHovered, setFnlHovered] = useState(false);
  const [hissabHovered, setHissabHovered] = useState(false);
  const [uxHovered, setUxHovered] = useState(false);
  const [noExaggerationHovered, setNoExaggerationHovered] = useState(false);

  return (
    <>
      <section>
        <div className="flex flex-col items-center drop-shadow-2xl tracking-widest">
          <h2
            className={
              "hero-text-size-sm text-cyan-300 hover:text-cyan-500 cursor-pointer font-black"
            }
            onMouseEnter={() => setFnlHovered(true)}
            onMouseLeave={() => setFnlHovered(false)}
          >
            Full Natural Language
          </h2>

          <p
            className={cn(
              "text-cyan-500 text-lg max-w-[50em]",
              fnlHovered ? "visible" : "invisible",
            )}
          >
            Enhanced by AI & LLMs to understand your queries. No need to learn
            any new syntax, just type your queries in natural language and get
            results instantly
          </p>

          <p className={"text-2xl text-white"}>+</p>

          <h2
            className={
              "hero-text-size-sm text-lime-300 hover:text-lime-500 cursor-pointer  font-black"
            }
            onMouseEnter={() => setHissabHovered(true)}
            onMouseLeave={() => setHissabHovered(false)}
          >
            Powerful Hissab Engine
          </h2>

          <p
            className={cn(
              "text-lime-500 text-lg",
              hissabHovered ? "visible" : "invisible",
            )}
          >
            Your queries are converted to hissab expressions which are
            calculated by
            <br /> hissab engine to ensure accurate answers without
            hallucinations
          </p>

          <p className={"text-2xl text-white"}> +</p>

          <h2
            className={
              "hero-text-size-sm text-emerald-300 hover:text-emerald-500 cursor-pointer  font-black"
            }
            onMouseEnter={() => setUxHovered(true)}
            onMouseLeave={() => setUxHovered(false)}
          >
            Streamlined UX
          </h2>

          <p
            className={cn(
              "text-emerald-500 text-lg",
              uxHovered ? "visible" : "invisible",
            )}
          >
            Designed to be intuitive, fast and flexible. <br /> You can perform
            quick calculations or have complex planning and brainstorming
            sessions.
          </p>

          <p className={"text-2xl text-white"}> =</p>

          <h1
            className={
              "hero-text-size-lg text-purple-300 hover:text-purple-500 cursor-pointer  font-black"
            }
            onMouseEnter={() => setNoExaggerationHovered(true)}
            onMouseLeave={() => setNoExaggerationHovered(false)}
          >
            World's most powerful calculator
          </h1>

          <p
            className={cn(
              "text-purple-500 text-2xl",
              noExaggerationHovered ? "visible" : "invisible",
            )}
          >
            No Exaggeration, Really
          </p>
        </div>
        <h4
          className={
            "sub-hero-text text-stone-300 tracking-wider whitespace-pre-line my-12 max-w-[40em]"
          }
        >
          Hissab is an AI enhanced, accurate and powerful natural language
          calculator app that does way more than calculations. <br />
          Hissab is useful for performing quick calculations as well as complex
          brainstorming and planning.
        </h4>
        <p className={"text-white"}></p>
      </section>
      <section>
        <h2
          className={
            "text-transparent bg-clip-text bg-gradient-to-r from-teal-400 via-cyan to-teal-500"
          }
        >
          Intuitive, Powerful & Versatile
        </h2>
        <ul className={"promo-list"}>
          <li>Supports wide range of operations</li>
          <li>Plan, Estimate & Compare numbers in a breeze</li>
          <li>Available on the Web, mobile, desktop and browser platforms</li>
        </ul>
        <p className={"promo-p"}>Ultimate platform for all your calculations</p>
        <img src={firstPromo} className={"promo-imgs"} />
      </section>
      <section>
        <h2
          className={
            "text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100"
          }
        >
          Free, No Signups, No Ads, No BS
        </h2>

        <ul className={"promo-list "}>
          <li>Basic Math and Percentage operations</li>
          <li>
            Reference previous lines' results or Save results in a variable to
            use them later
          </li>
          <li>Helpful date, time and timezone calculations</li>
          <li>Unit Conversion and seamless operations with different units</li>
          <li>Support for alternate number systems and binary operations</li>
        </ul>

        <img src={freePromo} className={"promo-imgs"} />
      </section>
      <section>
        <h2
          className={
            "text-transparent bg-clip-text bg-gradient-to-r from-indigo-200 via-red-200 to-yellow-100"
          }
        >
          Even more advanced features, <br />
          faster workflow, smarter results
        </h2>
        <ul className={"promo-list"}>
          <li>Autocomplete suggestions as you type</li>
          <li>Organize calculations into multiple pages</li>
          <li>Breakdown large unit values into multiple units</li>
          <li>
            Logarithms, Trigonometry, Statistics, LCM, GCD, Digital colors
            operations and several advanced Math and computer science
            calculations
          </li>
        </ul>

        <img src={proPromo} className={"promo-imgs"} />
      </section>
    </>
  );
}
