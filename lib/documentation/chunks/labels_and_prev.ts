export const labels_and_prev = `
## Labels and prev

Use labels and the \`prev\` keyword to chain related expressions together when
they're evaluated as one batch.

### Labels

Assign a result to a snake_case label using \`=\`:

\`\`\`
monthly_expense = 1000 + 200 - 50
yearly_expense = monthly_expense monthly to yearly
\`\`\`

The label is then usable in any later expression in the same batch. Use
snake_case labels (lowercase letters, digits, underscores; don't start with a
digit) — mixed case works too, but lowercase is the recommended convention.

If you have multiple expressions in a batch and any of them needs to be
referenced later, give every expression that may be referenced an explicit
label. Anonymous lines can still be referred to by \`line<N>\` / \`l<N>\` (see
"Multi-line scope" in the base doc) but explicit labels are clearer.

### prev

\`prev\` is the **immediately previous** result in the batch:

\`\`\`
78 kilometers to miles
prev - 45 miles
\`\`\`

To reach further back than one line, use a label (or \`line<N>\` / \`l<N>\`).

### Examples

User: monthly expense is 1000 + 200 - 50 — what's the yearly expense?
Expressions:
\`\`\`
monthly_expense = 1000 + 200 - 50
yearly_expense = monthly_expense monthly to yearly
\`\`\`

User: convert 78 km to miles, then subtract 45 miles
Expressions:
\`\`\`
78 kilometers to miles
prev - 45 miles
\`\`\`

### Common mistakes

Incorrect: referencing a label before it's defined, e.g. \`total = a + b\` on
the first line when \`a\` and \`b\` were never assigned
Result: errors (an unknown identifier in a value position is not silently
ignored)
Correct: define each label on an earlier line first, then reference it
Why: a label only exists after its \`=\` line. Order matters — assign, then use.

Incorrect: using \`prev\` on the first line of a batch
Result: there is no previous result to point at
Correct: reference \`prev\` only from the second line onward, or use an explicit
label
Why: \`prev\` means "the immediately previous line's result".

### Notes

- Labels live only within one batch — they don't persist between separate
  tool calls.
- \`prev\` always refers to the immediate previous expression; if the previous
  expression errored, \`prev\` will fail too.
- The CLI's REPL keeps a persistent variable scope across lines — labels
  declared there survive until the REPL exits.
`;

export default labels_and_prev;
