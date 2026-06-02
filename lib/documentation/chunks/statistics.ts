export const statistics = `
## Statistical functions

All take a comma-separated argument list. Results are numbers (no units).

### Functions

- Average (arithmetic mean): \`avg(99, 34, 65, 213, 45, 123)\` — \`mean(...)\` is identical
- Harmonic mean: \`harmonic mean(99, 34, 65, 213, 45, 123)\`
- Geometric mean: \`geometric mean(99, 34, 65, 213, 45, 123)\`
- Standard deviation: \`standard deviation(99, 34, 65, 213, 45, 123)\`
- Variance: \`variance(99, 34, 65, 213, 45, 123)\`
- Median: \`median(99, 34, 65, 213, 45, 123)\`
- Range (max − min): \`range(99, 34, 65, 213, 45, 123)\`

### Examples

User: average of 70, 80, 90, 100
Expression: \`avg(70, 80, 90, 100)\` → 85

User: median of 2, 4, 4, 6, 8, 10, 10
Expression: \`median(2, 4, 4, 6, 8, 10, 10)\` → 6

User: standard deviation of 2, 4, 4, 6, 8, 10, 10
Expression: \`standard deviation(2, 4, 4, 6, 8, 10, 10)\` → 2.9137

### Common mistakes

Incorrect: \`geomean(8, 12, 15)\`, \`stddev(2, 4, 4)\`
Result: both error (no result — \`geomean\` / \`stddev\` aren't recognized names)
Correct: \`geometric mean(8, 12, 15)\` → 11.2924, \`standard deviation(2, 4, 4)\`
Why: use the **full multi-word names**. Abbreviations like \`geomean\` / \`stddev\`
aren't recognized, and an unrecognized word makes the whole expression invalid.

### Notes

- These are **population** statistics (variance / std deviation divide by N,
  not N − 1). For sample versions, compute manually:
  \`sum((x_i - mean)^2) / (n - 1)\`.
- \`mean\` and \`avg\` are interchangeable for the arithmetic mean; use
  \`harmonic mean\` / \`geometric mean\` for those variants.
`;

export default statistics;
