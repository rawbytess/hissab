# Statistics

Statistical functions take **comma-separated argument lists** and return numbers.

## Functions

- **Arithmetic mean** — `avg(...)` or `mean(...)`
- **Harmonic mean** — `harmonic mean(...)`
- **Geometric mean** — `geometric mean(...)`
- **Standard deviation** — `standard deviation(...)`
- **Variance** — `variance(...)`
- **Median** — `median(...)`
- **Range** — `range(...)`

```hissab
avg(99, 34, 65, 213, 45, 123)
mean(99, 34, 65, 213, 45, 123)
harmonic mean(99, 34, 65, 213, 45, 123)
geometric mean(99, 34, 65, 213, 45, 123)
standard deviation(99, 34, 65, 213, 45, 123)
variance(99, 34, 65, 213, 45, 123)
median(99, 34, 65, 213, 45, 123)
range(99, 34, 65, 213, 45, 123)
```

## Examples

```hissab
avg(70, 80, 90, 100)
median(2, 4, 4, 6, 8, 10, 10)
standard deviation(2, 4, 4, 6, 8, 10, 10)
```

## Notes

:::note

- **Variance and standard deviation are population statistics** — they divide by
  `N`, not `N - 1`.
- `mean` and `avg` are interchangeable for arithmetic mean. Use the full names
  `harmonic mean` and `geometric mean` for those variants.

:::

## Common mistakes

:::caution

- **`geomean(8, 12, 15)`** and **`stddev(2, 4, 4)`** are invalid — use the full
  names `geometric mean(...)` and `standard deviation(...)`.

:::

```hissab
geometric mean(8, 12, 15)
standard deviation(2, 4, 4)
```
