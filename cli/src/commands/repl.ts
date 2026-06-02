import { createInterface } from "node:readline";
import type { Variables } from "@rawbytes/hissab";
import type { Command } from "commander";
import { formatError } from "../lib/errors";
import { evaluateLine } from "../lib/evaluate";

export function registerRepl(program: Command): void {
  program
    .command("repl")
    .description("start an interactive REPL (persistent variable scope)")
    .action(async () => {
      await runRepl();
    });
}

export async function runRepl(): Promise<void> {
  const rl = createInterface({
    input: process.stdin,
    output: process.stdout,
    prompt: "> ",
    terminal: process.stdin.isTTY === true,
  });

  const variables: Variables = {};
  let lineNo = 0;

  console.log('Hissab REPL — type "q" or ".exit" to quit.');
  rl.prompt();

  for await (const raw of rl) {
    const line = raw.trim();
    if (line === "q" || line === ".exit") break;
    if (line) {
      try {
        lineNo += 1;
        const { result } = await evaluateLine(line, variables, lineNo);
        console.log(result);
      } catch (e) {
        console.error(formatError(e));
      }
    }
    rl.prompt();
  }

  rl.close();
}
