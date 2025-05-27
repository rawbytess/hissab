import { defineConfig } from "vite";
import { nodePolyfills } from "vite-plugin-node-polyfills";
import react from "@vitejs/plugin-react-swc";
import { VitePWA } from "vite-plugin-pwa";
import path from "path";

export default defineConfig({
  plugins: [
    react(),
    nodePolyfills(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        globPatterns: ["**/*.{js,css,html,ico,png,svg,woff,woff2,json}"],
      },
      manifestFilename: "manifest.json",
      includeAssets: ["**/*.{png}"],
      manifest: {
        display: "standalone",
        name: "Hissab",
        short_name: "Hissab",
        description: "Just type & calculate anything",
        theme_color: "#8100ff",
        background_color: "#1c1c1c",
        lang: "en",
        display_override: [
          "minimal-ui",
          "window-controls-overlay",
          "standalone",
        ],
        categories: ["productivity", "utilities"],
        icons: [
          {
            src: "icons/32.png",
            sizes: "32x32",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/50.png",
            sizes: "48x48",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/72.png",
            sizes: "72x72",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/128.png",
            sizes: "96x96",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/128.png",
            sizes: "128x128",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/144.png",
            sizes: "144x144",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/152.png",
            sizes: "152x152",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/192.png",
            sizes: "192x192",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/512.png",
            sizes: "384x384",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/1024.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "any",
          },
          {
            src: "icons/512.png",
            sizes: "512x512",
            type: "image/png",
            purpose: "maskable",
          },
          {
            src: "icons/1024.png",
            sizes: "1024x1024",
            type: "image/png",
            purpose: "maskable",
          },
        ],
      },
    }),
  ],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
