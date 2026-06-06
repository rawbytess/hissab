# Random & IDs

Generate random values — a number in a range, a unique identifier, a coin flip,
or a random choice. Function names are case-insensitive.

```hissab
random(1, 6)
random(10, 100)
uuid()
nanoid()
```

## Functions

| Function | Description | Example |
| ------------------- | ----------------------------------------------- | ----------------- |
| `random()` | A real number in `[0, 1)` | `random()` |
| `random(max)` | A whole number from `0` to `max` (inclusive) | `random(6)` |
| `random(min, max)` | A whole number from `min` to `max` (inclusive) | `random(10, 100)` |
| `uuid()` | A UUID — version 7 (time-ordered) by default | `uuid()` |
| `uuid(4)` / `uuid(7)` | A specific UUID version (v4 random, v7 ordered) | `uuid(4)` |
| `nanoid()` | A 21-char URL-safe id; `nanoid(n)` sets length | `nanoid()` |
| `coin()` | `"heads"` or `"tails"` | `coin()` |
| `randombool()` | `true` or `false` | `randombool()` |
| `pick(...)` | One argument chosen at random | `pick(1, 2, 3)` |
| `randomcolor()` | A random colour (shown as a swatch) | `randomcolor()` |

`random` returns a plain number, so it composes with the rest of an expression.
`uuid()`, `nanoid()`, `coin()`, and a text `pick(...)` return text.

```hissab
random(1, 6)
5 + random(1, 6)
random(100) %
random(1, 2^4)
pick("rock", "paper", "scissors")
```

Non-integer bounds give a real number in `[min, max)`:

```hissab
random(0, 1.5)
random(2.5, 7.5)
```

## Stable values (managed seed)

The editor re-evaluates every line as you type, so a bare `random()` would
produce a new value on every keystroke. To prevent that, the app **freezes** the
value the first time the line evaluates: it attaches a hidden seed to the call.

- The call still reads as `random(10, 100)` — the seed isn't shown.
- The seed lives in the saved text, so the value stays the same across edits,
  reloads, and copy/paste.
- Hover the function name to reveal the seed and **re-roll** for a new value.
- You never manage the seed yourself.

Outside the app (the CLI or one-shot evaluation), these functions draw a fresh
value on every run — numbers from the system RNG, and `nanoid()` / unseeded
`uuid()` from a cryptographically secure source.

## Common mistakes

:::caution

- **`random(min, max)`** returns a whole number when both bounds are integers.
  Pass a non-integer bound (e.g. `random(0, 1.0)` → use `random(0, 1.5)`) for a
  real number in the range.
- A **`uuid()`**, **`nanoid()`**, **`coin()`**, or text **`pick(...)`** result is
  text, not a number, so it cannot be used in further arithmetic in the same
  expression.

:::
