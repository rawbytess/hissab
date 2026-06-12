# Hissab Skills

[Anthropic Agent Skills](https://docs.claude.com/en/docs/agents-and-tools/agent-skills) that teach AI agents to offload math to the [Hissab](https://hissab.io) engine instead of computing it themselves. Use them to get hallucination-free arithmetic, unit conversions, date/time math, percentages, statistics, probability, finance, health and fitness metrics, geometry, IP address math, symbolic algebra, complex numbers, coordinate systems, matrices, graphing with `draw`/`plot`, bitwise ops, number-system conversions, color math, random numbers / UUIDs, and text hashing from natural-language prompts.

## The skill

| Skill | Use when |
| --- | --- |
| [`hissab-cli`](./hissab-cli/SKILL.md) | The `hissab` binary is installed locally. Best for offline work, CI pipelines, shell-driven workflows, and any agent that can spawn subprocesses. |

The skill bundles `documentation.md` — the **base reference** (basics + catalog of categories). For full syntax of any individual category, the agent fetches a chunk on demand with `hissab docs <tag>`. Large-context agents can run `hissab docs --all` to load the complete reference at once.

Current documentation tags are generated from `lib/documentation`: `arithmetic`,
`percentage`, `unit_conversion`, `compound_units`, `set_operations`,
`number_theory`, `logarithm`, `statistics`, `probability`, `finance`, `health`,
`trigonometry`, `geometry`, `date_time`, `number_systems`, `bitwise`, `color`,
`ip_address`, `symbolic`, `complex_numbers`, `coordinate_systems`, `matrix`,
`visualization`, `random`, `hashing`, and `labels_and_prev`.

## Install

### Recommended — the Skills CLI (works across Claude, Codex, Gemini, Cursor… 38+ agents)

[Vercel's `skills` CLI](https://github.com/vercel-labs/skills) installs into whichever agent
you target, and its anonymous install telemetry is what surfaces a skill on
[skills.sh](https://skills.sh) — so this is the path to prefer if you want the skill to be
discoverable.

```bash
# Install the skill (prompts if the repo has more than one):
npx skills add rawbytess/hissab

# …or install it globally for a specific agent:
npx skills add rawbytess/hissab --skill hissab-cli -g -a claude-code
npx skills add rawbytess/hissab --skill hissab-cli -g -a codex

# …or install straight from its subdirectory URL:
npx skills add https://github.com/rawbytess/hissab/tree/main/skills/hissab-cli
```

Discover what's published with `npx skills find hissab`.

### Claude Code plugin

Install the skill as a Claude Code plugin from the bundled marketplace:

```text
/plugin marketplace add rawbytess/hissab
/plugin install hissab@rawbytes
```

### OpenAI Codex

`npx skills add` (above) installs into Codex when you pass `-a codex`. To install by hand, copy
or symlink the skill directory into `~/.agents/skills/` (personal) or `<repo>/.agents/skills/`
(project-scoped):

```bash
ln -s "$PWD/skills/hissab-cli" ~/.agents/skills/hissab-cli
```

### Manual install (no telemetry)

Symlink or copy the skill directory straight into the agent's skills folder — e.g. for Claude
Code / Claude Desktop:

```bash
ln -s "$PWD/skills/hissab-cli" ~/.claude/skills/hissab-cli
```

This bypasses the Skills CLI, so it generates **no** install telemetry and won't help the skill
appear on skills.sh. Either way, start a fresh agent session — the skill activates when a
relevant prompt comes in.

## When the skill doesn't fit

Use the engine library directly: `import { calculate } from '@rawbytes/hissab'`
and call it from your own code. The skill is just a way to expose that
capability to an LLM.
