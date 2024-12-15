import { Hono } from "hono";
import { hc } from "hono/client";
import { cors } from "hono/cors";
import type { APIRoute, APIContext } from "astro";
import type { Env } from "@/lib/drizzle.ts";
import { drizzle } from "drizzle-orm/d1";

export const prerender = false;

const app = new Hono<{ Bindings: Env }>().basePath("/api/");
app.use("/api/*", cors());

const routes = app.get("/", async (c) => {
  const db = drizzle(c.env.DB);

  return c.json("Hello World");
});

export const ALL: APIRoute = ({ request, locals }) =>
  app.fetch(request, locals);
