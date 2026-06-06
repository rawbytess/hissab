import type { Command } from "commander";
import {
  baseDocumentation,
  getDocumentationChunk,
  getFullDocumentation,
  OPERATION_TAGS,
  type OperationTag,
  tagDescriptions,
} from "../../../lib/documentation/index.ts";
import { dieWith } from "../lib/errors";

export function registerDocs(program: Command): void {
  program
    .command("docs [tag]")
    .description(
      `print Hissab documentation. With no argument: base overview + catalog. With a tag: that category's full chunk (tags: ${OPERATION_TAGS.join(", ")})`,
    )
    .option("-l, --list", "list available documentation tags and exit")
    .option(
      "-a, --all",
      "print the full documentation (base + all chunks; for large-context LLMs)",
    )
    .action(
      (tag: string | undefined, opts: { list?: boolean; all?: boolean }) => {
        if (opts.list && opts.all) {
          dieWith(new Error("--list and --all are mutually exclusive"));
        }
        if (opts.list) {
          for (const t of OPERATION_TAGS) {
            console.log(`${t}\t${tagDescriptions[t]}`);
          }
          return;
        }
        if (opts.all) {
          console.log(getFullDocumentation());
          return;
        }
        if (!tag) {
          console.log(baseDocumentation);
          return;
        }
        if (!(OPERATION_TAGS as readonly string[]).includes(tag)) {
          dieWith(
            new Error(
              `unknown tag "${tag}". run \`hissab docs --list\` to see available tags.`,
            ),
          );
        }
        console.log(getDocumentationChunk(tag as OperationTag));
      },
    );
}
