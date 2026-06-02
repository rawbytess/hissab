import tailwindcss from "@tailwindcss/vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";
import { defineConfig } from "vite";
import { VitePWA } from "vite-plugin-pwa";

export default defineConfig({
  server: {
    host: "0.0.0.0",
    port: 5173,
    strictPort: true,
  },
  preview: {
    host: "0.0.0.0",
    port: 4173,
    strictPort: true,
  },
  plugins: [
    tailwindcss(),
    react(),
    VitePWA({
      registerType: "autoUpdate",
      workbox: {
        // Precache only the lightweight app shell. Large PNG icons and KaTeX
        // fonts are cached on demand (runtimeCaching below) instead of being
        // downloaded up front on the first visit.
        globPatterns: ["**/*.{js,css,html,ico,svg,json}"],
        // Under browser (History-API) routing, deep paths like /docs/<slug>
        // have no precached file. Fall back to the app shell so an installed/
        // offline PWA can still load (and refresh) those routes client-side.
        navigateFallback: "index.html",
        runtimeCaching: [
          {
            urlPattern: /\.(?:png|woff|woff2|ttf)$/,
            handler: "CacheFirst",
            options: {
              cacheName: "hissab-static-assets",
              expiration: { maxEntries: 64, maxAgeSeconds: 60 * 60 * 24 * 30 },
            },
          },
        ],
      },
      manifestFilename: "manifest.json",
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
  build: {
    rollupOptions: {
      output: {
        // Split large, stable vendor code into its own long-lived cacheable
        // chunks so they download in parallel with — and cache independently
        // of — the app entry. This complements (does not replace) the dynamic
        // import()s that keep heavy optional code out of first paint.
        manualChunks(id) {
          if (!id.includes("node_modules")) return;
          if (id.includes("@codemirror") || id.includes("@lezer")) {
            return "codemirror";
          }
          if (
            id.includes("/react-dom/") ||
            id.includes("/react/") ||
            id.includes("/scheduler/")
          ) {
            return "react-vendor";
          }
        },
      },
    },
  },
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
});
