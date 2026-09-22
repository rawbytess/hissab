import path from "node:path";
import { crx } from "@crxjs/vite-plugin";
import react from "@vitejs/plugin-react-swc";
import { defineConfig } from "vite";
import manifest from "./manifest.config.ts";

export default defineConfig({
  plugins: [react(), crx({ manifest })],
  resolve: {
    // The editor, its popovers and the graph renderer are shared with the web
    // app and imported straight from app/src. Those modules use the app's `@/`
    // alias internally, so it has to resolve there — the extension's own code
    // sticks to relative imports.
    alias: [{ find: "@", replacement: path.resolve(__dirname, "../app/src") }],
    // Shared components import React from app/'s location; pin every copy to
    // the extension's so the popup never renders with two Reacts.
    dedupe: ["react", "react-dom"],
  },
  build: {
    // The popup loads from the extension package on disk, so one large chunk
    // (mostly the engine) costs no network time; don't warn about it.
    chunkSizeWarningLimit: 2000,
  },
  server: {
    // The web app's dev server owns 5173.
    port: 5174,
    strictPort: true,
    hmr: { port: 5174 },
  },
});
