export const arithmetic = `
## Arithmetic

Plain numeric math. No special configuration needed.

### Operators

- Addition: \`13 + 44 + 23 + 5645.43\`
- Subtraction: \`100 - 25\`
- Multiplication: \`10 * 5\`
- Division: \`100 / 5\`
- Power: \`10 ^ 5\`
- Root (via fractional exponent): \`256 ^ (1/8)\`
- Factorial: \`5!\`
- Modulo: \`10 mod 7\`
- Absolute value: \`abs(-234)\`

### Precedence

Lower number = binds tighter. Use parentheses when in doubt.

1. \`!\` (postfix factorial), \`%\` (postfix percent)
2. \`^\` (power)
3. \`*\`, \`/\`, \`mod\`
4. \`+\`, \`-\`

\`^\` is right-associative, following mathematical convention: \`2^3^2\` is
\`2^(3^2)\` = 512, not \`(2^3)^2\` = 64. All other operators of equal
precedence evaluate left to right.

### Examples

User: 5 squared plus 3 cubed
Expression: \`5^2 + 3^3\` → 52

User: what is 14 + 88/11 * 23.56 - 17
Expression: \`14 + 88/11 * 23.56 - 17\` → 185.48

User: cube root of 27
Expression: \`27 ^ (1/3)\` → 3

User: 8th root of 256
Expression: \`256 ^ (1/8)\` → 2

User: 5 factorial
Expression: \`5!\` → 120

### Common mistakes

Incorrect: \`256 ^ 1/8\`
Result: \`32\` (no error — parsed as \`(256 ^ 1) / 8\`)
Correct: \`256 ^ (1/8)\` → 2
Why: \`^\` binds tighter than \`/\`. Always parenthesize a fractional exponent
when you mean a root (\`5 ^ (1/3)\`, not \`5 ^ 1/3\`).

Incorrect: \`abs -5\`
Result: errors
Correct: \`abs(-5)\` → 5
Why: \`abs\` is a function — its argument must be in parentheses.

Incorrect: \`5 apples + 3 apples\`
Result: errors (no result — \`apples\` is not a known unit)
Correct: \`5 + 3\` → 8 (drop the stray words yourself)
Why: an unrecognized word makes the whole expression invalid rather than being
silently dropped, so strip stray words and verify unit spellings before sending.

Incorrect: \`10 20 30\` (hoping for \`10 + 20 + 30\`)
Result: errors (no result)
Correct: \`10 + 20 + 30\` → 60
Why: numbers written next to each other are only added when a unit is involved
(e.g. \`5 feet 10 inch\`). Put an explicit \`+\` between plain numbers.
`;

export default arithmetic;
