# Hissab

Hissab is a natural-language calculator and math engine for people and AI
agents. It accepts expressions such as `15 km to miles`, `25% of 200`,
`today - 1 feb 1990 to years`, or `avg(10, 20, 30)` and returns deterministic,
formatted results.

The project includes:

- A web/PWA calculator app.
- A TypeScript calculation engine published as `@rawbytes/hissab`.
- A terminal CLI for one-shot calculations, REPL sessions, scripts, and docs.
- Agent skills and an MCP workflow so AI assistants can offload exact math to
  Hissab instead of guessing.

## What is Hissab?

Hissab is built around a small expression language that reads like everyday
math. You can write plain arithmetic, unit conversions, dates, statistics,
colors, bitwise operations, and multi-line calculations with named labels.

```text
15 kilometers to miles
240 - 15%
variance(45, 56, 67, 78, 89)
today - 15 jun 1995 to years
monthly_savings = 4500 - 1200 - 600
monthly_savings monthly to yearly
```

Unlike an LLM, Hissab does not try to infer a result from text. The app and
agent integrations translate intent into Hissab expressions, then the engine
parses and evaluates those expressions.

## Features

Hissab currently supports these operation categories:

| Category | Examples |
| --- | --- |
| Arithmetic | `+`, `-`, `*`, `/`, `^`, roots, factorial, `abs`, `mod` |
| Percentages | `% of`, discounts, percent addition/subtraction, reverse percentage |
| Unit conversion | `<value> <unit> to <unit>`, mixed-unit math, prefixes, multi-target breakdowns |
| Compound units | Speed, acceleration, force-like unit expressions, dimensional arithmetic and conversion |
| Set operations | `max`, `min`, `lcm`, `gcd`, permutations, combinations |
| Logarithms | `log`, `log10`, `log2` |
| Statistics | `avg`, `median`, `range`, `variance`, standard/harmonic/geometric mean |
| Trigonometry | `sin`, `cos`, `tan`, inverse trig, hyperbolic variants |
| Date and time | Date arithmetic, durations, timezones, Unix epoch/timestamp conversion |
| Number systems | Decimal, binary, octal, hexadecimal conversion and arithmetic |
| Bitwise operations | `~`, `&`, `|`, `xor`, `<<`, `>>` |
| Color math | Hex, RGB, RGBA, HSL, named colors, mixing, shading, complement, color temperature |
| Multi-line scope | Labels, `prev`, `line<N>`, `total<N>` |

The canonical operation docs live in [`lib/documentation`](./lib/documentation).

## Basic Syntax

Write one expression per line.

```text
14 + 88 / 11 * 23.56 - 17
```

Use natural unit conversion syntax.

```text
15 kilometers to miles
25 celsius to fahrenheit
13 kilograms + 12 pounds
```

Use parentheses to make grouping explicit.

```text
(5 + 6) * 3
256 ^ (1/8)
```

Call functions with comma-separated arguments.

```text
avg(99, 34, 65, 213, 45, 123)
max(10m, 30k, 7.7m, 123123121234)
lcm(12, 15, 18, 25)
```

Assign labels with `=` and reuse them later in the same batch.

```text
monthly_savings = 4500 - 1200 - 600
yearly_savings = monthly_savings monthly to yearly
```

Use `prev` for the immediately previous result.

```text
78 kilometers to miles
prev - 45 miles
```

Important syntax notes:

- Dates use formats such as `2020.08.07`, `07 aug 2020`, or `2020 aug 07`.
  Dashes and slashes are arithmetic operators.
- `m` means million, not meter. Use `meter` in compound units.
- Currency conversion is not built in because exchange rates change. Fetch or
  provide a rate first, then calculate with the literal value.

## Using the App

