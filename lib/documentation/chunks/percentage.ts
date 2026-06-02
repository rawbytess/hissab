export const percentage = `
## Percentage

Percent operations work both as standalone postfix (\`30%\`) and in idiomatic
phrases like "X% of Y" or "X% of what is Y".

### Forms

- Standalone: \`5%\` → 0.05
- Percent of a value: \`25% of 200\` → 50
- Add percent (markup): \`200 + 20%\` → 240, or \`873 + 78%\`
- Subtract percent (discount): \`2478 - 30%\` → 1,734.6, or \`5% off 10\` → 9.5
- Reverse percent ("find the total"): \`33% of what is 3000\` → 9,090.9091
- With a unit: \`20% of 100 meters\` → 20 meter

### Examples

User: what's 15% off 240?
Expression: \`240 - 15%\` → 204

User: 200 plus 8% sales tax
Expression: \`200 + 8%\` → 216

User: 33% of some number is 3000 — what's the number?
Expression: \`33% of what is 3000\` → 9,090.9091

### Common mistakes

Incorrect: \`10% + 50\` (expecting \`0.10 + 50\`)
Result: \`55\` (no error — read as "10% of 50, added to 50")
Correct: \`0.1 + 50\` → 50.1 (write the decimal if you mean a literal 0.10)
Why: in \`X% + Y\` / \`X% - Y\`, the percent is applied to the other operand, not
treated as the bare fraction 0.10.

Incorrect: \`25 is what percent of 200\` (as one expression)
Result: errors (no result — \`is\`/\`what\`/\`percent\` aren't recognized, and
unrecognized words are not dropped); there is no "what percent" keyword
Correct: \`25 / 200 * 100\` → 12.5
Why: Hissab has \`% of\` and \`% of what is\`, but no direct
"X is what percent of Y" form — compute it as a ratio.
`;

export default percentage;
