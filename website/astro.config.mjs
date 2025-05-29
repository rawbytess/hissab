import { defineConfig } from "astro/config";
import react from "@astrojs/react";

import tailwind from "@astrojs/tailwind";
import starlightLlmsTxt from "starlight-llms-txt";
import starlightNextjsTheme from "starlight-nextjs-theme";
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
      tagline: "Calculator with superpowers",
      plugins: [starlightLlmsTxt(), starlightNextjsTheme()],
      head: [
        {
          tag: "script",
          content: `
  !function(t,e){var o,n,p,r;e.__SV||(window.posthog=e,e._i=[],e.init=function(i,s,a){function g(t,e){var o=e.split(".");
    2==o.length&&(t=t[o[0]],e=o[1]),t[e]=function(){t.push([e].concat(Array.prototype.slice.call(arguments,0)))}}
    (p=t.createElement("script")).type="text/javascript",p.crossOrigin="anonymous",p.async=!0,p.src=s.api_host+"/static/array.js",
    (r=t.getElementsByTagName("script")[0]).parentNode.insertBefore(p,r);var u=e;
    for(void 0!==a?u=e[a]=[]:a="posthog",u.people=u.people||[],u.toString=function(t){var e="posthog";
      return"posthog"!==a&&(e+="."+a),t||(e+=" (stub)"),e},u.people.toString=function(){return u.toString(1)+".people (stub)"},
      o="capture identify alias people.set people.set_once set_config register register_once unregister opt_out_capturing " +
       "has_opted_out_capturing opt_in_capturing reset isFeatureEnabled onFeatureFlags getFeatureFlag getFeatureFlagPayload " +
        "reloadFeatureFlags group updateEarlyAccessFeatureEnrollment getEarlyAccessFeatures getActiveMatchingSurveys getSurveys " +
         "getNextSurveyStep onSessionId".split(" "),n=0;n<o.length;n++)g(u,o[n]);e._i.push([i,s,a])},e.__SV=1)}(document,window.posthog||[]);
  posthog.init(
    'phc_GXhM8z5VuEVct8p7ce7WyzVO5SibL7TMg8bq2FCZvgr',
    {
      api_host:'https://us.i.posthog.com'
    }
  )`,
        },
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
