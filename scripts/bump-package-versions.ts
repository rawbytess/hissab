#!/usr/bin/env bun
import {
  existsSync,
  readdirSync,
  readFileSync,
  statSync,
  writeFileSync,
} from "node:fs";
import { relative, resolve } from "node:path";

type BumpType = "major" | "minor" | "patch";
type VersionChange = { label: string; from: string; to: string };

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
const dryRun = process.argv.includes("--dry-run");

// Default to a patch bump when no type is given (e.g. `pnpm bump` or
// `pnpm bump --dry-run`). An explicit unrecognized type still errors.
const bumpType =
  !requestedBumpType || requestedBumpType.startsWith("--")
    ? "patch"
    : bumpTypeAliases.get(requestedBumpType);

if (!bumpType) {
  console.error(
    "Usage: pnpm bump [major|minor|patch|sem] [--dry-run] (default: patch)",
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

// Bump the `version` field on `holder` in place, returning the change (or null
// when there is no string version to bump).
function bumpField(
  holder: Record<string, unknown>,
  label: string,
): VersionChange | null {
  if (typeof holder.version !== "string") {
    return null;
  }

  const from = holder.version;
  const to = bumpVersion(from, bumpType);
  holder.version = to;
  return { label, from, to };
}

let updatedCount = 0;

// Read a JSON manifest, let `collect` bump whichever version fields it carries,
// then rewrite it (unless --dry-run) preserving the repo's 2-space + newline
// formatting. Missing files are skipped.
function bumpManifest(
  file: string,
  collect: (json: Record<string, unknown>) => VersionChange[],
): void {
  if (!existsSync(file)) {
    return;
  }

  const json = JSON.parse(readFileSync(file, "utf8")) as Record<
    string,
    unknown
  >;
  const changes = collect(json);

  if (changes.length === 0) {
    return;
  }

  if (!dryRun) {
    writeFileSync(file, `${JSON.stringify(json, null, 2)}\n`);
  }

  const rel = relative(repoRoot, file);
  for (const { label, from, to } of changes) {
    console.log(`${rel}${label ? ` ${label}` : ""}: ${from} -> ${to}`);
  }
  updatedCount += changes.length;
}

// package.json (and the Claude plugin manifest) carry a single top-level version.
const bumpTopLevelVersion = (
  json: Record<string, unknown>,
): VersionChange[] => {
  const change = bumpField(json, "");
  return change ? [change] : [];
};

const packageJsonFiles = findPackageJsonFiles(repoRoot)
  .filter((file) => {
    const packageDir = resolve(file, "..");
    return statSync(packageDir).isDirectory();
  })
  .sort((a, b) => relative(repoRoot, a).localeCompare(relative(repoRoot, b)));

for (const file of packageJsonFiles) {
  bumpManifest(file, bumpTopLevelVersion);
}

// Claude Code plugin manifests under .claude-plugin/. plugin.json mirrors a
// package.json (top-level version); marketplace.json bumps its optional
// top-level version plus each plugins[].version so listed plugins stay in sync.
const claudePluginDir = resolve(repoRoot, ".claude-plugin");

bumpManifest(resolve(claudePluginDir, "plugin.json"), bumpTopLevelVersion);

bumpManifest(resolve(claudePluginDir, "marketplace.json"), (json) => {
  const changes: VersionChange[] = [];

  const top = bumpField(json, "version");
  if (top) {
    changes.push(top);
  }

  if (Array.isArray(json.plugins)) {
    for (const plugin of json.plugins) {
      if (plugin && typeof plugin === "object") {
        const name = (plugin as { name?: string }).name ?? "?";
        const change = bumpField(
          plugin as Record<string, unknown>,
          `plugins[${name}]`,
        );
        if (change) {
          changes.push(change);
        }
      }
    }
  }

  return changes;
});

if (updatedCount === 0) {
  console.log("No package.json files with a version field were found.");
}
