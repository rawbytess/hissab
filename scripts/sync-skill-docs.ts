#!/usr/bin/env bun
import { readFileSync, writeFileSync } from "node:fs";
import { resolve } from "node:path";
import { baseDocumentation } from "../lib/documentation";

const repoRoot = resolve(import.meta.dir, "..");
const skills = ["hissab-cli", "hissab-cloud"];
const content = `${baseDocumentation.trim()}\n`;
const check = process.argv.includes("--check");

let drift = false;
for (const skill of skills) {
  const target = resolve(repoRoot, "skills", skill, "documentation.md");
  if (check) {
    const existing = readFileSync(target, "utf8");
    if (existing !== content) {
      console.error(`drift: ${target}`);
      drift = true;
    }
    continue;
  }
  writeFileSync(target, content);
  console.log(`wrote ${target}`);
}

if (check && drift) {
  console.error("\nRun `pnpm sync:skill-docs` to update.");
  process.exit(1);
}
