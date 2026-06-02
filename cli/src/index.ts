import { Command } from "commander";
import { registerDocs } from "./commands/docs";
import { registerEval } from "./commands/eval";
import { registerList } from "./commands/list";
import { registerRepl, runRepl } from "./commands/repl";
import { registerRun } from "./commands/run";

const program = new Command();

program
  .name("hissab")
  .description("Hissab expression CLI — wrapper around the Hissab engine")
  .version("0.1.0");

registerEval(program);
registerRun(program);
registerList(program);
registerDocs(program);
registerRepl(program);

program.action(async () => {
  await runRepl();
});

await program.parseAsync(process.argv);
