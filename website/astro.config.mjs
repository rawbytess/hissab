import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";
import starlightLlmsTxt from "starlight-llms-txt";
import starlightNextjsTheme from "starlight-nextjs-theme";
import { ion } from "starlight-ion-theme";
import starlight from "@astrojs/starlight";

export default defineConfig({
  output: "static",
  site: "https://hissab.io/",
  server: ({ command }) => ({
    port: command === "dev" ? 4321 : 5321,
    host: "0.0.0.0",
  }),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    starlight({
      title: "Hissab",
      customCss: [
        // Relative path to your custom CSS file
        "./src/css/tailwind.css",
        "./src/css/custom.css",
        "./src/css/index.css",
        "./src/css/home.css",
      ],
      favicon: "/img/favicon.ico",
      lastUpdated: true,
      tagline: "AI Calculator with superpowers",
      description:
        "Hissab is an AI calculator that can do more than just basic calculations. " +
        "It can handle complex math, unit conversions, and even references to variables and dates.",
      plugins: [starlightLlmsTxt(), starlightNextjsTheme()],
      head: [
        {
          tag: "script",
          attrs: {
            src: "/umami.js",
            "data-website-id": "19ee36c5-98a3-48d8-bf85-8ebfb5f6c17d",
            defer: true,
          },
        },
      ],
      sidebar: [
        {
          label: "FAQs",
          link: "/faqs",
        },
        {
          label: "Installation",
          link: "/installation",
        },
        {
          label: "API (Coming Soon)",
          link: "/api",
        },
        {
          label: "Classic",
          items: [
            {
              label: "Introduction",
              link: "/guide/introduction",
            },
            {
              label: "Mathematics",
              autogenerate: {
                directory: "Guide/Mathematics",
              },
            },
            {
              label: "Unit Conversion",
              link: "/guide/unitconversions",
            },
            {
              label: "References & Variables",
              link: "/guide/references",
            },
            {
              label: "Date & Time",
              autogenerate: {
                directory: "Guide/Date & Time",
              },
            },
            {
              label: "Digital Information",
              autogenerate: {
                directory: "Guide/Digital Data",
              },
            },
          ],
        },
        {
          label: "LLMs",
          collapsed: true,
          items: [
            {
              label: "llms.txt",
              link: "/llms.txt",
            },
            {
              label: "llms-small.txt",
              link: "/llms-small.txt",
            },
            {
              label: "llms-full.txt",
              link: "/llms-full.txt",
            },
          ],
        },
      ],
    }),
  ],
});
