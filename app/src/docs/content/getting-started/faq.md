# FAQ

## Philosophy & behavior

### Does Hissab ignore extra words?

**No — Hissab is strict.** Unknown words and misspelled units make the whole
expression invalid. Write `10 + 10`, not `what is 10 + 10`.

### Strict parsing sounds user-hostile. Why not just be forgiving?

**A loud error beats a silent wrong answer.** Forgiving calculators quietly drop
what they don't understand and compute on the rest — so they hand you a wrong
number and you never know. For anything financial, scientific, or engineering,
refusing to guess is the only defensible default. The AI layer smooths the input
side: you can type messy natural language and the assistant turns it into a clean
Hissab expression before the engine evaluates it.

### Does Hissab convert currency?

**Not automatically** in the local calculator engine. Exchange rates change, and
Hissab avoids stale built-in rates. If you have a rate, include it directly in
the expression. When using AI, the assistant can use realtime search for rates if
the selected provider supports hosted search.

### Why does `5 m to miles` fail?

In Hissab, **`m` is the million multiplier.** Use `meter` for length.

```hissab
5 meter to miles
```

### Why did a date become a number?

**Dashes and slashes are arithmetic operators.** Use dot-separated dates or
written months.

```hissab
2020.08.07 + 5 days
7 aug 2020 + 5 days
```

### Are labels saved forever?

**No — labels live within the current evaluated batch.** The CLI REPL keeps
scope while the REPL is open, but separate app or tool calls should define the
labels they need.

### Where are app settings stored?

The app stores notebooks, AI provider settings, MCP servers, and skills in the
**browser profile**. Clearing site data can remove them.

## vs Other tools

### Isn't this just Soulver with a different coat of paint?

Soulver is an Apple-platform notepad calculator. Hissab differs on four fronts:
**platform reach** (web/extension/CLI/library/agent, every OS, offline),
**developer + STEM depth** (IP/CIDR, hashing, matrices, complex numbers,
symbolic algebra, coordinate systems), **open source + bring-your-own AI key**,
and **being an embeddable engine and an agent tool**,
not just an app.

### Why not just use a spreadsheet?

Spreadsheets are excellent for tabular models and repeated business workflows.
Hissab is better for quick, readable, mixed-domain calculations where you want a
notebook-like trail without setting up rows, columns, formulas, and cell
references. A spreadsheet also can't add `5 ft + 9 in`, reason about timezones,
or carry units through a calculation.

### Why not just use Wolfram|Alpha?

Wolfram is more powerful for expert knowledge and advanced math, but Hissab is
lighter, local-first for core calculations, embeddable, CLI-friendly, and
agent-oriented. It is for everyday exact expression work, not for replacing the
entire Wolfram ecosystem.

### Why not just use Python or Jupyter?

Python is the right choice when the task needs programming: loops, datasets,
custom algorithms, libraries, or automation. Hissab is better when the task is a
calculation, not a program — it is faster to write, easier to audit, and
available inside the app, CLI, library, and agent workflows. See the
**Hissab vs Alternatives** page for the detailed comparison.

## AI & agents

### Why not just ask ChatGPT, Claude, or Gemini directly?

For explanation and reasoning, AI assistants are useful. For exact calculation,
they should use tools. Hissab gives them a strict calculation tool with
domain-specific syntax and documentation, reducing the chance the model
hallucinates a number or quietly uses the wrong formula.

### Why would AI agent users care?

Agents are good at translating intent but unreliable as calculators. Hissab lets
the agent turn the user's request into an explicit expression, call a
deterministic engine, and answer from the result — instead of doing arithmetic
from memory.

### How is this better than an agent writing Python?

In short: it moves correctness out of generated code and into a fixed, tested
engine. The agent emits a one-line expression instead of an arbitrary program —
cheaper, faster, with no code-execution risk, and reproducible across every
surface. The **Hissab vs Alternatives** page covers this objection in full.

## Trust & limits

### Does Hissab solve equations?

**Not yet.** Hissab supports symbolic simplification, expansion, derivatives,
integrals, and limits for expressions involving `x`, `y`, and `z`, but it does
not solve equations for a variable.

### Is Hissab a CAS?

**Not fully.** It does symbolic simplification, expansion, derivatives,
integrals, and limits, but not equation solving. Think of it as a practical
natural-language calculator and agent math engine, not a Mathematica
replacement.

### Does Hissab support imaginary numbers?

**Yes.** Use `i` as the imaginary unit.

```hissab
(2 + 3i) * (1 - i)
```

### How do I trust the engine is right?

The engine is a single source of truth with a cross-browser test suite, every
documented example is verified against the real engine, and — crucially — every
answer is reproducible from a readable expression you can re-run anywhere. You
are not trusting a black box; you are trusting an auditable, deterministic one.

### What can't Hissab do?

No live currency/FX conversion (pass the rate, or let the AI layer fetch it), no
equation solving *yet* (it does simplify/expand/derivatives/integrals/limits),
and it is not for big-dataset, ML, or statistical-modeling work — that is still
Python's job.

## Open source & business model

### Is Hissab free? What's the business model?

The calculator is **open-source and free.** AI features use **your own provider
key**, so there is no markup on inference and your keys stay in your browser.
The hosted MCP server is free with rate limits, with commercial options for
heavier and B2B use.
