export const trigonometry = `
## Trigonometry

### Functions

- \`sin\`, \`cos\`, \`tan\`
- \`sec\`, \`csc\`, \`cot\`
- Inverse: \`asin\`, \`acos\`, \`atan\`, \`asec\`, \`acsc\`, \`acot\`
- Hyperbolic: \`sinh\`, \`cosh\`, \`tanh\`, \`sech\`, \`csch\`, \`coth\`
- Inverse hyperbolic: \`asinh\`, \`acosh\`, \`atanh\`, \`asech\`, \`acsch\`, \`acoth\`

### Forms

- Bare value (default unit is **degree**): \`sin 30\` → 0.5, \`tan 45\` → 1
- With explicit angle unit: \`sin 1.5708 radian\` → 1, \`cos 200 grad\` → -1
- Inverse functions return degrees: \`atan 1\` → 45 degree
- Parentheses for clarity: \`sin(30)\`

### Constants

\`pi\` and \`e\` are recognised numeric constants — usable anywhere a number is
expected (\`2 * pi\` → 6.2832, \`e^2\` → 7.3891).

### Examples

User: sin 30 degrees
Expression: \`sin 30\` → 0.5

User: sine of 1.5708 radians
Expression: \`sin 1.5708 radian\` → 1

User: inverse tan of 1 in degrees
Expression: \`atan 1\` → 45 degree

### Common mistakes

Incorrect: \`sin 90\` when you meant 90 radians
Result: \`1\` (no error — bare values are degrees, so this is sin 90°)
Correct: \`sin 90 radian\` → 0.894
Why: with no angle unit, Hissab assumes **degrees**. Override with degree, grad,
radian, arcminute, arcsecond, or turn.

Incorrect: \`sin(pi / 2 radian)\`
Result: errors
Correct: \`sin 1.5708 radian\` → 1
Why: an arithmetic expression (\`pi / 2\`) tagged with an angle unit doesn't
parse. Pass a plain numeric value with the unit.

Incorrect: \`acosh 0.5\`, \`atanh 2\`
Result: errors (out of domain)
Correct: keep inputs in range — acosh needs x ≥ 1; atanh needs |x| < 1.
Why: these inverse-hyperbolic functions are only defined on those domains.
`;

export default trigonometry;
