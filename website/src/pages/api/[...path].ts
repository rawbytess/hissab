import { Hono } from "hono";
import { hc } from "hono/client";
import { cors } from "hono/cors";
import type { APIRoute } from "astro";

const app = new Hono().basePath("/api/");
app.use("/api/*", cors());

const routes = app.get("/", async (c) => {
  return c.json("Hello World");
});

export const ALL: APIRoute = ({ request }) => app.fetch(request);
