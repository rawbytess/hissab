export const arithmetic = `
## Arithmetic

Plain numeric math. No special configuration needed.

### Operators

- Addition: \`13 + 44 + 23 + 5645.43\`
- Subtraction: \`100 - 25\`
- Multiplication: \`10 * 5\`
- Division: \`100 / 5\`
- Power: \`10 ^ 5\`
- Square root: \`sqrt(144)\` or \`sqrt 144\` → 12 (a negative gives an imaginary
  root: \`sqrt(-4)\` → 2i)
- Other roots (via fractional exponent): \`256 ^ (1/8)\`
- Factorial: \`5!\`
- Modulo: \`10 mod 7\`
- Modular power: \`powmod(7, 222, 1000)\` → 49 (base^exponent mod m, fast for any
  exponent size)
- Absolute value: \`abs(-234)\`

### Rounding

\`floor\` (down), \`ceil\` (up) and \`round\` (nearest, halves away from zero) take
an optional number of decimal places; a negative count rounds to tens, hundreds, …
The unit is kept.

- \`floor(7.5)\` → 7, \`ceil(7.2)\` → 8, \`round(2.5)\` → 3, \`round(-2.5)\` → -3
- \`round(3.14159, 2)\` → 3.14, \`round(1234567, -3)\` → 1,235,000
- \`floor(12.7 meter)\` → 12 meter

### Exact whole numbers

Whole numbers you write out, and \`+ - * ^ ! mod perm comb gcd lcm abs\` on them,
stay **exact at any size**: \`2^100\` → 1,267,650,600,228,229,401,496,703,205,376,
\`(2^60 + 1) - 2^60\` → 1, \`7^222 mod 1000\` → 49. Results up to 100 digits are
shown in full. Anything with a fraction (\`2^100 / 3\`, \`2^0.5\`) is a regular
floating-point number (about 15 significant digits), displayed to 4 decimal places.

### Precedence

Lower number = binds tighter. Use parentheses when in doubt.

1. \`!\` (postfix factorial), \`%\` (postfix percent)
2. \`^\` (power)
3. \`*\`, \`/\`, \`mod\`
4. \`+\`, \`-\`

A prefix function (\`sqrt\`, \`log\`, \`sin\`, …) applies to the value right after it:
\`sqrt 16 + 9\` = 13. Use parentheses for more: \`sqrt(16 + 9)\` = 5.

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

User: square root of 2
Expression: \`sqrt(2)\` → 1.4142

User: round pi to 2 decimal places
Expression: \`round(pi, 2)\` → 3.14

User: last three digits of 7^222
Expression: \`powmod(7, 222, 1000)\` → 49 (or \`7^222 mod 1000\`)

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
