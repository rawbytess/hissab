export const logarithm = `
## Logarithms

- Natural log (base e): \`log 20\` → 2.9957 (\`ln\` and \`loge\` are the same)
- Log base 10: \`log10 20\` → 1.301
- Log base 2: \`log2 20\` → 4.3219

### Examples

User: how many bits to represent 1024 values
Expression: \`log2 1024\` → 10

User: log base 10 of 1000
Expression: \`log10 1000\` → 3

User: log base 7 of 343
Expression: \`log 343 / log 7\` → 3 (use the change-of-base identity log x / log b)

### Common mistakes

Incorrect: \`log 1000\` (meaning base 10)
Result: \`6.9078\` (no error — \`log\` is the natural log)
Correct: \`log10 1000\` → 3
Why: \`log\` is base **e** (same as \`ln\`), not base 10 — for base 10 use \`log10\`.

Incorrect: \`-log10 0.00001\`
Result: errors
Correct: \`log10 0.00001\` → -5 (negate separately if you need pH = 5)
Why: a leading \`-\` placed directly on a prefix function doesn't parse — compute
the log first.
`;

export default logarithm;
