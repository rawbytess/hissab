/// <reference types="astro/client" />

import { drizzle } from "drizzle-orm/d1";
import { D1Database } from "@cloudflare/workers-types";

export interface Env {
  DB: D1Database;
}
type Runtime = import("@astrojs/cloudflare").Runtime<Env>;
declare namespace App {
  interface Locals extends Runtime {}
}

export const db = {};
