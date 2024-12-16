/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { D1Database } from "@cloudflare/workers-types";

export interface ENV {
  D1: D1Database;
}
type Runtime = import("@astrojs/cloudflare").Runtime<ENV>;
declare global {
  namespace App {
    interface Locals extends Runtime {}
  }
}
