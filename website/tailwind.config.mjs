/** @type {import('tailwindcss').Config} */
const {heroui} = require("@heroui/react");

export default {
  darkMode: ["class"],
  content: ["./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}","./node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}"],
  theme: {
    extend: {
      colors: {
        light: "#efefef",
        dark: "#1c1c1c",
        lighttext: "#b9b9b9",
        violet: "#8100ff",
      },
      keyframes: {
        searchresult: {
          "0%": { opacity: 0 },
          "100%": { opacity: 1 },
        },
      },
      borderRadius: {
        lg: "var(--radius)",
        md: "calc(var(--radius) - 2px)",
        sm: "calc(var(--radius) - 4px)",
      },
      animation: {
        searchresult: "searchresult ease-in-out 1s",
      },
    },
  },
  plugins: [require("tailwindcss-animate"),heroui()],
};
