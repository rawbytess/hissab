# Arithmetic

**Plain numeric math.** Arithmetic needs no special setup.

## Operators

- **Addition** — `13 + 44 + 23 + 5645.43`
- **Subtraction** — `100 - 25`
- **Multiplication** — `10 * 5`
- **Division** — `100 / 5`
- **Power** — `10 ^ 5`
- **Square root** — `sqrt(144)` or `sqrt 144`
- **Other roots** (fractional exponent) — `256 ^ (1/8)`
- **Factorial** — `5!`
- **Modulo** — `10 mod 7`
- **Modular power** — `powmod(7, 222, 1000)`
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

A prefix function such as `sqrt`, `log` or `sin` applies to the value right after
it: `sqrt 16 + 9` = 13. Use parentheses for more: `sqrt(16 + 9)` = 5.

```hissab
14 + 88 / 11 * 23.56 - 17
256 ^ (1/8)
5!
10 mod 7
abs(-234)
```

## Roots

`sqrt` takes the square root; a perfect square stays a whole number, and a
negative input gives the imaginary root (`sqrt(-4)` = `2i`). For any other root,
use a **fractional exponent** and parenthesize it so the exponent is applied
before division.

```hissab
sqrt(144)
sqrt 2
sqrt(-4)
27 ^ (1/3)
256 ^ (1/8)
```

## Rounding

`floor` rounds down, `ceil` rounds up and `round` rounds to the nearest (halves
go away from zero). Each takes an optional number of decimal places; a negative
count rounds to tens, hundreds, … A unit is kept.

```hissab
floor(7.5)
ceil(7.2)
round(2.5)
round(-2.5)
round(3.14159, 2)
round(1234567, -3)
floor(12.7 meter)
```

## Exact whole numbers

Whole numbers you type, and `+ - * ^ ! mod perm comb gcd lcm abs` on them, stay
**exact at any size** — there is no rounding past 16 digits. Results of up to 100
digits are shown in full. `powmod(base, exponent, modulus)` gives a remainder
without building the power, so the exponent can be huge.

```hissab
2^100
(2^60 + 1) - 2^60
7^222 mod 1000
powmod(7, 10^18, 1000)
30!
```

Anything with a fraction (`2^100 / 3`, `2^0.5`) is a regular floating-point
number: about 15 significant digits, displayed to 4 decimal places.

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
