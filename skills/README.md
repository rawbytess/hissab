# Hissab Skills

[Anthropic Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills) that teach AI agents to offload math to the [Hissab](https://hissab.io) engine instead of computing it themselves. Use them to get hallucination-free arithmetic, unit conversions, date/time math, percentages, statistics, probability, finance, IP address math, symbolic algebra, complex numbers, coordinate systems, graphing with `draw`/`plot`, bitwise ops, number-system conversions, and color math from natural-language prompts.

## Pick a skill

| Skill | Use when |
| --- | --- |
| [`hissab-cli`](./hissab-cli/SKILL.md) | The `hissab` binary is installed locally. Best for offline work, CI pipelines, shell-driven workflows, and any agent that can spawn subprocesses. |
| [`hissab-cloud`](./hissab-cloud/SKILL.md) | Running inside an MCP-capable host (Claude Code, Claude Desktop, Claude Agent SDK). No local install required — the agent talks to the hosted Hissab MCP server at `https://api.hissab.io/mcp`. |

Both skills share the same expression language. Each skill bundles `documentation.md` — the **base reference** (basics + catalog of categories). For full syntax of any individual category, the agent fetches a chunk on demand: `hissab docs <tag>` (CLI) or `Hissab_docs({ tag })` (cloud / MCP).

Current documentation tags are generated from `lib/documentation`: `arithmetic`,
`percentage`, `unit_conversion`, `compound_units`, `set_operations`,
`number_theory`, `logarithm`, `statistics`, `probability`, `finance`,
`trigonometry`, `date_time`, `number_systems`, `bitwise`, `color`,
`ip_address`, `symbolic`, `complex_numbers`, `coordinate_systems`,
`visualization`, and `labels_and_prev`.

## Install (Claude Code / Claude Desktop)

Copy or symlink the skill directory you want into `~/.claude/skills/`:

```bash
ln -s "$PWD/skills/hissab-cli"   ~/.claude/skills/hissab-cli
ln -s "$PWD/skills/hissab-cloud" ~/.claude/skills/hissab-cloud
```

Then start a fresh Claude session — the skill will activate when a relevant prompt comes in.

## When neither fits

Use the engine library directly: `import { calculate } from '@rawbytes/hissab'`
and call it from your own code. The skills are just a way to expose that
capability to an LLM.
