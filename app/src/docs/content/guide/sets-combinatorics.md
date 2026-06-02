# Sets and combinatorics

Set functions operate on **comma-separated argument lists**. Combinatorics uses
**infix operators**.

## Functions and operators

- **Maximum** — `max(10m, 30k, 7.7m, 123123121234)`
- **Minimum** — `min(10m, 30k, 7.7m, 123123121234)`
- **Least common multiple** — `lcm(12, 15, 18, 25)`
- **Greatest common divisor** — `gcd(12, 15, 18, 25)`
- **Permutation** — `10 perm 3`
- **Combination** — `10 comb 3`

```hissab
max(10m, 30k, 7.7m, 123123121234)
min(10m, 30k, 7.7m, 123123121234)
lcm(12, 15, 18, 25)
gcd(12, 15, 18, 25)
10 perm 3
10 comb 3
```

## Choosing perm or comb

Use **`comb`** when order does *not* matter.

```hissab
10 comb 3
```

Use **`perm`** when the selected positions are distinct.

```hissab
10 perm 3
```

## Units

`max` and `min` can compare **compatible units**.

```hissab
min(12 meters, 20 kms, 12 miles)
```

## Common mistakes

:::caution

- **`max 1, 2`** is invalid — `max`, `min`, `lcm`, and `gcd` are functions, so
  their arguments must be inside parentheses.
- **`perm`** and **`comb`** work on non-negative integers where `n >= r >= 0`.

:::
