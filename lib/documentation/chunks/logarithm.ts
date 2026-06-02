export const logarithm = `
## Logarithms

- Natural log (base e): \`log 20\` → 2.9957 (\`loge\` is the same)
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

Incorrect: \`ln 100\`
Result: errors (no result — \`ln\` is not recognized)
Correct: \`log 100\` or \`loge 100\` → 4.6052
Why: the natural-log keyword is \`log\` / \`loge\`, not \`ln\`. Also note \`log\` is
base **e**, not base 10 — for base 10 use \`log10\`.

Incorrect: \`-log10 0.00001\`
Result: errors
Correct: \`log10 0.00001\` → -5 (negate separately if you need pH = 5)
Why: a leading \`-\` placed directly on a prefix function doesn't parse — compute
the log first.
`;

export default logarithm;
