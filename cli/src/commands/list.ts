import { Functions, Operators, Units } from "@rawbytes/hissab";
import type { Command } from "commander";
import { dieWith } from "../lib/errors";

type Kind = "functions" | "operators" | "units";

const KINDS: readonly Kind[] = ["functions", "operators", "units"] as const;

export function registerList(program: Command): void {
  program
    .command("list <kind>")
    .description(`list built-ins; kind = ${KINDS.join(" | ")}`)
    .action((kind: string) => {
      if (!KINDS.includes(kind as Kind)) {
        dieWith(
          new Error(`unknown kind "${kind}". expected: ${KINDS.join(", ")}`),
        );
      }
      const table = pickTable(kind as Kind);
      for (const [name, entry] of Object.entries(table)) {
        const description =
          (entry as { description?: string }).description ?? "";
        console.log(`${name}\t${description}`);
      }
    });
}

function pickTable(kind: Kind): Record<string, { description?: string }> {
  switch (kind) {
    case "functions":
      return Functions as Record<string, { description?: string }>;
    case "operators":
      return Operators as Record<string, { description?: string }>;
    case "units":
      return Units as unknown as Record<string, { description?: string }>;
  }
}
