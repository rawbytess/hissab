# Hissab vs Alternatives

Hissab is the **calculation layer between casual calculators and full
programming environments**. It gives you the convenience of plain-language math
with the reliability of a real parser and calculator underneath — and it runs
the same engine across the web app, a CLI, an embeddable library, and as a tool
that AI agents can call.

```hissab
25% of 200
15 kilometers to miles
emi(500000, 6.5%, 30 years)
network(192.168.1.130/24)
```

Most "natural-language calculators" stop at everyday arithmetic and units.
Hissab is different along four axes at once: it is **strict** (it never guesses),
**unit- and type-aware** (metadata flows through the whole computation),
**broad** (around 25 calculation domains in one language), and **portable** (one
engine, many surfaces — including AI agents).

## How Hissab compares

| Tool | What it's great at | Where Hissab differs |
| --- | --- | --- |
| **Soulver** | Apple-platform notepad calculator with live results, line references, units, and dates. | Hissab runs on every OS (web/PWA, CLI, extension), is open-source, embeddable as a library and callable by AI agents, and goes deeper into developer/STEM domains. |
| **Numi / Calca / Numbr** | Desktop natural-language calculators with variables and units. | Many are narrower or more platform-specific. Hissab adds IP/CIDR, hashing, matrices, complex numbers, symbolic algebra, colors, and graphing — and works beyond the desktop. |
| **Qalculate!** | Extremely capable power calculator with deep unit support. | Powerful but not natural-language or notebook-style. Hissab reads like everyday math and chains results line-to-line. |
| **Wolfram\|Alpha / Mathematica** | Vast computational knowledge and advanced math/CAS. | Heavyweight and cloud/subscription for depth. Hissab is lighter, local-first for core math, embeddable, CLI-friendly, and agent-oriented — for everyday exact expression work. |
| **Spreadsheets (Excel / Sheets)** | Tabular models and repeated business workflows. | Can't add `5 ft + 9 in`, reason about timezones, or carry units. Hissab is better for quick, readable, mixed-domain calculations without building rows, columns, and cell references. |
| **Spotlight / Google box / system calc** | Instant one-off arithmetic. The habit to beat on adoption. | No units-with-dimensional-safety, no notebook trail, no dates/finance/dev math, no reusable expressions. |
| **Raw LLM "just do the math"** | Reasoning, explanation, and language. | LLMs hallucinate numbers and silently pick wrong formulas. Hissab gives the model a deterministic engine to call, so the answer is anchored, not guessed. |

## Hissab vs Python tools (Claude Code, Codex, code interpreters)

The framing is **right tool for the job**. A coding agent *can* write Python for
a calculation, but that turns every calculation into a small software task:
choose libraries, write code, parse units, pick formulas, manage dependencies,
run code, and hope the generated program matches your intent. Hissab removes
that layer — the agent emits a short, documented expression like
`emi(500000, 6.5%, 30 years)`. The concrete advantages:

1. **It collapses the error surface from "an arbitrary program" to "a one-line
   expression."** When an LLM solves math by writing Python, the *code itself is
   generated*, so the model is both author and validator. It can pick the wrong
   formula, botch rounding, mix up percent vs decimal, or fumble a date edge case
   — and the program runs successfully and returns a confidently wrong number.
   With Hissab the computation lives in a fixed, tested engine; the only thing the
   model generates is a short expression you can eyeball.

2. **Domain correctness is baked in — Python's isn't.** Ask an agent to add
   `50 grams + 12 km` in raw Python and it cheerfully returns `62`. Hissab
   *rejects* incompatible dimensions by default and carries units natively. Same
   for timezones, number bases, IP math, and financial conventions — the domain
   rules can't be skipped.

3. **Cheaper and faster for common calculations.** For *"15% off $240"* or
   *"175 lbs to kg"*, a Hissab expression is one small tool call or shell-out.

4. **No code-execution environment required — and no arbitrary-code risk.**
   Running LLM-generated Python is, by definition, arbitrary code execution (it can
   touch the filesystem, network, and env vars), and many agent contexts have no
   sandbox at all. Hissab evaluates a constrained expression grammar with no
   file/network/system access — the worst case is a wrong number, never a
   compromised host.

5. **Reproducible, auditable artifacts.** `cagr(1000, 2000, 10 years)` returns the
   identical answer in the app, the CLI, the library, and the MCP server. Ad-hoc
   Python is different every run and depends on library versions and float
   handling. Hissab leaves a diffable, re-runnable record of exactly how a number
   was produced.

The honest close: Hissab does **not** replace Python for heavy data science, ML,
large datasets, or custom algorithms. It replaces the reflex of either letting
the LLM do unreliable mental math or firing a code interpreter for what is
really one expression.

:::tip

The agent's decision rule becomes: don't compute it yourself (you hallucinate),
don't write a program (slow, risky, variable) — emit one expression to a
deterministic engine.

> Claude Code and Codex are excellent at building software. Hissab is the
> calculator they should call when the software task contains math.

:::

## Messaging in one screen

- **Exactness** — Hissab parses and evaluates deterministically. It does not
  guess, silently drop unknown words, or ask a model to do arithmetic from memory.
- **Breadth** — everyday, business, technical, educational, and agentic
  calculations in one expression language.
- **Auditability** — every answer traces back to a short, visible, editable
  expression.
- **Portability** — the same engine works in the web app, CLI, TypeScript
  library, MCP server, and agent skills.
- **AI leverage** — Hissab turns AI from a risky calculator into a translator and
  explainer backed by a real math engine.

:::note

For the common objections in question-and-answer form, see the **FAQs** page.
For the full grammar, start with **Writing Expressions**.

:::
