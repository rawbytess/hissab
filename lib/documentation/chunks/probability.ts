export const probability = `
## Probability

Write a probability with \`P(...)\`: \`P(0.1)\` is the probability 0.1. A percentage
works too — \`P(10%)\` is also 0.1. The value must be between 0 and 1; anything
outside that range is an error. Function names are matched case-insensitively, so
\`P(...)\` and \`p(...)\` are the same. A probability is a plain number, so ordinary
arithmetic still applies (\`P(0.3) - P(0.1)\` → 0.2).

### Combining probabilities (independent events)

Use the bitwise operators on probabilities — they switch to probability math when
at least one operand is a \`P(...)\`:

- Complement / NOT: \`~P(0.2)\` → \`0.8\` (i.e. 1 − p).
- Intersection / AND: \`P(0.5) & P(0.3)\` → \`0.15\` (p·q).
- Union / OR: \`P(0.5) | P(0.3)\` → \`0.65\` (p + q − p·q).
- Exactly one (xor): \`P(0.5) xor P(0.3)\` → \`0.5\` (p + q − 2·p·q).

These assume the events are **independent**. \`&\` binds tighter than \`|\`, so
\`P(0.1) | P(0.2) & P(0.5)\` is \`P(0.1) | (P(0.2) & P(0.5))\`. Combinations stay
probabilities, so they chain: \`P(0.2) & P(0.3) & P(0.1)\` → \`0.006\`.

### Functions

- Conditional probability P(A|B) = P(A∩B) / P(B): \`conditional(0.12, 0.3)\` → \`0.4\`.
- Bayes' theorem posterior P(H|E) from a prior, a likelihood P(E|H), and the
  false-positive likelihood P(E|¬H): \`bayes(0.01, 0.9, 0.05)\` → \`0.154\`.
- Odds for a probability: \`odds(0.75)\` → \`3\` (i.e. p / (1 − p), "3 to 1").
- Probability implied by odds: \`probability from odds(3)\` → \`0.75\` (o / (1 + o)).
- Binomial probability of exactly k successes in n independent trials:
  \`binomial(10, 3, 0.5)\` → \`0.117\` (C(n,k)·p^k·(1−p)^(n−k)).
- Expected value of value/probability pairs:
  \`expected value(10, 0.5, 20, 0.5)\` → \`15\`.

### Examples

User: two independent switches fail with probability 0.1 and 0.2 — chance both fail?
Expression: \`P(0.1) & P(0.2)\` → 0.02

User: chance at least one of them fails?
Expression: \`P(0.1) | P(0.2)\` → 0.28

User: a test is 90% sensitive, 5% false-positive rate, disease prevalence 1% — chance of disease given a positive test?
Expression: \`bayes(0.01, 0.9, 0.05)\` → 0.154

User: probability of getting exactly 3 heads in 10 fair coin flips
Expression: \`binomial(10, 3, 0.5)\` → 0.117

User: a bet pays out 100 with probability 0.3 and 0 otherwise — expected payout?
Expression: \`expected value(100, 0.3, 0, 0.7)\` → 30

### Common mistakes

Incorrect: \`P(50)\`
Result: error — 50 is outside [0, 1].
Correct: \`P(50%)\` (or \`P(0.5)\`)
Why: a probability is a fraction between 0 and 1; write a percentage with \`%\`.

Incorrect: \`P(0.5) | P(0.3)\` to mean "P of A given B"
Result: 0.65 — \`|\` is union (OR), not the "given" bar.
Correct: \`conditional(pAandB, pB)\`
Why: conditional probability is a separate function; \`|\` here is set union.

### Notes

- The AND/OR/xor formulas assume **independent** events. For mutually exclusive
  events the union is just \`P(a) + P(b)\` — add them directly instead of using \`|\`.
- If one operand of \`&\`/\`|\`/\`xor\` is a \`P(...)\`, the other is treated as a
  probability too (and must be in [0, 1]). Without any \`P(...)\`, \`&\`/\`|\` stay
  integer bitwise operators.
- Results below 1 are shown to 3 significant figures (so \`binomial(10, 3, 0.5)\`
  prints \`0.117\`, not \`0.1171875\`).
`;

export default probability;
