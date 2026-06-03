export const complex_numbers = `
## Complex numbers

\`i\` is the imaginary unit (i² = -1). Write complex numbers naturally and combine
them with \`+\`, \`-\`, \`*\`, \`/\`, and \`^\`.

### Writing complex numbers

- \`i\` on its own is \`0 + 1i\`. A coefficient attaches by juxtaposition: \`3i\`,
  \`-2i\`. A real and imaginary part add together: \`2 + 3i\`.
- Results render in \`a + bi\` form: \`2 + 3i\`, \`-i\`, \`5\` (when the imaginary part is
  zero), \`2 - 4i\`.

### Arithmetic

\`\`\`
i^2                       → -1
(2 + 3i) + (1 - i)        → 3 + 2i
(5 + 2i) - (3 + 6i)       → 2 - 4i
(12 + 6i) * (17 - 7i)     → 246 + 18i
1/i                       → -i
\`\`\`

### Examples

User: multiply (12 + 6i) by (17 - 7i)
Expression: \`(12 + 6i) * (17 - 7i)\` → 246 + 18i

User: what is 1 divided by i
Expression: \`1/i\` → -i

### Notes

- Integer powers are exact (\`i^2\` is exactly \`-1\`); other powers use the principal
  branch.
- Complex numbers are dimensionless — they don't combine with units.
- This is separate from symbolic algebra: an expression with a free variable
  (\`x\`) stays symbolic, while one with only numbers and \`i\` evaluates to a complex
  number.
`;

export default complex_numbers;
