export const number_theory = `
## Number theory

Tools for fractions, primality, and divisors. Each takes a single number (or any
expression that evaluates to one). Function names are matched case-insensitively,
so \`isPrime(...)\` and \`isprime(...)\` are the same.

### Functions

- Decimal → reduced fraction: \`fraction(0.75)\` → \`3/4\`. Improper fractions stay
  improper (\`fraction(2.5)\` → \`5/2\`); whole numbers render plainly
  (\`fraction(4)\` → \`4\`).
- Decimal → mixed number: \`mixed fraction(2.5)\` → \`2 1/2\`. Proper fractions are
  unchanged (\`mixed fraction(0.75)\` → \`3/4\`).
- Primality test: \`isprime(7)\` → \`true\`. Returns \`false\` for non-integers and
  anything below 2.
- All divisors of a positive integer (ascending): \`factors(12)\` → \`1, 2, 3, 4, 6, 12\`.

### Examples

User: write 0.625 as a fraction
Expression: \`fraction(0.625)\` → 5/8

User: what is 7/3 as a mixed number
Expression: \`mixed fraction(7/3)\` → 2 1/3

User: is 91 a prime number
Expression: \`isprime(91)\` → false

User: list the factors of 28
Expression: \`factors(28)\` → 1, 2, 4, 7, 14, 28

### Notes

- The argument is evaluated first, so a quotient works directly:
  \`fraction(6/8)\` → \`3/4\`.
- \`fraction\` approximates repeating decimals to the nearest simple fraction
  (denominator up to 1,000,000), so \`fraction(1/3)\` → \`1/3\`.
- \`factors\` lists **every** divisor (1 and the number itself included), not the
  prime factorization. It requires a positive integer.
- These results are fractions / lists / booleans, not plain numbers, so they
  can't be fed back into further arithmetic in the same expression.
`;

export default number_theory;
