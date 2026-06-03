export const symbolic = `
## Symbolic algebra

Work with free variables instead of just numbers. When an expression contains a
symbol, Hissab keeps it symbolic — it collects like terms and returns a
simplified algebraic expression rather than a single number.

### Symbols

- The recognised free variables are \`x\`, \`y\`, \`z\`. Any other identifier is still
  treated as an unknown word and makes the expression error (Hissab never
  silently invents variables).
- **Implicit multiplication** works between a number and a symbol and between
  bracketed groups: \`2x\` means \`2*x\`, \`(x+1)*(x+2)\` expands. Two letters written
  with no space or operator (\`xy\`) are read as one unknown word, not \`x*y\` — write
  \`x*y\` or \`x y\` (with a space) instead.
- Powers use \`^\`: \`x^2\`, \`3x^3\`. Parenthesise fractional/!negative exponents as
  usual.

### Simplify (collect like terms)

A bare expression with symbols is simplified automatically; \`simplify(...)\` is the
explicit form. The result is a canonical polynomial ordered by descending degree.

\`\`\`
12 + 2x^2 - 4x^2 - 2     → -2x^2 + 10
3x - 10y + 13z           → 3x - 10y + 13z
(x + 2)*(x + 3)          → x^2 + 5x + 6
simplify(2x^2 - 4x^2)    → -2x^2
\`\`\`

### Calculus

Hissab computes derivatives, integrals and limits of polynomial and elementary
expressions. The variable to operate on is given as the second argument.

- **Derivative**: \`derivative(2x^2, x)\` (alias \`diff\`) → \`4x\`. Product, power and
  chain rules are supported, including known functions (\`derivative(sin(x), x)\` →
  \`cos(x)\`). With more than one symbol you get the partial derivative w.r.t. the
  named one: \`derivative(x^2*y, x)\` → \`2xy\`.
- **Integral**: \`integrate(2x^2 + 3x + 10, x)\` (alias \`integral\`) →
  \`2/3 x^3 + 3/2 x^2 + 10x\`. Non-integer coefficients are shown as fractions.
  Give bounds for a definite integral: \`integrate(2x^2 + 3x + 10, x, 0, 50)\` →
  \`262750/3\`. The constant of integration is omitted.
- **Limit**: \`limit(4x^2 - 3x + 10, x, 0)\` → \`10\`. Indeterminate \`0/0\` forms are
  handled too: \`limit(sin(x)/x, x, 0)\` → \`1\`.

When a derivative/integral/limit has no closed form, Hissab falls back to a
**numeric estimate** for limits and definite integrals; an indefinite integral
with no elementary antiderivative is left in \`∫ … dx\` form unchanged.

### Examples

User: simplify 12 + 2x^2 - 4x^2 - 2
Expression: \`12 + 2x^2 - 4x^2 - 2\` → -2x^2 + 10

User: expand (x + 1)(x + 1)
Expression: \`(x + 1)*(x + 1)\` → x^2 + 2x + 1

User: differentiate 2x^2 with respect to x
Expression: \`derivative(2x^2, x)\` → 4x

### Notes

- A symbolic result is an algebraic expression, not a plain number, so it can't be
  converted with \`to <unit>\` or fed into unit math.
- **Equation solving** (solving for a variable) is not available yet; calculus
  (derivatives, integrals, limits) is.
- Assignment is unchanged: \`x = 5\` still defines a label named \`x\` (the \`=\` on a
  bare name is assignment, not an equation).
`;

export default symbolic;
