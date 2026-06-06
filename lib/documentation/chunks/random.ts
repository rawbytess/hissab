export const random = `
## Random values

Generate random numbers, ids, and choices. Function names are matched
case-insensitively.

### Functions

- \`random()\` — a real number in [0, 1).
- \`random(max)\` — a whole number from 0 to \`max\` (inclusive). \`random(6)\` → a
  value in 0..6.
- \`random(min, max)\` — a whole number from \`min\` to \`max\` (inclusive).
  \`random(1, 6)\` → a dice roll; \`random(10, 100)\` → a number between 10 and 100.
  Non-integer bounds give a real number in [min, max): \`random(0, 1.5)\`.
- \`uuid()\` — a UUID. Defaults to version 7 (time-ordered, RFC 9562), e.g.
  \`0191c3e4-...\`. \`uuid(4)\` returns a classic random v4 UUID; \`uuid(7)\` is v7
  explicitly.
- \`nanoid()\` — a 21-character URL-safe random id (e.g. \`V1StGXR8_Z5jdHi6B-myT\`).
  \`nanoid(n)\` sets the length: \`nanoid(10)\`.
- \`coin()\` — \`"heads"\` or \`"tails"\`.
- \`randombool()\` — \`true\` or \`false\`.
- \`pick(a, b, c, ...)\` — one of the arguments chosen at random. Works with text
  (\`pick("rock", "paper", "scissors")\`) or numbers (\`pick(10, 20, 30)\`).
- \`randomcolor()\` — a random colour (rendered as a swatch in the app).

\`random\` returns a plain number, so it composes with the rest of an expression
(\`5 + random(1, 6)\`, \`random(1, 100) / 2\`). \`uuid()\`, \`nanoid()\`, \`coin()\`, and a
text \`pick(...)\` return text.

### Examples

User: roll a six-sided die
Expression: \`random(1, 6)\`

User: pick a number between 10 and 100
Expression: \`random(10, 100)\`

User: give me a random id
Expression: \`uuid()\`

User: a short url-friendly id
Expression: \`nanoid()\`

User: flip a coin
Expression: \`coin()\`

User: choose one of these for me
Expression: \`pick("rock", "paper", "scissors")\`

User: a random percentage
Expression: \`random(100) %\`

### Stable values in the app (managed seed)

The app re-evaluates every line as you type. To stop a random value from changing
on every keystroke, the editor **freezes** it the first time the line evaluates by
attaching a hidden seed to the call. The seed lives in the saved text — so the
value stays the same across edits, reloads, and copy/paste — but it isn't shown:
the call still reads as \`random(10, 100)\`. Hover the function name to reveal the
seed and **re-roll** it for a fresh value. You don't manage the seed yourself.

Outside the app (the CLI / one-shot evaluation), these functions draw fresh
entropy on every run (numbers via the system RNG, \`nanoid\`/unseeded \`uuid\` via a
cryptographically secure source), which is the expected behaviour there.

### Notes

- Bounds are evaluated first, so expressions work directly: \`random(1, 2^4)\`.
- \`random(min, max)\` with \`min > max\` is accepted; the bounds are swapped.
- Text results (a \`uuid()\`, \`nanoid()\`, \`coin()\`, or text \`pick\`) can't be fed
  back into further arithmetic in the same expression.
`;

export default random;
