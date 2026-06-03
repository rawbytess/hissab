#!/usr/bin/env bun
//
// verify-examples.ts — run every ```hissab example block in the docs through the
// real Hissab engine and fail on any line that doesn't evaluate. Catches the
// most common form of doc rot: an example that was edited (or a feature that
// changed) until the snippet no longer parses.
//
// Each ```hissab block is evaluated as one shared-scope batch, so labels, `prev`,
// `line<N>`, and `total<N>` resolve exactly like the app editor and `hissab run`.
// Trailing `# ...` comments are stripped before evaluation. Deliberately-wrong
// examples live in prose `:::caution` bullets (inline code), never in ```hissab
// blocks, so everything inside a block is expected to run clean.
//
// This checks that examples RUN. It does not assert their printed results — for
// result accuracy, cross-check against engine/tests/expression/valid/*.txt or
// spot-check with `pnpm -F cli dev eval "<expr>"` (see the skill's SKILL.md).
//
// Usage (from repo root):
//   bun .claude/skills/sync-docs/scripts/verify-examples.ts            # all app docs
//   bun .claude/skills/sync-docs/scripts/verify-examples.ts <file...>  # specific files
//
// Requires the engine to be built (`pnpm -F engine build`) so that
// `@rawbytes/hissab` resolves — the multi-line runner imports it.

import { readFileSync } from "node:fs";
import { resolve } from "node:path";
import { Glob } from "bun";
import { calculateExpressions } from "../../../../lib/calculateExpressions";

const repoRoot = resolve(import.meta.dir, "..", "..", "..", "..");

// The app docs are the downstream surface this skill keeps in sync; their
// ```hissab blocks are meant to run clean.
const DEFAULT_GLOBS = ["app/src/docs/content/**/*.md"];

type Failure = { file: string; line: number; expr: string; detail: string };

const failures: Failure[] = [];
let checked = 0;

// ── collect target files ──────────────────────────────────────────────────
const argv = process.argv.slice(2);
const files: string[] = [];
if (argv.length > 0) {
  files.push(...argv.map((f) => resolve(process.cwd(), f)));
} else {
  for (const pattern of DEFAULT_GLOBS) {
    for (const match of new Glob(pattern).scanSync({ cwd: repoRoot })) {
      files.push(resolve(repoRoot, match));
    }
  }
}

function rel(file: string): string {
  return file.startsWith(repoRoot) ? file.slice(repoRoot.length + 1) : file;
}

for (const file of files) {
  const lines = readFileSync(file, "utf8").split(/\r?\n/);

  let inBlock = false;
  let blockStart = 0;
  let block: { expr: string; line: number }[] = [];

  const flushBlock = async () => {
    if (block.length === 0) return;
    checked += block.length;
    // calculateExpressions never throws — it returns { error, errorMessage }
    // per line — so one bad line can't sink the batch.
    const results = await calculateExpressions(block.map((b) => b.expr));
    results.forEach((res, i) => {
      if (res.error) {
        failures.push({
          file: rel(file),
          line: block[i].line,
          expr: block[i].expr,
          detail: res.errorMessage ?? "invalid expression",
        });
      }
    });
    block = [];
  };

  for (let i = 0; i < lines.length; i++) {
    const fence = lines[i].match(/^\s*```(\w+)?/);
    if (fence) {
      if (!inBlock && fence[1] === "hissab") {
        inBlock = true;
        blockStart = i;
        block = [];
      } else if (inBlock) {
        await flushBlock();
        inBlock = false;
      }
      continue;
    }
    if (inBlock) {
      const expr = lines[i].replace(/#.*$/, "").trim(); // strip trailing comments
      if (expr) block.push({ expr, line: i + 1 });
    }
  }
  if (inBlock) {
    console.warn(
      `! unclosed hissab block in ${rel(file)} (line ${blockStart + 1})`,
    );
    await flushBlock();
  }
}

// ── report ────────────────────────────────────────────────────────────────
if (failures.length === 0) {
  console.log(
    `✓ ${checked} example expression(s) ran clean across ${files.length} file(s).`,
  );
  process.exit(0);
}

console.error(
  `✗ ${failures.length} of ${checked} example expression(s) failed to evaluate:\n`,
);
for (const f of failures) {
  console.error(`  ${f.file}:${f.line}  →  ${f.expr}`);
  console.error(`    ${f.detail}\n`);
}
process.exit(1);
