# Probability

Write a probability with `P(...)`. The value must be between 0 and 1, and a
percentage works too, so `P(10%)` is the same as `P(0.1)`. A probability is just
a number, so ordinary arithmetic still applies.

```hissab
P(0.1)
P(10%)
P(0.3) - P(0.1)
```

Function names are case-insensitive, so `P(0.5)` and `p(0.5)` are the same.

## Combining probabilities

Use the bitwise operators on probabilities. They switch to probability math
whenever at least one operand is a `P(...)`.

| Expression | Meaning | Result |
| ----------------- | ------------------------ | ------ |
| `~P(0.2)` | Complement (NOT), `1 − p` | `0.8` |
| `P(0.5) & P(0.3)` | Intersection (AND), `p·q` | `0.15` |
| `P(0.5) \| P(0.3)` | Union (OR), `p + q − p·q` | `0.65` |
| `P(0.5) xor P(0.3)` | Exactly one, `p + q − 2·p·q` | `0.5` |

```hissab
P(0.1) & P(0.2)
P(0.1) | P(0.2)
~P(0.2)
P(0.2) & P(0.3) & P(0.1)
```

`&` binds tighter than `|` (AND before OR), and combinations stay probabilities,
so they chain.

:::note

These formulas assume the events are **independent**. For mutually exclusive
events the union is simply `P(a) + P(b)` — add them directly instead of using
`|`.

:::

## Functions

| Function | Description | Example |
| ------------------------------ | ---------------------------------------- | ------------------------------ |
| `conditional(pAandB, pB)` | Conditional probability P(A\|B) | `conditional(0.12, 0.3)` |
| `bayes(prior, likelihood, fp)` | Bayes' posterior P(H\|E) | `bayes(0.01, 0.9, 0.05)` |
| `odds(p)` | Odds for a probability, `p / (1 − p)` | `odds(0.75)` |
| `probability from odds(o)` | Probability implied by odds, `o / (1+o)` | `probability from odds(3)` |
| `binomial(n, k, p)` | k successes in n independent trials | `binomial(10, 3, 0.5)` |
| `expected value(v1, p1, …)` | Weighted sum of value/probability pairs | `expected value(10, 0.5, 20, 0.5)` |

`bayes` takes the prior P(H), the likelihood P(E|H), and the false-positive
likelihood P(E|¬H):

```hissab
bayes(0.01, 0.9, 0.05)
binomial(10, 3, 0.5)
expected value(100, 0.3, 0, 0.7)
```

## Common mistakes

:::caution

- **`P(50)`** is invalid — a probability is between 0 and 1. Write `P(50%)` or
  `P(0.5)`.
- **`P(0.5) | P(0.3)`** is union (OR), not "P of A given B". Conditional
  probability is the separate `conditional(...)` function.
- Without any `P(...)`, `&` and `|` stay integer bitwise operators, so `5 & 3`
  is still a bitwise AND.
- Values below 1 are shown to 3 significant figures, so `binomial(10, 3, 0.5)`
  prints `0.117`.

:::