Use the web app at [app.hissab.io](https://app.hissab.io). It can also be
installed as a PWA on desktop and mobile browsers.

The app provides:

- A notebook-style editor for expressions and multi-line calculations.
- Inline results while writing.
- Syntax highlighting for Hissab expressions.
- Local notebook/file storage in the browser.
- A documentation UI backed by the same docs used by the CLI and agent tools.

## AI Chat Features

Hissab includes an agentic math workflow for AI-assisted calculation. The AI
does the language work, while Hissab does the deterministic math.

AI features include:

- Inline AI prompts for quick answers.
- Chat for multi-step math questions.
- Tool-backed calculation through the Hissab engine.
- Documentation retrieval before writing unfamiliar expression types.
- Name lookup for units and functions.
- File and image attachments in chat.
- Multilingual questions and answers.
- Realtime lookup hooks for current data such as exchange rates, stocks,
  crypto, weather, and news before calculating.
- Provider support for OpenAI, Anthropic, Gemini, DeepSeek, and custom
  OpenAI-compatible endpoints.

## CLI

The CLI wraps the Hissab engine for terminal use. Install it from npm (requires Node ≥ 18):

```sh
npm install -g @rawbytes/hissab-cli
hissab eval "15 kilometers to miles"
```

Available commands:

```sh
hissab eval "<expr>"        # one-shot evaluation
hissab repl                 # interactive REPL
hissab run <file>           # one expression per line, shared variable scope
hissab list <kind>          # kind = functions | units | operators
hissab docs [tag]           # base docs or a specific docs chunk
```

### Running from source

From the repo root:

```sh
pnpm install
pnpm --filter ./cli dev eval "15 kilometers to miles"
pnpm --filter ./cli dev repl
```

`pnpm --filter ./cli build` produces the published, self-contained Node bundle
in `cli/dist/`. To build the optional standalone per-platform binaries with Bun
instead, run `pnpm --filter ./cli build:bin` (output in
`cli/bin/hissab-<platform>-<arch>`).

## Agent Skills

Hissab ships two skills for AI agents:

| Skill | Use when |
| --- | --- |
| [`hissab-cli`](./skills/hissab-cli/SKILL.md) | The local `hissab` binary is available. Best for offline work, CI, and shell-driven agents. |
| [`hissab-cloud`](./skills/hissab-cloud/SKILL.md) | The agent can use MCP and should call the hosted Hissab server instead of installing a local binary. |

Install with [Vercel's Skills CLI](https://github.com/vercel-labs/skills):

```sh
npx skills add rawbytess/hissab --skill hissab-cli
npx skills add rawbytess/hissab --skill hissab-cloud
```

You can also target a specific agent and install globally:

```sh
npx skills add rawbytess/hissab --skill hissab-cloud -g -a claude-code
```

The cloud skill uses the hosted MCP server:

```text
https://api.hissab.io/mcp
```

For Claude Code:

```sh
claude mcp add --transport http hissab https://api.hissab.io/mcp
```

## Engine Library

Install the calculation engine from npm:

```sh
npm install @rawbytes/hissab
```

Use `calculate` for the simple path:

```ts
import { calculate } from "@rawbytes/hissab";

const result = await calculate("15 kilometers to miles");

console.log(result.result); // "9.3206 miles"
console.log(result.resultToken);
```

Use `doLex` and `doParse` when you need lower-level access to tokens or shared
variables across several expressions:

```ts
import {
  doLex,
  doParse,
  type Variables,
} from "@rawbytes/hissab";

const variables: Variables = {};

const assignment = await doParse(doLex("distance = 15 km", variables, 1));
variables[assignment.meta.variableName] = assignment.resultToken;

const converted = await doParse(doLex("distance to miles", variables, 2));
console.log(converted.result);
```

Catch user-facing expression errors with `UserError`:

```ts
import { calculate, UserError } from "@rawbytes/hissab";

try {
  await calculate("10 meter to kilogram");
} catch (error) {
  if (error instanceof UserError) {
    console.error(error.message);
  }
}
```

## Repository Layout

```text
app/                 React/Vite PWA calculator app
cli/                 Hissab command-line interface
engine/              TypeScript parser and calculation engine
lib/documentation/   Shared documentation chunks for app, CLI, and agents
skills/              Agent skills for local CLI and hosted MCP use
website/             Astro marketing/docs website
```

## Development

This is a pnpm workspace.

```sh
pnpm install
pnpm -r build
pnpm -r test
pnpm check
```

Useful package commands:

```sh
pnpm -F app dev
pnpm -F website dev
pnpm -F cli dev eval "5 km to miles"
pnpm -F @rawbytes/hissab test
```

Before opening a PR, run:

```sh
pnpm ready
```

## License

[MIT](./LICENSE) © Mufaddal Makati
