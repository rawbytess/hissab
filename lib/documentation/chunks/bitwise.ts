export const bitwise = `
## Bitwise operations

Operate on integer values regardless of base (decimal / binary / octal / hex).

### Operators

- NOT: \`~0b011010\`
- AND: \`123123 & 0b100101\`
- OR: \`0b1011010 | 0x123abe23\`
- XOR: \`0o1024123 xor 0b0101101001\`
- Right shift: \`12342 >> 5\`
- Left shift: \`72318379 << 3\`

### Examples

User: mask 0xff with 0x0f
Expression: \`0xff & 0x0f\` → 0xf (keeps the left operand's base; append
\`to decimal\` for 15)

User: flip the low byte of 0x1234
Expression: \`0x1234 xor 0xff\` → 0x12cb

User: shift 1 left by 8
Expression: \`1 << 8\` → 256

### Common mistakes

Incorrect: \`5 and 3\`, \`12 or 10\`
Result: \`12 or 10\` errors (no result — \`or\` is unrecognized); \`5 and 3\` gives a
misleading \`8 and\` (\`and\` is read as a place/timezone name, not rejected)
Correct: \`5 & 3\` → 1, \`12 | 10\` → 14
Why: the bitwise AND/OR operators are the symbols \`&\` and \`|\`, not the words.
(\`xor\` *is* a keyword.)

Incorrect: \`5 ^ 3\` for XOR
Result: \`125\` (that's 5 to the power 3)
Correct: \`5 xor 3\` → 6
Why: \`^\` is exponentiation. Use the keyword \`xor\` for exclusive-or.

### Notes

- \`~\` is the only **prefix** bitwise operator; the others are infix.
- Output formatting: by default the result inherits the left operand's base
  (binary / hex / decimal). Append \`to <base>\` to override.
`;

export default bitwise;
