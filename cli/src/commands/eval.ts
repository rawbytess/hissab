import type { Command } from "commander";
import { dieWith } from "../lib/errors";
import { evaluateLine } from "../lib/evaluate";

export function registerEval(program: Command): void {
  program
    .command("eval <expression>")
    .description("evaluate a single expression and print the result")
    .action(async (expression: string) => {
      try {
        const { result } = await evaluateLine(expression, {});
        console.log(result);
      } catch (e) {
        dieWith(e);
      }
    });
}
