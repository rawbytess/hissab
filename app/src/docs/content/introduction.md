# Introduction

**Hissab is a natural-language calculator for exact expression work.** Type one
calculation per line and Hissab evaluates numbers, units, dates, colors, bases,
statistics, and chained references in place.

```hissab
1 + 1
15 kilometers to miles
5! + 3^2
```

Lines can build on earlier lines when they are evaluated together. Use **labels**
for results you want to reuse, or **`prev`** for the immediately previous line.

```hissab
monthly_savings = 4500 - 1200 - 600
yearly_savings = monthly_savings monthly to yearly
```

## What Hissab is good at

- **Plain math** — arithmetic, percentages, powers, roots, factorials, modulo, and absolute value.
- **Unit-aware work** — conversions, mixed-unit arithmetic, rates, compound units, prefixes, and dimensional checks.
- **Data and science** — statistics, trigonometry, dates, times, number systems, bitwise operators, and color operations.
- **Workflows** — labels, `prev`, `line<N>`, and `total<N>` for multi-line calculations.
- **AI-assisted calculation** — bring your own model provider key, ask in natural language, and let the assistant produce Hissab expressions before answering.

## Expression first

Hissab is **intentionally strict**. Filler words, misspelled units, and unknown
keywords make an expression invalid instead of being silently ignored.

Write the expression itself:

```hissab
25% of 200
13 kilograms + 12 pounds to kg
256 ^ (1/8)
```

:::tip

The rest of these docs cover the app workflows and the full syntax reference
used by the engine.

:::
