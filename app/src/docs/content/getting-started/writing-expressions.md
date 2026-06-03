# Writing expressions

Hissab expressions are **compact, strict, and unit-aware**. Write the
calculation you want evaluated, one expression per line.

## Numbers

Decimals are the default. **Commas can be used as digit grouping**, and other
bases use prefixes.

```hissab
1234
3.14
5,000,000
0b10011010 to decimal
0xff to binary
```

Numeric multipliers such as `k`, `m`, and `b` work after a number.

:::note

In Hissab, **`m` means million, not meter.**

:::

```hissab
30k
7.7m
5 million
```

## Operators and grouping

Use regular math operators and parentheses for grouping.

```hissab
(5 + 6) * 3
256 ^ (1/8)
14 + 88 / 11 * 23.56 - 17
```

## Units and conversions

Units are part of the expression. The `to` keyword names the target unit, but
the value still needs a **source unit**.

```hissab
15 kilometers to miles
13 kilograms + 12 pounds to kg
5 feet + 9 inch to centimeter
```

## Functions

Functions use comma-separated arguments inside parentheses.

```hissab
avg(99, 34, 65, 213, 45, 123)
max(10m, 30k, 7.7m, 123123121234)
gcd(12, 15, 18, 25)
```

## Symbols and complex numbers

The symbols `x`, `y`, and `z` create symbolic algebra expressions. The imaginary
unit `i` creates complex numbers.

```hissab
2x^2 - 4x^2
(x + 1)*(x + 2)
derivative(2x^2, x)
(2 + 3i) * (1 - i)
```

Use explicit multiplication between symbols: write `x*y`, not `xy`.

## Labels and references

Assign a result with `=` and reuse it later in the same batch. **`prev`** points
to the immediately previous result.

```hissab
monthly_expense = 1000 + 200 - 50
yearly_expense = monthly_expense monthly to yearly
```

```hissab
78 kilometers to miles
prev - 45 miles
```

When several lines are evaluated together, later lines can also use `line<N>`,
`l<N>`, and `total<N>`.

```hissab
100
200
total3 + line1
```

## Case and spelling

Keywords and unit names are **case-insensitive**, and most units accept common
short forms and plurals.

```hissab
12 mEteRs to CeNtImeTer
10 grams to kg
```

:::note

Variable names are the exception: they are **case-sensitive**, so `total` and
`Total` refer to two different labels.

:::

## Strict parsing

Unknown words, misspelled units, and unsupported phrases make the expression
**invalid**. Strip conversational filler before evaluating — write `10 + 10`,
not `what is 10 + 10`.
