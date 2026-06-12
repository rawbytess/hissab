# Arithmetic

**Plain numeric math.** Arithmetic needs no special setup.

## Operators

- **Addition** — `13 + 44 + 23 + 5645.43`
- **Subtraction** — `100 - 25`
- **Multiplication** — `10 * 5`
- **Division** — `100 / 5`
- **Power** — `10 ^ 5`
- **Root** (fractional exponent) — `256 ^ (1/8)`
- **Factorial** — `5!`
- **Modulo** — `10 mod 7`
- **Absolute value** — `abs(-234)`

```hissab
13 + 44 + 23 + 5645.43
100 - 25
10 * 5
100 / 5
10 ^ 5
```

## Precedence

**Lower rank binds tighter.** Use parentheses when the grouping matters.

1. `!` postfix factorial and `%` postfix percent
2. `^`
3. `*`, `/`, `mod`
4. `+`, `-`

`^` is right-associative, following mathematical convention: `2^3^2` is
`2^(3^2)` = 512, not `(2^3)^2` = 64. All other operators of equal precedence
evaluate left to right.

```hissab
14 + 88 / 11 * 23.56 - 17
256 ^ (1/8)
5!
10 mod 7
abs(-234)
```

## Roots

Hissab needs no separate root function. Use a **fractional exponent** and
parenthesize it so the exponent is applied before division.

```hissab
27 ^ (1/3)
256 ^ (1/8)
```

## Common mistakes

:::caution

- **`256 ^ 1/8`** is valid syntax but means `(256 ^ 1) / 8`, which returns `32`.
  Use `256 ^ (1/8)` for the eighth root.
- **`abs -5`** is invalid — `abs` is a function, so write `abs(-5)`.
- **`5 apples + 3 apples`** is invalid — `apples` is not a known unit. Hissab
  does not remove unknown words and keep calculating.
- **`10 20 30`** is invalid for plain numbers — use explicit operators.

:::

```hissab
10 + 20 + 30
```
