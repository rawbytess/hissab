# FAQ

## Does Hissab ignore extra words?

**No — Hissab is strict.** Unknown words and misspelled units make the whole
expression invalid. Write `10 + 10`, not `what is 10 + 10`.

## Does Hissab convert currency?

**Not automatically** in the local calculator engine. If you have a rate,
include it directly in the expression. When using AI, the assistant can use
realtime search for rates if the selected provider supports hosted search.

## Why does `5 m to miles` fail?

In Hissab, **`m` is the million multiplier.** Use `meter` for length.

```hissab
5 meter to miles
```

## Are labels saved forever?

**No — labels live within the current evaluated batch.** The CLI REPL keeps
scope while the REPL is open, but separate app or tool calls should define the
labels they need.

## Does Hissab solve equations?

**Not yet.** Hissab supports symbolic simplification, expansion, derivatives,
integrals, and limits for expressions involving `x`, `y`, and `z`, but it does
not solve equations for a variable.

## Does Hissab support imaginary numbers?

**Yes.** Use `i` as the imaginary unit.

```hissab
(2 + 3i) * (1 - i)
```

## Why did a date become a number?

**Dashes and slashes are arithmetic operators.** Use dot-separated dates or
written months.

```hissab
2020.08.07 + 5 days
7 aug 2020 + 5 days
```

## Where are app settings stored?

The app stores notebooks, AI provider settings, MCP servers, and skills in the
**browser profile**. Clearing site data can remove them.
