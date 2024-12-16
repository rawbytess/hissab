import { defineConfig } from "drizzle-kit";

export default defineConfig({
  out: "./drizzle",
  schema: ["./src/db/schema.ts", "./src/db/auth.ts"],
  dialect: "sqlite",
  dbCredentials: {
    url: ".wrangler/state/v3/d1/miniflare-D1DatabaseObject/dcf4856486a9314079a2f63df72675b3281540940adb51fd736660821b62a765.sqlite",
  },
});
