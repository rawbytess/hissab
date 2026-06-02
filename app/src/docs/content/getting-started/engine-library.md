# Hissab engine library

Use the Hissab engine when you want **deterministic expression evaluation**
inside your own TypeScript or JavaScript app.

## Install

```sh
npm install @rawbytes/hissab
```

The package exposes an **async API** because some expression types, such as date
and timezone handling, may require asynchronous work.

## Quick start

Use `calculate` when you have one expression and want Hissab to lex, parse, and
format the result in a single call.

```ts
import { calculate } from "@rawbytes/hissab";

const answer = await calculate("15 kilometers to miles");

console.log(answer.result);
console.log(answer.resultToken);
```

The returned object includes:

- **`result`** — formatted text for display.
- **`resultToken`** — the parsed token for code that needs structured access.
- **`meta.variableName`** — the assigned label name when the expression creates one.

```ts
const assigned = await calculate("distance = 15 kilometers");

console.log(assigned.meta.variableName); // "distance"
```

## Evaluate with shared variables

Pass a shared `Variables` object when multiple expressions should build on
earlier labels.

```ts
import { calculate, type Variables } from "@rawbytes/hissab";

const variables: Variables = {};

const distance = await calculate("distance = 15 kilometers", {
  variables,
  lineNumber: 1,
});
variables[distance.meta.variableName] = distance.resultToken;

const miles = await calculate("distance to miles", {
  variables,
  lineNumber: 2,
});

console.log(miles.result);
```

Use the same pattern for notebook-like workflows, scripts, and multi-step agent
tools. **Store labelled results after each successful expression**, then pass the
same variable map to later calls.

## Lower-level parsing

Use `doLex` and `doParse` when you need token access, custom batching, or
control over when variables are saved.

```ts
import { doLex, doParse, type Variables } from "@rawbytes/hissab";

const variables: Variables = {};

const tokens = doLex("subtotal = 240 - 15%", variables, 1);
const subtotal = await doParse(tokens);

variables[subtotal.meta.variableName] = subtotal.resultToken;

const finalTokens = doLex("subtotal + 18", variables, 2);
const final = await doParse(finalTokens);

console.log(final.result);
```

`doLex` converts an expression string into tokens. `doParse` evaluates those
tokens and returns the same result shape as `calculate`.

## Handle errors

Invalid expressions throw **`UserError`**. Catch it when you want to show
user-facing validation feedback.

```ts
import { calculate, UserError } from "@rawbytes/hissab";

try {
  await calculate("10 meter to kilogram");
} catch (error) {
  if (error instanceof UserError) {
    console.error(error.message);
  } else {
    throw error;
  }
}
```

:::note

Hissab is **intentionally strict**. Unknown words, misspelled units, and
unsupported operations fail instead of being ignored.

:::

## Inspect built-ins

The root export also includes the built-in function, operator, and unit catalogs.

```ts
import { Functions, Operators, Units } from "@rawbytes/hissab";

console.log(Functions);
console.log(Operators);
console.log(Units);
```

These are useful for autocomplete, help panels, validation UIs, and agent tool
descriptions.

## Practical notes

- **Send expression text, not full questions** — use `10 + 10`, not `what is 10 + 10`.
- **One expression per call** unless your wrapper is explicitly batching lines.
- **Use `lineNumber`** when showing errors from multi-line editors or scripts.
- **Dates** use formats such as `2020.08.07` or `7 aug 2020`; dashes and slashes are arithmetic operators.
- **Currency conversion is not built in** — fetch or provide the exchange rate, then calculate with the literal rate.
