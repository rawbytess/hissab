import "../css/index.css";
import "../css/home.css";
import Lottie from "lottie-react";
import HoverVideoPlayer from "react-hover-video-player";
import Header from "./Header.tsx";

const firstPromo = "/resources/home/first-promo.png";
const freePromo = "/resources/home/free-promo.png";
const proPromo = "/resources/home/pro-promo.png";
import loading from "../resources/loading.json";
import Footer from "@/components/Footer.tsx";
const heroOverlay = "/resources/hero-overlay.png";

export default function Main() {
  return (
    <>
      <Header />
      <section>
        <h1
          className="font-black drop-shadow-2xl tracking-widest
           hero-text-grad-main hero-text-size"
        >
          Just Type & Calculate Anything, Instantly
        </h1>
        <h4
          className={
            "sub-hero-text text-purple-400 tracking-wider font-medium whitespace-pre-line my-12"
          }
        >
          Hissab is a text based calculator app that does way more than
          calculations. <br />
          Hissab is useful for performing quick calculations as well as complex
          workflows
        </h4>
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
      <Footer />
    </>
  );
}
