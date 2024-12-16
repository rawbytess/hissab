import { Hono } from "hono";
import { hc } from "hono/client";
import { cors } from "hono/cors";
import type { APIRoute, APIContext } from "astro";
import type { ENV } from "@/env";
import { drizzle } from "drizzle-orm/d1";
import { usersTable } from "@/db/schema.ts";

export const prerender = false;

const app = new Hono<{ Bindings: ENV }>().basePath("/api/");
app.use("/api/*", cors());

const routes = app.get("/", async (c) => {
  console.log("HERERERE");
  const db = drizzle(c.env.D1);
  console.log(c.env.D1);
  const result = await db.select().from(usersTable);
  console.log(result);
  return c.json(result);
});

export const ALL: APIRoute = ({ request, locals }: APIContext) => {
  console.log(locals.runtime.env);
  return app.fetch(request, locals.runtime.env);
};
