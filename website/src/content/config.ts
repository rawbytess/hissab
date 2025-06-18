import { defineCollection, z } from "astro:content";
import { docsSchema } from "@astrojs/starlight/schema";
import { glob } from "astro/loaders";

const blogCollection = defineCollection({
  loader: glob({ pattern: "**/*.{md,mdx}", base: "./src/content/blog" }),
  schema: z.object({
    title: z.string(),
    pubDate: z.date(),
  }),
});

export const collections = {
  docs: defineCollection({ schema: docsSchema() }),
  blog: blogCollection,
};
