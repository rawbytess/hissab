# Number theory

Number theory functions cover fractions, mixed numbers, primality, and divisors.
Each function takes one number, or an expression that evaluates to a number.

```hissab
fraction(0.75)
mixed fraction(7/3)
isprime(91)
factors(28)
```

## Functions

| Function | Description | Example |
| ------------------- | -------------------------------- | --------------------- |
| `fraction(x)` | Convert a decimal to a reduced fraction | `fraction(0.625)` |
| `mixed fraction(x)` | Convert to a mixed number when possible | `mixed fraction(7/3)` |
| `isprime(x)` | Test whether an integer is prime | `isprime(91)` |
| `factors(x)` | List every divisor of a positive integer | `factors(28)` |

Function names are case-insensitive, so `isPrime(7)` and `isprime(7)` are the
same.

## Fractions

`fraction` returns a reduced fraction. Improper fractions stay improper, and
whole numbers render plainly.

```hissab
fraction(0.75)
fraction(2.5)
fraction(4)
fraction(6/8)
```

`mixed fraction` converts improper fractions to mixed numbers. Proper fractions
are unchanged.

```hissab
mixed fraction(2.5)
mixed fraction(7/3)
mixed fraction(0.75)
```

:::note

The argument is evaluated first, so quotients work directly. `fraction`
approximates repeating decimals to the nearest simple fraction, with a
denominator up to 1,000,000.

:::

## Primes and divisors

`isprime` returns `true` only for prime integers. It returns `false` for
non-integers and numbers below 2.

```hissab
isprime(7)
isprime(91)
isprime(1)
isprime(7.5)
```

`factors` lists every positive divisor in ascending order, including 1 and the
number itself.

```hissab
factors(12)
factors(28)
```

## Common mistakes

:::caution

- **`factors(12)`** lists every divisor, not the prime factorization.
- **`factors(-12)`** is invalid because `factors` needs a positive integer.
- Fraction, list, and boolean results are display values. They cannot be fed
  back into further arithmetic in the same expression.

:::
