# Number systems

Hissab supports decimal, binary, octal, and hexadecimal literals.

## Prefixes

| Base | Prefix | Example |
| ----------- | ------ | ----------- |
| Decimal | none | `1234` |
| Binary | `0b` | `0b10011010` |
| Octal | `0o` | `0o12341` |
| Hexadecimal | `0x` | `0x12ab2e4` |

```hissab
1234
0b10011010 to decimal
0o12341 to decimal
0x12ab2e4 to decimal
```

## Conversion

Targets are `binary`, `octal`, `decimal`, and `hex`.

```hissab
0xff to binary
0o755 to hex
255 to octal
```

:::note

Use `hex`, **not** `hexadecimal`, as the conversion target.

:::

## Arithmetic across bases

You can mix bases freely and convert the final result.

```hissab
0b10011010 + 0x1a to decimal
0xff & 0x0f to decimal
```

## Notes

- If you do not append `to <base>`, output formatting follows the **left
  operand's base**.
- Negative numbers in non-decimal bases are not supported as literals. Compute
  with positive literals and negate the result separately if needed.

## Common mistakes

:::caution

- **`255 to hexadecimal`** is invalid — use `255 to hex`.
- **Digits must fit the base** — binary uses `0`–`1`, octal uses `0`–`7`, and
  hex uses `0`–`9` plus `a`–`f`.

:::

```hissab
255 to hex
```
