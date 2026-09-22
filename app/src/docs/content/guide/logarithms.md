# Logarithms

Hissab supports **natural log**, **base-10 log**, and **base-2 log**.

## Forms

- **Natural log** — `log 20`
- **Natural log aliases** — `ln 20`, `loge 20`
- **Log base 10** — `log10 20`
- **Log base 2** — `log2 20`

```hissab
log 20
ln 20
loge 20
log10 20
log2 20
```

:::note

`log` is base **e** (the same as `ln`), not base 10. Use `log10` when you want
base 10.

:::

## Change of base

For another base, use the identity `log(x) / log(base)`.

```hissab
log 343 / log 7
```

## Examples

```hissab
log2 1024
log10 1000
log 100
```

## Common mistakes

:::caution

- **`log 1000`** returns `6.9078`, not `3` — `log` is the natural log. Use
  `log10 1000` for base 10.
- **`-log10 0.00001`** is invalid as a leading negation on a prefix function.
  Calculate the log first, then negate separately if needed.

:::
