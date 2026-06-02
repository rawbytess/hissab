# @rawbytes/hissab

Hissab's TypeScript calculation engine. It lexes natural-language-ish math
expressions, parses them, and returns formatted results with token metadata.

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
- `TokenBaseType`
- `tokenFactory`
- `Functions`
- `Operators`
- `Units`
- Types: `CalculateOptions`, `ParseResult`, `parseResultIf`, `TokenType`,
  `Variables`
