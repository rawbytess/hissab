/** @type {import('tailwindcss').Config} */
const { heroui } = require("@heroui/react");

const colors = [
  "gray-400",
  "gray-500",
  "gray-600",
  "gray-700",
  "gray-800",

  "slate-400",
  "slate-500",
  "slate-600",
  "slate-700",
  "slate-800",

  "stone-400",
  "stone-500",
  "stone-600",
  "stone-700",
  "stone-800",

  "zinc-400",
  "zinc-500",
  "zinc-600",
  "zinc-700",
  "zinc-800",

  "neutral-400",
  "neutral-500",
  "neutral-600",
  "neutral-700",
  "neutral-800",
];

const gradientPrefixes = ["from", "via", "to"];
const safelistClasses = [];

gradientPrefixes.forEach((prefix) => {
  colors.forEach((color) => {
    safelistClasses.push(`${prefix}-${color}`);
  });
});

// Add the gradient direction classes as well
safelistClasses.push("bg-gradient-to-r");
safelistClasses.push("bg-gradient-to-l");

export default {
  darkMode: ["class"],
  content: [
    "./src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}",
    "../node_modules/@heroui/theme/dist/**/*.{js,ts,jsx,tsx}",
  ],
  safelist: safelistClasses,
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
    },
  },
  plugins: [require("tailwindcss-animate"), heroui()],
};
