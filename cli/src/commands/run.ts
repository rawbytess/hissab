import { readFile } from "node:fs/promises";
import type { Variables } from "@rawbytes/hissab";
import type { Command } from "commander";
import { formatError } from "../lib/errors";
import { evaluateLine } from "../lib/evaluate";

export function registerRun(program: Command): void {
  program
    .command("run <file>")
    .description(
      "evaluate a file (one expression per line, shared variable scope)",
    )
    .action(async (file: string) => {
      let text: string;
      try {
        text = await readFile(file, "utf8");
      } catch (e) {
        console.error(formatError(e));
        process.exit(1);
      }

      const lines = text.split("\n");
      const variables: Variables = {};

      for (let i = 0; i < lines.length; i += 1) {
        const line = lines[i].trim();
        if (!line || line.startsWith("#")) continue;
        try {
          const { result } = await evaluateLine(line, variables, i + 1);
          console.log(result);
        } catch (e) {
          console.error(`line ${i + 1}: ${formatError(e)}`);
          process.exit(1);
        }
      }
    });
}
