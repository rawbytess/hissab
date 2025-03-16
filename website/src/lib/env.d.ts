/// <reference path="../.astro/types.d.ts" />
/// <reference types="astro/client" />

import type { D1Database } from "@cloudflare/workers-types";

export interface ENV {
  D1: D1Database;
}

declare global {
  namespace App {
    interface Locals {
      user: import("better-auth").User | null;
      session: import("better-auth").Session | null;
      Runtime: import("@astrojs/cloudflare").Runtime<ENV>;
    }
  }
}
