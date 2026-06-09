<div align="center">

<img alt="Hissab" src="app/public/icons/100.png" width="92" height="92" />

# Hissab

**A strict, unit-aware natural-language calculator for humans and AI agents.**
Type real-world math like `15 km to miles`, `emi(500000, 6.5%, 30 years)`, or
`derivative(2x^2, x)` and get exact, auditable answers — across the web, a CLI,
an embeddable library, and as a tool AI agents can call.

[![Web app](https://img.shields.io/badge/Web_app-hissab.io-8100ff)](https://hissab.io)
&nbsp;·&nbsp;
[![Engine on npm](https://img.shields.io/npm/v/%40rawbytes%2Fhissab?logo=npm&label=engine)](https://www.npmjs.com/package/@rawbytes/hissab)
&nbsp;·&nbsp;
[![CLI on npm](https://img.shields.io/npm/v/%40rawbytes%2Fhissab-cli?logo=npm&label=CLI)](https://www.npmjs.com/package/@rawbytes/hissab-cli)
&nbsp;·&nbsp;
[![Agent skills](https://img.shields.io/badge/Agent_skills-2b6cb0)](#agent-skills)
&nbsp;·&nbsp;
[![License: MIT](https://img.shields.io/badge/License-MIT-3aa657.svg)](./LICENSE)

</div>

## What is Hissab?

Hissab is built around a small expression language that reads like everyday
math. You can write plain arithmetic, unit conversions, dates, statistics,
probability, finance, health and fitness metrics, IP subnet math, symbolic
algebra, complex numbers, coordinate-system geometry, shape area and volume,
matrix algebra, colors, bitwise operations, graphing with `draw`/`plot`,
random numbers / UUIDs / nanoids, text hashing (SHA, MD5, CRC32), and
multi-line calculations with named labels.

```text
15 kilometers to miles
240 - 15%
variance(45, 56, 67, 78, 89)
today - 15 jun 1995 to years
network(192.168.1.130/24)
derivative(2x^2 + 3x, x)
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
| Number theory | `fraction`, `mixed fraction`, `isprime`, `factors` |
| Logarithms | `log`, `log10`, `log2` |
| Statistics | `avg`, `median`, `range`, `variance`, standard/harmonic/geometric mean |
| Probability | `P(...)`, complement/AND/OR, conditional probability, Bayes, odds, binomial, expected value |
| Finance | Simple/compound interest, future/present value, EMI/mortgage, annuities, CAGR, ROI, APY, margin, markup, break-even, runway, tip, discount, sales tax, NPV, IRR, depreciation |
| Health & fitness | BMI, BMR, TDEE, body fat, ideal weight, max/target heart rate, calories burned, water intake |
| Trigonometry | `sin`, `cos`, `tan`, inverse trig, hyperbolic variants |
| Geometry | Area, perimeter/circumference, surface area, volume of common shapes; line slope (length-unit aware) |
| Date and time | Date arithmetic, durations, timezones, Unix epoch/timestamp conversion |
| Number systems | Decimal, binary, octal, hexadecimal conversion and arithmetic |
| Bitwise operations | `~`, `&`, `|`, `xor`, `<<`, `>>` |
| Color math | Hex, RGB, RGBA, HSL, named colors, mixing, shading, complement, color temperature |
| IP address math | IPv4/IPv6 literals, CIDR blocks, masks, address arithmetic, subnet functions, classification |
| Symbolic algebra | Free variables `x`, `y`, `z`, simplify/expand, derivatives, integrals, limits |
| Complex numbers | Imaginary unit `i` and complex arithmetic in `a + bi` form |
| Coordinate systems | `point`/`vector`, polar/cylindrical/spherical/Minkowski, `to`-conversions, `distance`, `dot`, `cross`, `angle` |
| Matrices | Literals `[1 2, 3 4]` (space=column, comma/semicolon=row), `*`/`+`/`-`/`^`, `transpose`, `determinant`, `inverse`, `rank`, `rref`, `eigenvalues` |
| Visualization | `draw`/`plot` curves `y=f(x)`, complex numbers on the Argand plane, coordinate points/vectors |
| Random | `random()`, `random(min, max)`, `uuid()` (v7/v4), `nanoid()`, `coin()`, `randombool()`, `pick(...)`, `randomcolor()` (value freezes in-app; hover to re-roll) |
| Hashing | `md5`, `sha1`, `sha256`, `sha384`, `sha512`, `sha3`, `ripemd160`, `crc32` of text → hex digest |
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

Use the web app at [hissab.io](https://hissab.io). It can also be
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
hissab docs --list          # list documentation tags
hissab docs --all           # full docs dump for large-context LLMs
```

Use `hissab docs --all` when an LLM has enough context to ingest the full
reference at once. For smaller contexts, use `hissab docs --list` and fetch only
the needed tag chunks.

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

The root export also includes `Functions`, `Operators`, `Units`, the symbolic and
geometric token classes (`ExprToken`, `SymbolToken`, `ComplexToken`,
`PointToken`, `MatrixToken`, `PlotToken`), `exprToLatex` for structured symbolic
rendering, and
the sampling helpers `evalExpr` / `freeSymbols` used to plot `draw`/`plot`
curves — for consumers that need autocomplete catalogs or graphing.

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
