import { OPERATION_TAGS, tagDescriptions } from "./tags";

const catalog = OPERATION_TAGS.map(
  (tag) => `- \`${tag}\` — ${tagDescriptions[tag]}`,
).join("\n");

export const baseDocumentation = `
# Hissab documentation

Hissab is a natural-language calculator. You give it an expression string
(\`"15 km to miles"\`, \`"5! + 3^2"\`, \`"today - 1 feb 1990 to years"\`) and it
returns the result. This document covers the basics every consumer needs.
Detailed syntax for each category lives in **chunks** — fetch only the ones
you need (see "How to fetch chunks" below).

## Writing expressions

- Numbers are decimals by default (\`1234\`, \`3.14\`, \`5,000,000\` with commas as
  digit grouping). Other bases use prefixes: \`0b\` binary, \`0o\` octal, \`0x\` hex.
- Operators and units can be written naturally with spaces: \`15 kilometers to miles\`,
  \`13 kilograms + 12 pounds\`, \`25% of 200\`.
- Use parentheses \`()\` to group sub-expressions exactly like in regular math:
  \`(5 + 6) * 3\`, \`256 ^ (1/8)\`.
- Functions take comma-separated arguments: \`avg(1, 2, 3)\`, \`max(10m, 7.7m)\`,
  \`min(99, 34, 65)\`.
- \`true\` and \`false\` are boolean literals (case-insensitive). They are mostly
  produced by predicate functions (\`isprime(7)\`, \`isprivate(192.168.1.1)\`,
  \`contains(10.0.0.0/8, 10.1.2.3)\`) but can also be written directly.
- One expression per call line. Pass several related expressions together so
  they can share labels and the \`prev\` keyword (see below).

## Labels and prev

Assign a result to a snake_case label with \`=\` and reuse it later in the same
batch of expressions.

\`\`\`
monthly_savings = 4500 - 1200 - 600
yearly_savings = monthly_savings monthly to yearly
\`\`\`

\`prev\` refers to the **immediately previous** result in the same batch. For
anything further back, label it.

\`\`\`
78 kilometers to miles
prev - 45 miles
\`\`\`

When you have multiple expressions, every expression must be either labelled
or referenced by position — the runner does not auto-name anonymous lines.

## Multi-line scope (line<N>, total<N>)

When expressions are evaluated together (CLI \`hissab run\`, MCP \`Hissab\` tool,
the app's note editor), each expression's result is also exposed to later
expressions:

- \`line<N>\` / \`l<N>\` — the result of expression number N (1-indexed).
- \`total<N>\` — the running sum of all earlier expressions before line N.
- \`prev\` — same as \`line<N-1>\` for the current line; convenience alias.

\`\`\`
100
200
total3 + line1   # 100 + 200 + 100 = 400
\`\`\`

## Categories (fetch only what you need)

Hissab supports the following categories of operations. Each has its own
documentation chunk with full grammar, examples, and gotchas. Fetch a chunk
**before** writing expressions for a category you are not already confident
about.

${catalog}

## How to fetch chunks

The way to fetch a chunk depends on the consumer:

- **Hissab CLI**: \`hissab docs <tag>\` (e.g. \`hissab docs compound_units\`).
  Run \`hissab docs --list\` to see every tag.
- **Hissab MCP server (cloud)**: call the \`Hissab_docs\` tool with
  \`{ tag: "<tag>" }\`. The MCP server's \`Hissab\` tool evaluates expressions;
  \`Hissab_docs\` returns this base doc or a chunk.
- **App agentic harness**: call the \`fetch_hissab_docs\` tool with
  \`{ tags: ["<tag>", ...] }\` — returns one or more chunks in a single call.

Skip the fetch for plain arithmetic. For anything else, pull the relevant
chunk(s) first, then write expressions.

## Common syntax pitfalls

These trip up agents most often. Two failure modes matter. Most mistakes now
**error** (you find out immediately) — in particular, any unrecognized word or
misspelled unit makes the whole expression invalid; Hissab does not drop it and
compute on the rest. The remaining trap is input that is **valid syntax but
means something other than you intended** (a date read as subtraction, an
unparenthesized exponent) — that still returns a wrong number with no warning.
Verify these before sending.

Incorrect: \`10 to weekly\`
Result: errors (the value being converted has no source unit)
Correct: \`10 yearly to weekly\` → 0.192 weekly
Why: \`to\` only names the *target*. The value must carry its own unit
(\`10 monthly to yearly\`, \`5 mile to km\`).

Incorrect: \`2020-08-07\` or \`08/07/2020\`
Result: \`2,005\` / \`0.000566\` (no error — \`-\` is subtraction, \`/\` is division)
Correct: \`2020.08.07\`, or unambiguously \`7 aug 2020\`
Why: dates use \`.\` separators or written-out months. Dashes and slashes are
read as arithmetic and silently produce a wrong number.

Incorrect: \`100 kmh\`, \`5 apples + 3 apples\`, \`what is 10 + 10\`
Result: all error (no result)
Correct: \`100 kph\` / \`100 kilometer/hour\`, \`5 + 3\`, \`10 + 10\`
Why: any unrecognized word, misspelled unit, or filler text makes the whole
expression invalid — Hissab does NOT silently drop it and compute on the rest
(a wrong number is worse than no result). Strip filler words yourself and
double-check unit spellings before sending.

Incorrect: \`9.8 m/s^2\`
Result: errors
Correct: \`9.8 meter/second^2\`
Why: \`m\` is the million multiplier, not meter. Spell out unit names in
compound units (\`meter\`, \`second\`, \`kilo gram\`).

Incorrect: \`256 ^ 1/8\`
Result: \`32\` (no error — parsed as \`(256 ^ 1) / 8\`)
Correct: \`256 ^ (1/8)\` → 2
Why: \`^\` binds tighter than \`/\`. Parenthesize fractional exponents (roots).

## Important limits

- **No currency conversion.** Hissab does not fetch exchange rates. If the
  user needs currency conversion, ask for the rate or look it up yourself,
  then build the expression with the literal rate.
- **Temperature and Duration units don't support multi-target breakdown** —
  use a separate expression per target unit (e.g. write two expressions for
  Celsius → Fahrenheit and Celsius → Kelvin instead of one combined).
- **\`m\` is the million multiplier** (\`5 m\` = 5,000,000), not the meter.
  When writing compound units, spell out \`meter\` (e.g. \`9.8 meter/second^2\`,
  not \`9.8 m/s^2\`).
`;

export default baseDocumentation;
