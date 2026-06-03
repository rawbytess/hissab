#!/usr/bin/env bun
import { readdirSync, readFileSync, statSync, writeFileSync } from "node:fs";
import { relative, resolve } from "node:path";

type BumpType = "major" | "minor" | "patch";

const repoRoot = resolve(import.meta.dir, "..");
const ignoredDirs = new Set([
  ".git",
  ".turbo",
  ".vite",
  "build",
  "coverage",
  "dist",
  "node_modules",
]);
const bumpTypeAliases = new Map<string, BumpType>([
  ["major", "major"],
  ["minor", "minor"],
  ["patch", "patch"],
  ["sem", "patch"],
]);

const requestedBumpType = process.argv[2];
const bumpType = bumpTypeAliases.get(requestedBumpType);
const dryRun = process.argv.includes("--dry-run");

if (!bumpType) {
  console.error(
    "Usage: pnpm bump:versions <major|minor|patch|sem> [--dry-run]",
  );
  process.exit(1);
}

function findPackageJsonFiles(dir: string): string[] {
  const files: string[] = [];

  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const entryPath = resolve(dir, entry.name);

    if (entry.isDirectory()) {
      if (!ignoredDirs.has(entry.name)) {
        files.push(...findPackageJsonFiles(entryPath));
      }
      continue;
    }

    if (entry.isFile() && entry.name === "package.json") {
      files.push(entryPath);
    }
  }

  return files;
}

function bumpVersion(version: string, type: BumpType): string {
  const match = /^(\d+)\.(\d+)\.(\d+)$/.exec(version);

  if (!match) {
    throw new Error(`Unsupported version "${version}". Expected x.y.z.`);
  }

  const major = Number(match[1]);
  const minor = Number(match[2]);
  const patch = Number(match[3]);

  switch (type) {
    case "major":
      return `${major + 1}.0.0`;
    case "minor":
      return `${major}.${minor + 1}.0`;
    case "patch":
      return `${major}.${minor}.${patch + 1}`;
  }
}

const packageJsonFiles = findPackageJsonFiles(repoRoot)
  .filter((file) => {
    const packageDir = resolve(file, "..");
    return statSync(packageDir).isDirectory();
  })
  .sort((a, b) => relative(repoRoot, a).localeCompare(relative(repoRoot, b)));

let updatedCount = 0;

for (const file of packageJsonFiles) {
  const contents = readFileSync(file, "utf8");
  const packageJson = JSON.parse(contents);

  if (typeof packageJson.version !== "string") {
    continue;
  }

  const currentVersion = packageJson.version;
  const nextVersion = bumpVersion(currentVersion, bumpType);

  if (!dryRun) {
    packageJson.version = nextVersion;
    writeFileSync(file, `${JSON.stringify(packageJson, null, 2)}\n`);
  }

  console.log(
    `${relative(repoRoot, file)}: ${currentVersion} -> ${nextVersion}`,
  );
  updatedCount += 1;
}

if (updatedCount === 0) {
  console.log("No package.json files with a version field were found.");
}
