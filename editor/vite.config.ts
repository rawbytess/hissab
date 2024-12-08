import { defineConfig } from "vite";
import { resolve } from "path";
import react from "@vitejs/plugin-react";
import dts from "vite-plugin-dts";

export default defineConfig({
  server: {
    port: 7593,
    strictPort: true,
  },
  define: {
    global: "window",
  },
  plugins: [dts(), react()],
  build: {
    lib: {
      entry: resolve(__dirname, "src/index.ts"),
      name: "HissabEditor",
      formats: ["es", "umd"],
      fileName: "editor",
    },
    rollupOptions: {
      external: ["react", "react-dom"],
    },
  },
});
