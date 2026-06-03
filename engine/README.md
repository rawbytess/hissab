# @rawbytes/hissab

Hissab's TypeScript calculation engine. It lexes natural-language-ish math
expressions, parses them, and returns formatted results with token metadata.
The user-facing syntax reference lives in [`../lib/documentation`](../lib/documentation).

## Install

```sh
npm install @rawbytes/hissab
```

## Quick Start

```ts
import { calculate } from "@rawbytes/hissab";

const result = await calculate("15 kilometers to miles");

console.log(result.result); // "9.3206 miles"
console.log(result.resultToken); // parsed result token
```

Supported expression families include arithmetic, percentages, unit conversion,
compound units, sets/combinatorics, number theory, logarithms, statistics,
probability, finance, trigonometry, dates/times, number systems, bitwise
operations, colors, IP addresses, symbolic algebra, and complex numbers.

## Advanced Usage

Use `doLex` and `doParse` separately when you need to inspect tokens or manage
variables between multiple expressions.

```ts
import {
  doLex,
  doParse,
  type Variables,
} from "@rawbytes/hissab";

const variables: Variables = {};

const assignment = await doParse(doLex("distance = 15 km", variables, 1));
variables[assignment.meta.variableName] = assignment.resultToken;

const converted = await doParse(doLex("distance to miles", variables, 2));
console.log(converted.result);
```

## API

### `calculate(line, options?)`

Runs lexing and parsing in one call.

```ts
type CalculateOptions = {
  variables?: Variables;
  lineNumber?: number;
};
```

Returns:

```ts
type ParseResult = {
  result: string;
  resultToken: TokenType;
  meta: {
    variableName: string;
  };
};
```

### `doLex(line, variables?, lineNumber?)`

Converts an expression string into `TokenType[]`.

### `doParse(tokens)`

Parses and evaluates tokens returned by `doLex`.

### Symbolic helpers

Symbolic and complex expressions evaluate through the same `calculate`,
`doLex`, and `doParse` APIs. The root export also exposes `exprToLatex` and the
symbolic token classes for consumers that need structured rendering.

```ts
import { calculate, exprToLatex } from "@rawbytes/hissab";

const derivative = await calculate("derivative(2x^2, x)");
console.log(derivative.result); // "4x"

const product = await calculate("(2 + 3i) * (1 - i)");
console.log(product.result); // "5 + i"

if ("expr" in derivative.resultToken) {
  console.log(exprToLatex(derivative.resultToken.expr));
}
```

## Errors

Invalid expressions throw `UserError`.

```ts
import { calculate, UserError } from "@rawbytes/hissab";

try {
  await calculate("10 meter to kilogram");
} catch (error) {
  if (error instanceof UserError) {
    console.error(error.message);
  }
}
```

## Exports

The public root export includes:

- `calculate`
- `doLex`
- `doParse`
- `UserError`
- `DateTimeOperands`
- `ComplexToken`
- `ExprToken`
- `SymbolToken`
- `exprToLatex`
- `TokenBaseType`
- `tokenFactory`
- `Functions`
- `Operators`
- `Units`
- Types: `CalculateOptions`, `ParseResult`, `parseResultIf`, `TokenType`,
  `Variables`
