export const number_systems = `
## Number systems

### Prefixes

- Decimal (default): \`1234\`
- Binary: \`0b10011010\`
- Octal: \`0o12341\`
- Hexadecimal: \`0x12ab2e4\`

### Conversion

Targets are \`binary\`, \`octal\`, \`decimal\`, and \`hex\` (use \`hex\`, *not*
\`hexadecimal\`):

\`\`\`
0xff to binary    → 0b11111111
0o755 to hex      → 0x1ed
255 to octal      → 0o377
\`\`\`

### Arithmetic across bases

You can mix bases freely; convert the final result with \`to <base>\` if you
want a specific format:

\`\`\`
0b10011010 + 0x1a to decimal   → 180
\`\`\`

### Examples

User: convert 0xff to binary
Expression: \`0xff to binary\` → \`0b11111111\`

User: binary 10011010 plus hex 1a, in decimal
Expression: \`0b10011010 + 0x1a to decimal\` → 180

### Common mistakes

Incorrect: \`255 to hexadecimal\`
Result: errors
Correct: \`255 to hex\` → 0xff
Why: the hex target keyword is \`hex\`; \`hexadecimal\` isn't recognized.
(\`binary\`, \`octal\`, \`decimal\` do work spelled out.)

Incorrect: \`0b888\`, \`0o99\`, \`0xkkkk\`
Result: errors
Correct: use only digits valid for the base — \`0b\` → 0/1, \`0o\` → 0-7,
\`0x\` → 0-9 a-f
Why: out-of-range digits make the literal invalid.

### Notes

- Output formatting follows the requested base. If you don't append \`to <base>\`,
  the result follows the **left** operand's base.
- Negative numbers in non-decimal bases aren't supported as literals; compute
  with positive literals and negate the result (\`-0x1a\` → 0x-1a).
`;

export default number_systems;
