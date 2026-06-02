export const set_operations = `
## Set operations

Functions over a list of arguments (max, min, lcm, gcd) and combinatorics
operators (perm, comb).

### Forms

- Maximum: \`max(10m, 30k, 7.7m, 123123121234)\`
- Minimum: \`min(10m, 30k, 7.7m, 123123121234)\`
- Least common multiple: \`lcm(12, 15, 18, 25)\`
- Greatest common divisor: \`gcd(12, 15, 18, 25)\`
- Permutation: \`10 perm 3\` → 720
- Combination: \`10 comb 3\` → 120

### Examples

User: how many ways can I pick 3 people from 10
Expression: \`10 comb 3\` → 120

User: how many ways to pick a captain, pitcher and shortstop from 10
Expression: \`10 perm 3\` → 720

User: largest of 10 million, 30k, 7.7 million, 123123121234
Expression: \`max(10m, 30k, 7.7m, 123123121234)\`

User: smallest unit among 12 meters, 20 km, 12 miles
Expression: \`min(12 meters, 20 kms, 12 miles)\` → 12 meters

### Common mistakes

Incorrect: \`max 1, 2\`
Result: errors
Correct: \`max(1, 2)\` → 2
Why: max/min/lcm/gcd are **functions** — arguments must be inside parentheses,
comma-separated. (perm/comb are the exceptions: they're infix, e.g. \`10 perm 3\`.)

### Notes

- \`k\`, \`m\`, \`b\` after a number are the thousand / million / billion shortcuts
  (\`30k\` = 30,000; \`7.7m\` = 7,700,000).
- \`perm\` / \`comb\` work only on non-negative integers where \`n >= r >= 0\`.
`;

export default set_operations;
