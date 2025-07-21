import mdx from "@astrojs/mdx";
import react from "@astrojs/react";
import sitemap from "@astrojs/sitemap";
import starlight from "@astrojs/starlight";
import tailwind from "@astrojs/tailwind";
import { defineConfig } from "astro/config";
import { ion } from "starlight-ion-theme";
import starlightLlmsTxt from "starlight-llms-txt";
import starlightNextjsTheme from "starlight-nextjs-theme";

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
      title: "Hissab Docs",
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
        "AI powered natural language calculator that answers accurately. Just type & calculate anything with ease. Perform basic to advanced calculations instantly.",
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
          label: "MCP Server",
          link: "/mcp",
        },
        {
          label: "AI Agent (Coming Soon)",
          link: "/agent",
        },
        {
          label: "Guide",
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
    mdx(),
    sitemap(),
  ],
});
