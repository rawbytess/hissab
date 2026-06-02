# Bitwise operations

Bitwise operators work on integer values regardless of whether the value is
written in decimal, binary, octal, or hex.

## Operators

- **NOT** — `~0b011010`
- **AND** — `123123 & 0b100101`
- **OR** — `0b1011010 | 0x123abe23`
- **XOR** — `0o1024123 xor 0b0101101001`
- **Right shift** — `12342 >> 5`
- **Left shift** — `72318379 << 3`

```hissab
~0b011010
123123 & 0b100101
0b1011010 | 0x123abe23
0o1024123 xor 0b0101101001
12342 >> 5
72318379 << 3
```

## Examples

```hissab
0xff & 0x0f
0x1234 xor 0xff
1 << 8
```

:::note

Output formatting usually inherits the **left operand's base**. Append a base
conversion when you want another format.

:::

```hissab
0xff & 0x0f to decimal
```

## Common mistakes

:::caution

- Use **`&`** and **`|`** for bitwise AND and OR — the words `and` and `or` are
  not the operators.
- **`5 ^ 3`** is exponentiation, not XOR. Use `5 xor 3`.
- **`~`** is the only prefix bitwise operator; the rest are infix.

:::

```hissab
5 xor 3
```
