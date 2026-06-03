# Complex numbers

Use `i` as the imaginary unit. Hissab evaluates complex arithmetic and renders
results in `a + bi` form.

```hissab
i^2
(2 + 3i) + (1 - i)
(12 + 6i) * (17 - 7i)
1/i
```

## Writing complex numbers

- **`i`** is `0 + 1i`.
- A coefficient attaches directly: `3i`, `-2i`.
- Add real and imaginary parts with `+` or `-`: `2 + 3i`, `5 - 2i`.

```hissab
i
3i
-2i
2 + 3i
2 - 4i
```

## Arithmetic

Complex values work with the same arithmetic operators as numbers.

```hissab
i^2
(2 + 3i) + (1 - i)
(5 + 2i) - (3 + 6i)
(12 + 6i) * (17 - 7i)
1/i
```

Integer powers are exact. Other powers use the principal branch.

## Examples

```hissab
(12 + 6i) * (17 - 7i)
1/i
(2 + 3i)^2
```

## Common mistakes

:::caution

- Complex numbers are dimensionless. They do not combine with units.
- `i` is a complex value, while `x`, `y`, and `z` are symbolic variables.
- An expression with only numbers and `i` evaluates as complex arithmetic. An
  expression with free variables stays symbolic.

:::
