import { defineConfig } from "astro/config";
import cloudflare from "@astrojs/cloudflare";
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";

import starlight from "@astrojs/starlight";

export default defineConfig({
  output: "static",
  adapter: cloudflare({
    platformProxy: {
      enabled: true,
    },
  }),
  integrations: [
    react(),
    tailwind({ applyBaseStyles: false }),
    starlight({
      title: "Hissab",
      customCss: [
        // Relative path to your custom CSS file
        "./src/css/custom.css",
        "./src/css/index.css",
        "./src/css/home.css",
      ],
      favicon: "/img/favicon.ico",
      lastUpdated: true,
      tagline: "Calculator with superpowers",
      head: [
        {
          tag: "script",
          attrs: {
            src: "https://analytics.rawbytes.com/script.js",
            "data-website-id": "19ee36c5-98a3-48d8-bf85-8ebfb5f6c17d",
            defer: true,
          },
        },
      ],
      sidebar: [
        {
          label: "FAQS",
          link: "/faqs",
        },
        {
          label: "Installation",
          link: "/installation",
        },
        {
          label: "Pricing",
          link: "/pricing",
        },
        {
          label: "Roadmap",
          link: "/roadmap",
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
      ],
    }),
  ],
});
