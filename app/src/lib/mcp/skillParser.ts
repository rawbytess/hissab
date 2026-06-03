export type ParsedSkill = {
  name: string;
  description: string;
  instructions: string;
  allowedTools?: string[];
};

const FENCE = /^---\s*\r?\n([\s\S]*?)\r?\n---\s*\r?\n?([\s\S]*)$/;

export function parseSkillMarkdown(raw: string): ParsedSkill {
  const trimmed = raw.replace(/^﻿/, "");
  const match = trimmed.match(FENCE);
  if (!match) {
    throw new Error(
      "SKILL.md must start with YAML frontmatter delimited by `---` lines.",
    );
  }
  const frontmatter = match[1] ?? "";
  const body = (match[2] ?? "").trim();

  const fields = parseFrontmatter(frontmatter);

  const name = fields.name?.trim();
  if (!name) throw new Error("Frontmatter is missing required `name:` field.");
  const description = (fields.description ?? "").trim();
  if (!description) {
    throw new Error("Frontmatter is missing required `description:` field.");
  }

  const allowedToolsRaw = fields["allowed-tools"] ?? fields.allowed_tools;
  const allowedTools = allowedToolsRaw ? parseList(allowedToolsRaw) : undefined;

  return {
    name,
    description,
    instructions: body,
    allowedTools,
  };
}

function parseFrontmatter(src: string): Record<string, string> {
  const lines = src.split(/\r?\n/);
  const out: Record<string, string> = {};
  let i = 0;
  while (i < lines.length) {
    const line = lines[i];
    if (!line.trim() || line.trim().startsWith("#")) {
      i++;
      continue;
    }
    const m = line.match(/^([A-Za-z_][\w-]*)\s*:\s*(.*)$/);
    if (!m) {
      throw new Error(`Cannot parse frontmatter line: \`${line}\``);
    }
    const key = m[1];
    const value = m[2];
    if (value === "|" || value === ">") {
      const folded = value === ">";
      const chunk: string[] = [];
      i++;
      const baseIndent = indentOf(lines[i] ?? "");
      while (i < lines.length) {
        const next = lines[i];
        if (next.trim() === "") {
          chunk.push("");
          i++;
          continue;
        }
        if (indentOf(next) < baseIndent) break;
        chunk.push(next.slice(baseIndent));
        i++;
      }
      out[key] = folded
        ? chunk.join(" ").replace(/\s+/g, " ").trim()
        : chunk.join("\n").replace(/\s+$/g, "");
      continue;
    }
    out[key] = stripQuotes(value.trim());
    i++;
  }
  return out;
}

function indentOf(line: string): number {
  const m = line.match(/^(\s*)/);
  return m ? m[1].length : 0;
}

function stripQuotes(v: string): string {
  if (
    (v.startsWith('"') && v.endsWith('"')) ||
    (v.startsWith("'") && v.endsWith("'"))
  ) {
    return v.slice(1, -1);
  }
  return v;
}

function parseList(v: string): string[] {
  const value = v.trim();
  if (value.startsWith("[") && value.endsWith("]")) {
    return value
      .slice(1, -1)
      .split(",")
      .map((s) => stripQuotes(s.trim()))
      .filter(Boolean);
  }
  return value
    .split(",")
    .map((s) => stripQuotes(s.trim()))
    .filter(Boolean);
}
