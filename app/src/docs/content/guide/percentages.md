# Percentages

Percent operations work as **standalone postfix values** and in **idiomatic
phrases** such as `X% of Y` or `X% of what is Y`.

## Forms

- **Standalone percent** — `5%`
- **Percent of a value** — `25% of 200`
- **Add markup** — `200 + 20%`
- **Subtract discount** — `2478 - 30%`
- **Discount wording** — `5% off 10`
- **Reverse percent** — `33% of what is 3000`
- **Percent with a unit** — `20% of 100 meters`

```hissab
5%
25% of 200
200 + 20%
2478 - 30%
5% off 10
33% of what is 3000
20% of 100 meters
```

## Markup and discount

When a percent appears with `+` or `-`, Hissab applies it to the **other
operand**.

```hissab
240 - 15%
200 + 8%
```

## Reverse percent

Use `% of what is` when you know the part and need the **original total**.

```hissab
33% of what is 3000
```

## Common mistakes

:::caution

- **`10% + 50`** does not mean `0.10 + 50`. It adds 10 percent of 50 to 50. Use
  `0.1 + 50` if you need the literal decimal.
- **`25 is what percent of 200`** is not a supported phrase — compute the ratio
  directly with `25 / 200 * 100`.

:::

```hissab
0.1 + 50
25 / 200 * 100
```
