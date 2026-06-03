# Operators & precedence

Every operator Hissab understands, and the order it applies them in. For the
details of each group, see **Arithmetic**, **Percentages**, **Probability**,
**Bitwise operations**, **Symbolic algebra**, **Complex numbers**, and **Sets
and combinatorics**.

## Precedence

Ranked from **tightest-binding (applied first)** to **loosest-binding (applied
last)**. Operators sharing a rank are applied left to right.

| Rank | Operators | Group |
| ---- | --------- | ----- |
| 1 | `~` (NOT), `perm`, `comb` | Bitwise / combinatorics |
| 2 | `!` (factorial) | Arithmetic |
| 3 | `%` (postfix), prefix functions `sin`, `cos`, `log`, … | Percent / functions |
| 4 | `^` (power) | Arithmetic |
| 5 | `*`, `/`, `mod` | Arithmetic |
| 6 | `+`, `-` | Arithmetic |
| 7 | `off`, `of what is` | Percent phrases |
| 8 | `&` (AND) | Bitwise |
| 9 | `\|` (OR) | Bitwise |
| 10 | `xor`, `<<`, `>>` | Bitwise |
| 11 | `to` (conversion) | Conversion |
| 12 | `=` (assignment) | Assignment |

```hissab
2 + 3 * 4
(2 + 3) * 4
256 ^ (1/8)
```

:::tip
**When in doubt, parenthesize.** Bitwise operators bind looser than arithmetic,
so `1 + 2 & 3` applies the `+` before the `&` — parenthesize to make the intent
explicit.
:::

## Arithmetic

| Operator | Meaning | Example |
| -------- | ------------------- | --------- |
| `+` `-` | add, subtract | `100 - 25` |
| `*` `/` | multiply, divide | `10 * 5` |
| `^` (or `**`) | power | `2 ^ 10` |
| `mod` | modulo (remainder) | `10 mod 7` |
| `!` | factorial (postfix) | `5!` |

```hissab
10 mod 7
5!
2 ^ 10
```

## Percent

| Operator | Meaning | Example |
| --------------- | ----------------------------------------- | --------------------- |
| `%` | postfix percent (`5%` → 0.05) | `5%` |
| `% of` | percent of a value | `25% of 200` |
| `+ %` / `- %` | markup / discount applied to other operand | `200 + 20%` |
| `off` | discount wording | `5% off 10` |
| `% of what is` | reverse percent | `33% of what is 3000` |

```hissab
25% of 200
200 + 20%
33% of what is 3000
```

## Combinatorics

`perm` and `comb` are **infix** operators, not functions.

| Operator | Meaning | Example |
| -------- | ----------------------------- | ----------- |
| `perm` | permutations (order matters) | `10 perm 3` |
| `comb` | combinations (order ignored) | `10 comb 3` |

```hissab
10 perm 3
10 comb 3
```

## Bitwise

| Operator | Meaning | Example |
| --------- | ----------------- | -------------- |
| `~` | NOT (prefix) | `~0b011010` |
| `&` | AND | `0xff & 0x0f` |
| `\|` | OR | `0b1010 \| 0x1` |
| `xor` | XOR | `5 xor 3` |
| `<<` `>>` | left / right shift | `1 << 8` |

```hissab
0xff & 0x0f to decimal
5 xor 3
1 << 8
```

:::note
`^` is **power**, not XOR — use `xor`. The words `and` / `or` are not bitwise
operators; use `&` and `|`.
:::

## Probability operators

When at least one operand is a `P(...)` probability, the bitwise operators switch
to probability math for independent events.

| Operator | Meaning | Example |
| -------- | --------------------- | -------------------- |
| `~` | Complement | `~P(0.2)` |
| `&` | Intersection / AND | `P(0.5) & P(0.3)` |
| `\|` | Union / OR | `P(0.5) \| P(0.3)` |
| `xor` | Exactly one | `P(0.5) xor P(0.3)` |

Without `P(...)`, these remain integer bitwise operators.

## Symbolic and complex arithmetic

The normal arithmetic operators also apply to symbolic and complex values.

```hissab
2x^2 - 4x^2
(x + 1)*(x + 2)
(2 + 3i) * (1 - i)
i^2
```

Implicit multiplication works for numbers next to symbols (`2x`), but use an
operator or a space between symbols (`x*y` or `x y`).

## Conversion and assignment

| Operator | Meaning | Example |
| -------- | ------------------------------------------- | ----------------------- |
| `to` | convert to a unit, number base, or color | `15 km to miles` |
| `per` | compound-unit divider | `60 mile per hour` |
| `in` | render a time in a timezone | `now in beijing` |
| `=` | assign a result to a label | `savings = 4500 - 1200` |

```hissab
15 kilometers to miles
60 mile per hour to meter/second
savings = 4500 - 1200
```
