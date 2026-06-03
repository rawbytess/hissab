# Hissab Engine — Architecture & Internals

> **Audience:** This document is written for AI agents (and humans) who need to make changes to the engine. It explains *how* the pieces fit together so you can predict the blast radius of an edit. Pair it with the user-facing syntax docs in `lib/documentation/` at the repo root (base + per-category chunks).

The engine takes a natural-language-ish math expression as a string (`"15 km to miles"`, `"5! + 3^2"`, `"today - 1 feb 1990 to years"`) and returns a formatted result string. It is a pure TS library with no I/O — every consumer (API MCP tool, app editor, CLI, skills) goes through the same entry points.

---

## 1. Pipeline at a glance

```
  raw string
      │
      ▼
   ┌───────┐    array of TokenType
   │ lexer │ ─────────────────────────┐
   └───────┘                          │
      ▲                               ▼
      │                          ┌────────┐    TokenType (tree head)
      │                          │ parser │ ─────────────────────────┐
      │                          └────────┘                          │
      │                               ▲                              ▼
   tokenFactory                       │                         ┌─────────┐
   (used by both                      │                         │  solve  │  (parsetree.solve)
   lexer and parser)                  │                         └─────────┘
                                      │                              │
                                      └──── Operators / Units ◄──────┘ result token
                                            (lookup tables)               │
                                                                          ▼
                                                                     humanize() / getString()
                                                                          │
                                                                          ▼
                                                                    result string
```

### Public entry points (`src/index.ts`)

| Function | Purpose |
| --- | --- |
| `doLex(line, variables?, lineNumber?)` | Run the lexer. Throws `UserError(101)` for empty input. Returns `TokenType[]`. |
| `doParse(tokens)` | Run the parser + solver. Filters out `UndefinedToken` / `StringToken` before parsing. Returns `{ result, resultToken, meta: { variableName } }`. |

Anything you export at the package boundary must be added to the bottom of `src/index.ts` (see existing `Operators`, `Units`, `Functions`, `DateTimeOperands`, `TokenBaseType`, `tokenFactory`, etc.).

The split between `doLex` and `doParse` exists because `lib/calculateExpressions.ts` (in the repo root, shared across `api/` and `app/`) needs to lex a line *before* it can synthesize `total<N>` / `prev<N>` / `line<N>` variables for the next line. **Don't collapse them.**

---

## 2. Tokens — the universal currency

Everything in the engine is a `Token`. `src/tokens/tokens.ts` defines the hierarchy; `src/tokens/token_basetypes.ts` defines the `TokenBaseType` enum and the `TokenType` union.

### Token hierarchy

```
Token (abstract base)
├── NumberToken          numeric literal (any base); carries optional .unit
├── DateToken            wraps a spacetime instance; tracks date/time/timezone fields
├── ColorToken           chroma-js color; .unit is "RGB"|"RGBA"|"HEX"|"HSL"|"NAME"|"NUMBER"
├── UnitToken            unit reference (meter, kilo, usd, …); carries unitdata + factor + dim + siFactor + optional components
├── OperatorToken        binary/unary op (precedence, operands[], shape, func, isRaw)
├── FunctionToken        named function with N args (avg, sum, min, max, ...)
├── ControllerToken      "(", ")", ","  — flow control only, never reaches solve()
├── StringToken          unrecognised word (passed through, filtered before parse)
├── VariableToken        user-defined variable; .valueToken is the resolved token
├── VariableNameToken    LHS of `name = ...` assignment
├── ComplexToken         a + bi; closed numeric domain, rides the eager solver
├── SymbolToken          free variable (x, y, z); flips the expr to symbolic mode
├── ExprToken            terminal carrier wrapping a symbolic `Expr` (AST) result
└── UndefinedToken       lex garbage; filtered out before parse
```

> **Symbolic vs numeric.** `SymbolToken` / `ExprToken` divert the whole expression
> to the symbolic subsystem (see §11) — the eager `solve()` is skipped.
> `ComplexToken` is different: it is a *closed numeric domain*, so it flows through
> the ordinary solver like a number (the `+ - * / ^` operators carry complex
> branches).

### `UnitToken` carries dimensional metadata

Every `UnitToken` — simple (`meter`, `mile`, `gram`) or compound (`m/s`, `N*m^2/kg^2`) — exposes:

- `dim: Record<string, number>` — exponents over the canonical base names (`meter`, `gram`, `second`, `ampere`, `kelvin`, `mole`, `candela`, `bit`, `degree`, `duration`). Simple units derive `dim` from their `UnitTypes` via `dimOfType` (LENGTH → `{meter:1}`, AREA → `{meter:2}`, VOLUME → `{meter:3}`, etc.); derived units (`newton`, `pascal`, …) declare `dim` directly in `Units`.
- `siFactor: number` — multiplier from this unit into its canonical SI product. Computed from `unitdata.factor` plus the per-type adjustment in `baseSiFactor` (VOLUME multiplies by 0.001 to land in m³; explicit-dim units are already canonical). Prefix attachment multiplies both `factor` and `siFactor`.
- `components: UnitAtom[] | null` — non-null only on compounds. Each `UnitAtom = { unit: UnitToken, exponent: number }`. The compound's `dim` and `siFactor` are computed from the atoms (`composeAtomsDim`, `composeAtomsSiFactor`).
- `isCompound: boolean` — true when `components !== null`, or when `dim` has more than one nonzero axis (so named derived units like `newton` also report as compound for the conversion / display short-circuits).

Compatibility between two units is dimensional equality (`dimEquals`), not type equality. Conversion between any dimensionally-equal units becomes a single ratio: `from.siFactor / to.siFactor`.

### Tree structure

`OperatorToken` and `FunctionToken` carry their children directly as named fields — they don't share a `_children` array on the base `Token` class.

- **`OperatorToken`** has `left: TokenType | null`, `right: TokenType | null`, and `more: TokenType[]` (variadic tail for things like `to mile, yard, inch`). Helpers `setLeftChild` / `setRightChild` / `setChild(direction, t)` write the named slots; `getLeftChild()` / `getRightChild()` read them. A `children` getter returns the sparse `[left, right, ...more]` view so legacy raw funcs that destructure `[_, n1]` (e.g. trig, `~`) keep working — `right` always lands at index 1 even if `left` is null.
- **`FunctionToken`** has `args: TokenType[]`. `insertChild(token)` pushes; `getChildrenValues()` extracts numeric values for non-raw funcs.

Both expose a uniform `clearChildren()` that the solver calls before grafting the result token into the parent slot.

### Why `tokenFactory` is the choke point

`src/tokens/token_factory.ts` is where strings become typed tokens. The lexer calls it once per emitted token; the parser also uses it (to synthesise things like an implicit `+` between adjacent numbers, or a `radian` unit for `sin/cos`). It does a lot more than instantiate classes.

The top-level `tokenFactory()` is a thin dispatcher; the actual work lives in named pipeline stages — `buildNumber`, `buildDate` / `buildMonth`, `buildTime`, `buildString`, `buildUnit`, `makeOperator`, `prefixUnits`, `multiWords`. Each stage handles one `TokenBaseType` (or one sub-case of `STRING`), so finding the right entry point for a new keyword is usually obvious from the dispatcher.

What that machinery does, regardless of stage:

- **Look-back into `tokens[]`**: if the previous token can absorb this one, it pops the previous and returns a merged token. This is how `2020 jan` becomes a single `DateToken`, how `5 kilo meter` collapses `kilo` (POSTFIX) into the `meter` UnitToken's `prefix` + multiplies factors, and how `3 pm` attaches the meridian to the preceding hour.
- **Synonym & plural normalisation**: pluralises trim, then `Synonyms` rewrites the *value* and (sometimes) the `basetype`. Most synonym entries are bare strings that default to `TokenBaseType.STRING` — only the handful that change basetype (e.g. `times` → `*` as `SYMBOL`) are written as `{ value, basetype }` objects. For example `in` → `to` (STRING), `kg` → `kilo gram` (STRING, which then re-enters tokenFactory via `prefixUnits`).
- **`sq` / `cu` rewrite**: `^(sq )` → `square ` and `^(cu )` → `cubic ` *before* the unit lookup.
- **Multi-word splitting**: if the token has spaces and isn't a known unit/function/etc., `multiWords` recursively tries the longest prefix until something matches, then continues with the tail. This is how `harmonic mean` is recognised but `random words` falls back to `StringToken` / `UndefinedToken`.
- **Constants**: `pi` and `e` (from `Constants` in `unit_types.ts`) are emitted as `NumberToken`s, not units.
- **`prefixUnits`**: handles `kilometer`, `nanosecond`, `gigabyte` etc. by walking a list of known prefixes and re-tokenising the head and tail. Sets `factor *= prefix.factor` (or `datafactor` for DATA units).
- **Variables**: if `value in variables`, returns a `VariableToken` wrapping the underlying token.
- **Timezones**: `timezone-soft` resolves city/timezone names; if `prevToken` is a `DateToken`, sets its timezone instead of returning a new token.
- **Colors**: `chroma.valid(value)` recognises named CSS colors.

> **Important:** When you add a new keyword, decide whether it should be looked up by **value** (add to `Operators` / `Units` / `Functions` / `Synonyms`) or whether it needs special-case logic in `tokenFactory`. Prefer the lookup tables — they compose with synonyms and plurals automatically.

---

## 3. Lexer — character → token stream

`src/lexer/lexer.ts` is a state machine. The driver loop in `lexer(line, variables, lineNumber)` walks the string character by character and dispatches on character class:

| Character class | Method called on current state |
| --- | --- |
| `0-9` | `handleNumber(tokens, char)` |
| `a-zA-Z_` | `handleString(tokens, char)` |
| `!%^&*()-+=~{}[]\|/<>,:.#'"` | `handleSymbol(tokens, char)` |
| whitespace (`\s`) | `handleWhiteSpace(tokens, char)` |
| currency symbols (`$€£¥…`) | **skipped** (currency uses ISO codes; see `usd` / `eur` units) |
| anything else | `handleUndefined(tokens, char)` |

Each handler returns the next state. After the loop, `tokens.flushToken()` emits any pending buffer.

### States (`src/lexer/lexer_states.ts`)

All states extend `LexerStates`, which provides default behaviours; individual states override the parts that differ.

- **FreshState** — starting state. Number `0` → `ZeroState` (to look for `0b` / `0o` / `0x` prefix); other digit → `DecimalState`.
- **ZeroState** — saw a leading `0`. Looking for `B`/`O`/`X` (case-insensitive) to enter a numeric base. `.` → `DecimalState`. Anything else flushes and falls through.
- **BinaryState / OctalState / HexState** — accumulate digits valid for that base; any invalid char makes the whole token `UNDEFINED`.
- **DecimalState** — accumulating a decimal number. `.` toggles `tokens.float`:
  - first `.` → still decimal
  - second `.` → switch to `DateState` (this is how `07.08.2020` is recognised as a date during lex)
  - third `.` → undefined
  - `:` → `TimeState`
  - `'` / `"` are short-hand units (feet/inch via `Synonyms`)
- **DateState** — collecting `dd.mm.yyyy` (or similar) numeric date.
- **TimeState** — collecting `hh:mm:ss:ms`.
- **StringState** — collecting an identifier. Spaces stay in the buffer (`multiWord = true`) so multi-word units/functions can resolve. `=` is special: it flushes as `VARIABLENAME`.
- **SymbolState** — collecting a multi-char symbol (`**`, `>>`, `<<`, `>`, `<`, `*`). `isMultiSymbol` in `tokens.ts` lists the set.
- **ColorState** — entered from `#`; accumulates up to 8 hex chars (RGBA), longer → undefined.
- **UndefinedState** — sticky garbage state.

### The `Tokens` accumulator (`src/lexer/lexer_tokens.ts`)

`Tokens` is a tiny class that holds:
- `thetoken: string` — the chars accumulated for the current token
- `tokentype: TokenBaseType` — what kind of token we think it is
- `float: number` — how many `.` we've seen (decimal vs date disambiguation)
- `multiWord: boolean` — did we accumulate a space-separated word?
- `tokens: TokenType[]` — emitted tokens so far
- `variables: Variables`, `lineNumber: number` — passed through to `tokenFactory`

`flushToken(type?)` is the only emit path. It calls `tokenFactory(...)` and pushes the result; `tokenFactory` may pop previous tokens (date assembly, prefix absorption, etc.) so don't assume `tokens.length` only grows.

> **Gotcha:** lexer states don't decide the *final* token type alone. They set `tokentype` and accumulate chars; `tokenFactory` then re-interprets the buffer against `Operators`, `Units`, `Functions`, `Synonyms`, etc. A change to keyword tables affects lex output without touching `lexer_states.ts`.

---

## 4. Parser — token stream → expression tree

`src/parser/parser.ts` is also a state machine, but it iterates over the token array (with recursion for brackets). Each iteration picks a state-handler based on the *current token's class*:

| Token class | Method dispatched |
| --- | --- |
| `NumberToken` | `handleOperand` |
| `StringToken` / `VariableNameToken` | `handleString` |
| `DateToken` | `handleDate` |
| `ColorToken` | `handleColor` |
| `OperatorToken` | `handleOperator` |
| `FunctionToken` | `handleFunction` |
| `UnitToken` | `handleUnit` |
| `ControllerToken` | handled inline (see brackets below) |
| `VariableToken` | unwrapped to `valueToken` *before* dispatch |

### States (`src/parser/parser_states.ts`)

| State | When it's active | Accepts |
| --- | --- | --- |
| `FreshParseState` | Nothing parsed yet | operand, unary `-`, prefix-only operator (`sin`, `~`, etc.), function, city unit |
| `NeedNumberState` | Just consumed a prefix or binary operator awaiting RHS | operand, unary `-`, another prefix operator, function |
| `NeedUnitState` | Just consumed `to`, awaiting a unit | unit only |
| `FunctionState` | Inside a function call, collecting args | operand (via `insertChild`), color |
| `PreNumberState` | After unary `-` | the number itself (negated) |
| `CombineNumberState` | After a `,` between numeric operands (digit grouping) | next digit chunk — concatenates them into a single number string |
| `CompleteState` | Just finished an operand/sub-expression | binary operator, additional operand (implicit `+`), unit (assigned to head number) |

The state classes are referenced by identity in `parser.ts` (`if (parseState === FreshParseState) ...`) — there is no `instanceName` marker. Adding a new state means exporting it from `parser_states.ts` and matching it directly.

### Compound-unit absorption

`CompleteState.handleUnit` and `NeedUnitState.handleUnit` receive `(parseTree, unitToken, tokens, parseIndex)` and return `{ state, advance }`. After attaching the first unit, they call `absorbCompoundUnit(tokens, parseIndex, firstUnit)` which greedily consumes a trailing unit expression: `*<unit>`, `/<unit>`, `^<integer>`, and parenthesised unit groups. The parser loop advances `parseIndex` by the returned `advance` on top of its own `+1`.

The disambiguation rule that lets `*`/`/` stay arithmetic for general expressions: the next token after `*`/`/` must be a `UnitToken` (or a paren group whose first inner token is a unit) for absorption to fire. `5 m * 2` is arithmetic (next is `NumberToken`); `5 m * N` is composition (next is `UnitToken`). `^` always binds to the unit when the LHS is a unit-attached number and the RHS is an integer literal — that's how `9.8 m/s^2` parses as a single literal.

Once a compound is built, `checkCompoundOperands` rejects affine-temperature atoms (anything other than `kelvin`/`rankine`) with `UserError(3908)` and any `CURRENCY` atom with `UserError(3909)`. Same-dim mismatched-scale operands (`5 km + 100 m`) still flow through `ProcessConversions` for eager conversion to `exprUnit`'s scale — the gating is `dimEquals` plus a `sameUnitIdentity` check (`value` + `factor` + `siFactor`) rather than the legacy type equality.

The set of unary-prefix operators that switch an operand-needing state into `PreNumberState` lives in one place: `UNARY_PREFIX_OPS` (and the `isUnaryPrefix(op)` helper) at the top of `parser_states.ts`. Today it contains only `-`. To add another prefix operator, add it to the set rather than scattering `op.value === "..."` checks.

The `OperatorShape` flag set replaces ad-hoc `operands.includes("prenumber")` lookups. Each `OperatorToken` precomputes `shape: { prenumber, postnumber, prestring, postunit }` in its constructor from the operator definition's `operands: string[]`; parser states read `op.shape.prenumber` etc. directly.

### Operator precedence

`CompleteState.handleOperator` is where precedence is enforced. It walks the right spine of the tree, collecting operators onto `opStack`, then pops until it finds one with **strictly lower** precedence than the incoming operator (note: `>=` means new op takes over the slot). The new operator slides into that gap:

- Its **left child** becomes the previous occupant's right child (or the head, if the stack emptied).
- The previous occupant (or `parseTree.head`) is rewired to point at the new operator.

Lower `precedence` number = higher binding. `^` (4) binds tighter than `*` (5) which binds tighter than `+` (6). Postfix operators like `!` (2) and `%` (3) bind tighter than `^`.

> See `Operators` in `src/types/operator_types.ts` for the canonical precedence table. **If you change a precedence, run the engine test suite** — `pnpm -F engine test-single` is the fast loop.

### Brackets and function args

`ControllerToken` of basetype `BRAC_START` triggers a *recursive* `parse(...)` call from the current `parseIndex + 1`. The recursive call returns its computed head token and the index where it stopped (the matching `BRAC_END`). The parent then splices the result back into the token stream as if it were a literal, advances past the `)`, and continues.

For function calls, the parent stays in `FunctionState` and loops, calling `parse` once per comma-separated argument until the recursive call reports `isFunc = false` (i.e. it hit `)` rather than `,`).

Top-level `,` between numbers means digit grouping (`1,234,567`) and switches to `CombineNumberState`.

### `to <unit1>, <unit2>, ...`

The `to` operator (precedence 23 in `operator_types.ts`) is `isRaw: true` and inspects all of its right-side tokens. If multiple `UnitToken`s follow, it collects them into `convertTo: string[]` via `setConvertTo` — this is the multi-unit breakdown (`9234 miles to yards, feet, inches`). See `humanize` in `src/pro.ts` for the consumer.

### The solve phase (`src/parser/parsetree.ts`)

After the loop, `parseTree.solve(head, null, RIGHT)` runs a post-order traversal:

1. Recurse left, recurse right.
2. If the current node is an `OperatorToken` or `FunctionToken`:
   - **Raw op** (`isRaw: true`): call `func(children, exprUnit, setIsExplicit, setConvertTo)` — the func gets the full token children and the ambient unit context.
   - **Non-raw op**: call `func(...getChildrenValues())` with raw numbers, then wrap the result with `tokenFactory` and re-attach `exprUnit`.
3. Clear the operator's children and graft the result token into the parent slot (or replace `parseTree.head` if no parent).

`exprUnit` is the "ambient" unit of the expression — it's set the first time a unit is encountered (e.g. `5 km + 3 km` sets exprUnit to km; the second `km` doesn't need conversion because it matches). When unit types match but values differ (`5 km + 100 m`), `CompleteState.handleUnit` runs `ProcessConversions` to normalise the operand to `exprUnit` *before* solve sees it.

---

## 5. Operators — `src/types/operator_types.ts`

Each operator entry has:

```ts
{
  precedence: number;        // lower = binds tighter
  operands: string[];        // "prenumber" | "postnumber" | "prestring" | "postunit"
  func: any;                 // see isRaw
  isRaw: boolean;            // false → func(...rawNumbers) returns a number
                             // true  → func(children, exprUnit, setIsExplicit, setConvertTo) returns a TokenType
  description: string;       // shown in user-facing docs
}
```

`operands` controls what the parser state machine expects on each side. It's the source of truth; `OperatorToken` derives the `shape: OpShape` flag set from it at construction:

- `prenumber` — needs an operand to the left (binary)
- `postnumber` — needs an operand to the right (binary or prefix unary)
- `prestring` / `postunit` — narrower variants used by `=` and `to`

Postfix-only operators (`!`, `%`, `~`) declare *only* their pre-side, so they reduce immediately in `CompleteState`. Prefix-only operators (trig, log) declare *only* their post-side, so they push the parser into `NeedNumberState`.

Several operator families are registered through helper loops at the bottom of `operator_types.ts` rather than written out one entry at a time — trigonometric (`TRIG` / `ARC_TRIG`), hyperbolic (`HYP`, with optional per-entry `guard` for `acosh` / `atanh` domain checks), and logarithm families. Add a new trig variant by extending those arrays.

`Controllers` (also in this file) maps `(`, `)`, `,` to the `ControllerToken` basetype strings used by `parser.ts`.

### Raw vs non-raw — when to use which

- Use **non-raw** for pure number→number math (`mod`, `tanh`, `loge`, etc.). Concise and the engine handles unit propagation for you.
- Use **raw** when you need:
  - access to non-number operands (dates, colors, units),
  - the ambient `exprUnit` (e.g. `+` adds with unit awareness),
  - the ability to set `isExplicit = true` (suppresses `humanize` in favour of `getString`),
  - the ability to set `convertTo` (multi-unit breakdown),
  - more than 2 operands (`to a, b, c`).

The raw `+` / `-` implementations live on the operand token classes themselves (`NumberToken.add`, `DateToken.subtract`, etc.). This is where polymorphism lives: number+date, color+number, etc., dispatch via `instanceof` checks inside the operator's raw func.

`*` and `/` are also **raw** — `makeMulDivFunc` in `operator_types.ts` runs `composeUnits` (in `tokens/compound.ts`) over the two operand units and merges atoms by name. When the composed dimension is empty (every axis cancels — e.g., `5 km / 2 m`), the residual `siFactor` ratio is folded into the numeric value and the result is a plain number. When a single atom with exponent 1 remains, the result keeps that simple unit; otherwise the result is a freshly-built compound `UnitToken`.

`^` / `**` are **raw** (`makePowFunc`). The numeric path reproduces the old behaviour exactly — `base ** exp`, keeping the base's number base and the ambient `exprUnit`, so `2^6 → 64` and `(5 m) ^ 2 → 25 m` (the unit-on-power case `5 m^2` is still handled by the parser's compound absorption, not the operator). The raw form exists so a complex base/exponent can route to `cxPow`. `^` was non-raw historically; it became raw only to thread complex numbers through.

---

## 6. Units — `src/types/unit_types.ts` and friends

`Units: UnitsIF` is a flat map keyed by canonical unit name. Each entry has a `UnitTypes` (`LENGTH | TEMPERATURE | WEIGHT | ... | POSTFIX | CURRENCY | FUNCTION`) and a `factor` plus, for linear families, a `factors: { [otherUnit]: number }` map of hand-tuned pairwise conversion ratios.

### Conversion strategy

`src/units_processor.ts` (`ProcessConversions`) handles `<token>.to(<unit>).convert()`. It tries paths in order:

1. **Function targets** (`hex`, `binary`, `rgb color`, `epoch`, `human date`, …) — invoke `toUnit.unitdata.func(token)`.
2. **POSTFIX target** (`kilo`, `milli`, …) — divide by `toUnit.factor`.
3. **CITY target** on a `DateToken` — shift the spacetime to the new IANA zone.
4. **Compound / cross-type via dim** — if either side is compound, or both sides share a dimensional signature but live in different `UnitTypes` (e.g., `m^2 → square meter`), require `dimEquals(from.dim, to.dim)` and apply `from.siFactor / to.siFactor`. Same-name-different-prefix pairs in the same family (`km → m`) and same-name same-family pairs still flow through path 6 for precision.
5. **TEMPERATURE** (same-type) — dispatch via the `unitdata[<toUnit.value>]` lambda on the *from* unit (affine; not composable).
6. **Same-type linear** — `value * linearFactor(from.value, to.value) * (from.factor / to.factor)`. `linearFactor` prefers the hand-tuned `Units[from].factors[to]` entry (precise) and falls back to deriving from each family's canonical SI base in `BASE_UNIT_BY_TYPE` (meter / square meter / liter / gram / degree / bit / second / secondly / kelvin / ampere / mole / candela).

`humanize` in `pro.ts` short-circuits when the result's unit is compound and no explicit `convertTo` was set — there's no meaningful multi-component breakdown for compounds; the user can request one via `to`. For simple-unit results, `humanize` still walks the unit's `convertTo` family using `getFactor` (which calls `linearFactor`).

The full conversion paths:

- **POSTFIX target** (`kilo`, `mega`, etc.): divide value by `toUnit.factor`. Used by `to milli`, `to kilo` for plain numbers.
- **FUNCTION target** (`hex`, `binary`, `rgb color`, `epoch`, `human date`, …): invoke `toUnit.unitdata.func(token)`. These are conversion targets that are really transformations.
- **CITY target** on a `DateToken`: shift the spacetime to the new IANA zone.
- **TEMPERATURE**: dispatch via the `unitdata[<toUnit.value>]` lambda on the *from* unit (`celsius.fahrenheit`, etc.). Lambdas stay because the math is affine, not linear.
- **Otherwise** (LENGTH, WEIGHT, VOLUME, …): `value * linearFactor(fromUnit.value, toUnit.value) * (fromUnitToken.factor / toUnitToken.factor)`. The second ratio handles prefix multipliers (`kilo meter` → 1000).

Mismatched `unitdata.type` throws `UserError(3907)`. Currencies need network data and are wired up elsewhere (the engine ships the type tag; the API layer fills in factors).

### `convertTo` (auto-breakdown)

`Units[<unit>].convertTo` is a list of *other* unit names used by `humanize` when the result has no explicit `to`. `meter` has `convertTo: metricFamily` (`["kilo", "_", "centi", "milli", "micro", "nano"]`) so a meter-typed result is automatically broken down into the most appropriate metric prefix. `acre` has `convertTo: areaFamily`. This is *display only* — the underlying value isn't changed.

The `_` POSTFIX entry is the identity prefix; it has `factor: 1` and renders without a suffix.

### Prefixes

POSTFIX-type units (kilo, mega, milli, …) are *not* standalone results. The lexer/parser will:

1. In `tokenFactory`, when a POSTFIX precedes another unit (`kilo meter`), absorb the POSTFIX into the unit's `.prefix` and multiply `factor` (or `datafactor` for DATA units).
2. In `CompleteState.handleUnit` of the parser, when a POSTFIX follows a bare number, multiply the number by the postfix factor and discard the unit. This is how `5 million` becomes `5000000` without a unit.

DATA units use `datafactor` (1024-based) instead of `factor` (1000-based) when the prefix attaches to a byte/bit. That's why `1 kilobyte = 1024 bytes` but `1 kilometer = 1000 meters`.

### Synonyms & plurals

`src/types/synonyms.ts` rewrites a token's `value` (and sometimes `basetype`) *before* the unit/operator/function lookup. Most entries are bare strings (`"kg": "kilo gram"`) and default to `TokenBaseType.STRING`; only the few that need a different basetype (e.g. `times` → `*` as `SYMBOL`) are spelled out as `{ value, basetype }` objects. The module normalises both shapes to the resolved object form at load time so consumers can read `Synonyms[key].value` / `.basetype` uniformly.

`src/types/plurals.ts` exports a `Set<string>` of known plurals; matching values get the trailing `s` stripped. It is *built at module load* by reading every `Units[u].plural` field, then generating SI-prefix concatenations for the prefixable bases (`meter`, `liter`, `gram`, `second` get the full prefix range; `bit`, `byte` get the binary-data range), then unioning a small `OVERRIDES` list for irregulars and aliases (`lbs`, `kms`, `hrs`, etc.). Adding a regular plural is a one-line edit on the unit entry; adding an irregular is a one-line edit to `OVERRIDES`.

Both are applied in `tokenFactory`'s `buildString` stage. Adding a new alias is almost always a one-line edit, not a code change.

---

## 7. Variables and multi-line semantics

The engine itself only knows about variables via the `variables` parameter to `doLex` — a `{ [name]: TokenType }` map. If a lexed identifier matches a key, `tokenFactory` returns a `VariableToken(name, originalValue, valueToken)`. The parser unwraps `VariableToken` to its `valueToken` before dispatch (`parser.ts` line ~46), so by the time states see it, it's already the resolved underlying token.

**Multi-line semantics** (`total1`, `prev2`, `line3`, `l3`) are *not* in the engine. They live in `lib/calculateExpressions.ts` at the repo root. That file is the contract between the app editor, the API MCP tool, and any other multi-line consumer — if you're adding line-scoped features, do it there.

Note: `tokenFactory` does have a special case where bare `total` and `prev` get suffixed with `lineNumber` (e.g. `total` → `total3`). This lets the consumer inject only the most recent values without having to handle every line number.

---

## 8. Output formatting

Two paths exit `doParse`:

- **Explicit conversion was requested** (`isExplicit === true`, set by the `to` operator's func) — call `result.getString()` directly. The result already has the target unit attached.
- **Implicit / no conversion** — call `humanize(result, convertTo)` from `src/pro.ts`. This walks the unit's `convertTo` family looking for the largest unit where `|value| >= 1` and emits one or more components (`1 km 200 meter`).

`NumberToken.formatResult` handles number-system formatting (binary/octal/hex prefixes), currency locale formatting, and the small/large number heuristics (scientific notation thresholds, fraction digit caps, locale grouping). Edit there if you're touching how plain numbers render.

`DateToken.formatResult` builds a spacetime format string from which date/time fields are actually set on the token (so `2020.08.07` formats without a time portion but `2020.08.07 3pm` includes the meridian).

---

## 9. Error handling

`src/exceptions.ts` defines two error classes:

- `UserError(code)` — the user wrote something the engine can't make sense of. The numeric code is a marker for tracing but isn't surfaced to the user. Throwing this is fine and expected.
- `UnhandledError(code)` — the engine reached a branch it didn't expect. Usually indicates a missing case or an invariant violation; treat as a bug to fix, not a syntax issue.

Consumers wrap `doParse` in `try/catch`. Don't add `try/catch` inside the engine to swallow errors — let them propagate.

---

## 10. Where things live (quick reference)

```
engine/src/
├── index.ts                          # public entry points (doLex, doParse)
├── lexer/
│   ├── lexer.ts                      # state-machine driver loop
│   ├── lexer_states.ts               # all state classes (Fresh, Decimal, String, ...)
│   └── lexer_tokens.ts               # Tokens accumulator class (buffer + flushToken)
├── parser/
│   ├── parser.ts                     # driver loop + bracket recursion
│   ├── parser_states.ts              # state classes (FreshParse, NeedNumber, ...) + isUnaryPrefix
│   └── parsetree.ts                  # ParseTree class + post-order solve()
├── tokens/
│   ├── tokens.ts                     # Token class + all subclasses; OpShape lives here
│   ├── token_basetypes.ts            # TokenBaseType enum, TokenType union
│   └── token_factory.ts              # named pipeline stages: buildNumber/Date/Time/String/Unit + prefixUnits/multiWords
├── types/
│   ├── operator_types.ts             # Operators table + Controllers table; trig/hyp/log generated via helper loops
│   ├── unit_types.ts                 # Units table + Constants + BASE_UNIT_BY_TYPE + linearFactor() helper
│   ├── unit_enum.ts                  # UnitTypes enum
│   ├── synonyms.ts                   # alias map (kg → kilo gram, in → to, …); bare-string entries default to STRING
│   └── plurals.ts                    # plural Set, built from Units[*].plural + SI prefix expansion + OVERRIDES
├── symbolic/                         # symbolic subsystem (see §11)
│   ├── expr.ts                       # Expr AST node types + constructors
│   ├── from_tree.ts                  # parseTreeToExpr: parse tree → Expr bridge
│   ├── polynomial.ts                 # simplify(): canonical polynomial normal form
│   ├── render.ts                     # exprToString(): Expr → display string
│   ├── complex.ts                    # pure complex math over { re, im }
│   └── index.ts                      # public surface of the subsystem
├── function.ts                       # Functions table (avg, sum, min, max, lcm, gcd, simplify, derivative, ...)
├── arithmetic_functions.ts           # factorial / combination / permutation
├── datetime_operands.ts              # now, today, last week, next year, ... → Spacetime (last/next generated from RELATIVE_UNITS)
├── units_processor.ts                # ProcessConversions class (the .to(...).convert() builder)
├── pro.ts                            # humanize() — multi-unit breakdown formatter, uses getFactor/formatComponent helpers
└── exceptions.ts                     # UserError / UnhandledError
```

The user-facing syntax docs live OUTSIDE the engine, in `lib/documentation/` at the repo root:

```
lib/documentation/
├── index.ts                          # public API (baseDocumentation, chunks, getDocumentationChunk, getFullDocumentation)
├── tags.ts                           # OPERATION_TAGS + OperationTag + tagDescriptions
├── base.ts                           # base doc string (basics + catalog of categories)
├── system-instructions.ts            # mcpInstructions + systemInstructions() factory
└── chunks/                           # one .ts per OperationTag: arithmetic, percentage, unit_conversion, compound_units, …
```

---

## 11. Symbolic expressions and complex numbers

The engine is fundamentally an *eager numeric* evaluator: `solve()` collapses every
node to a single value. Two features escape that model.

### Complex numbers (closed numeric domain — stays on the eager path)

`i` lexes to a `ComplexToken(0, 1)` in `tokenFactory.buildString`. Because complex
numbers are closed under `+ - * / ^`, a `ComplexToken` flows through the *normal*
`solve()` like a number:

- `+`/`-` go through the operand classes (`NumberToken.add` promotes a real to
  complex; `ComplexToken.add/subtract` cover the rest); `canAdd`/`canSubtract`
  include `ComplexToken`.
- `*`/`/` (`makeMulDivFunc`) and `^`/`**` (`makePowFunc`) branch to `cxMul`/`cxDiv`/
  `cxPow` (in `symbolic/complex.ts`) when an operand is complex.
- Juxtaposition like `6i` becomes an implicit `*` (see below).

No symbolic AST is involved — the result is just a `ComplexToken`.

### Symbolic algebra (deferred representation — skips the eager path)

A `SymbolToken` (free variable `x`/`y`/`z`, recognised by an exact, post-units
fallback in `buildString`) can't reduce to a number, so the tree is diverted:

1. **`isSymbolic(head)`** (in `parser.ts`) scans the built tree for a `SymbolToken`
   or `ExprToken`. (`ComplexToken` deliberately does *not* count.)
2. If symbolic, `parse()` **skips `solve()`** and instead runs
   `simplify(parseTreeToExpr(head))`, wrapping the canonical `Expr` in an
   `ExprToken`. The numeric path is byte-for-byte unchanged for everything else.
3. `parseTreeToExpr` (`symbolic/from_tree.ts`) translates the operator/function
   tree into the `Expr` AST (`symbolic/expr.ts`). Subtraction/division normalise to
   `+`/`*` with `-1` / `^-1`; unary prefix operators (`sin`, …) become `Func` nodes;
   the keyword functions `simplify` / `derivative` / `integrate` / `limit` build
   their dedicated AST nodes.
4. `simplify` (`symbolic/polynomial.ts`) expands to a **canonical polynomial normal
   form** — a sum of monomials (coefficient × atoms^integer-exp), like terms
   collected, ordered by descending degree. `render` (`symbolic/render.ts`) prints
   it back (`-2x^2 + 10`).

**Implicit multiplication.** Two juxtaposed operands where either side is a
`SymbolToken`/`ComplexToken`/`ExprToken` get an implicit `*` (handled in
`CompleteState.handleOperand`, alongside the existing unit implicit-`+` for
`10 meter 30 cm`). This is how `2x`, `6i`, and `(x+1)*(x+2)` parse. Note the lexer
only splits at a digit→letter boundary, so `2x` works but glued `xy` lexes as one
unknown word (use `x*y` or `x y`).

**Calculus (computed in `symbolic/calculus.ts`).** After `parseTreeToExpr` captures
the tree, `parse()` runs `simplify(evaluate(captured))`: `evaluate` walks the `Expr`
and replaces each `Derivative`/`Integral`/`Limit` node with its computed result —
exact differentiation (power/product/chain rules + a function-derivative table),
power-rule integration + a small antiderivative table (definite via FTC, or
composite-Simpson quadrature when there's no closed form), and limits by continuity
with a two-sided numeric estimate for `0/0` forms. Anything outside that class
degrades gracefully: `evaluate` leaves the original node in place (still rendered as
operator notation) rather than throwing. The resulting `ExprToken` keeps the
pre-evaluation node as `source` so the editor can render the input notation (∫, d/dx)
while the value shows the answer. Non-integer coefficients reconstruct to fractions
at render time (`symbolic/util.ts` `toFraction`; used by `render.ts`/`latex.ts`).

**Scope / what's deferred.** `solve` (equation solving) is still *representation
only* — the `Equation` node is built and rendered but not solved. Bare-equation input
(`2x + 3y = 8`) is not yet parsed because the lexer flushes the token before `=`
as a `VariableNameToken` (which is how assignment `x = 5` keeps working); use the
function forms for now. Natural calculus syntax (`d/dx`, `∫`, `lim x->0`) is deferred —
only the function forms (`derivative(2x^2, x)`) compute.

---

## 12. Common edits — where they belong

| Want to add… | Edit this |
| --- | --- |
| A new alias (`m2` → `square meter`) | `types/synonyms.ts` |
| A new compound alias (`mph` → `mile per hour`) | `types/synonyms.ts` — multi-word expansions that contain `per` are routed through `multiWords` so the parser sees `[<unit>, /, <unit>]` and absorbs them as a compound |
| A new plural | `types/plurals.ts` |
| A new unit in an existing family | `types/unit_types.ts` (give it `factors[BASE]` at minimum so `linearFactor` can resolve it; add pairwise entries on siblings if you want hand-tuned precision instead of derived) |
| A new SI-derived named unit (newton, joule, …) | `types/unit_types.ts` — set an explicit `dim` over the canonical base names (`{gram:1, meter:1, second:-2}` for newton) and a `factor` that converts 1 of the unit into that canonical product |
| A new family of units | `types/unit_enum.ts` (new enum value) + `types/unit_types.ts` (entries + `BASE_UNIT_BY_TYPE` if it has a canonical SI base unit + a case in `dimOfType` if simple units in the family share a dim) + likely `units_processor.ts` if conversion math differs |
| A new operator (binary/unary) | `types/operator_types.ts` |
| A new function (statistical etc.) | `function.ts` |
| A new free-variable symbol | `tokens/token_factory.ts` (the `Symbols` set) — watch for unit collisions |
| Symbolic simplification / a new `Expr` node | `symbolic/` (`expr.ts` node + `from_tree.ts` capture + `polynomial.ts` math + `render.ts` display) |
| Differentiation / integration / limit behaviour | `symbolic/calculus.ts` (`differentiate` / `integrate` / `limitOf`, wired through `evaluate`); coefficient/fraction display in `symbolic/util.ts` |
| Complex-number behaviour | `symbolic/complex.ts` (math) + the complex branches in `types/operator_types.ts` / `tokens.ts` |
| A new "current time" keyword (like `last fortnight`) | `datetime_operands.ts` |
| A new way to recognise something in input | Try synonyms/plurals first. Only touch `tokenFactory` if the recognition needs look-back at previous tokens. Only touch the lexer if it's a new *character* class. |
| Compound-unit absorption rules | `parser/parser_states.ts` (`absorbCompoundUnit`, `parseUnitFactor`, `parseUnitGroupInterior`) |
| Compound-unit composition during arithmetic | `tokens/compound.ts` (`composeUnits`, `scaleUnit`, `mergeAtoms`, `formatCompound`) |
| Change how a result is displayed | `tokens/tokens.ts` (`NumberToken.formatResult` / `DateToken.formatResult` / `ColorToken.getString`) or `pro.ts` (`humanize`) |
| Add a multi-line variable | **Do not** edit the engine — edit `lib/calculateExpressions.ts` at the repo root |
| Update user-facing syntax docs | **Do not** edit the engine — edit `lib/documentation/base.ts` (basics/catalog) or `lib/documentation/chunks/<tag>.ts` (per-category). Run `pnpm sync:skill-docs` to regenerate `skills/*/documentation.md`. |
| Add a new documentation category (`OperationTag`) | `lib/documentation/tags.ts` (add to `OPERATION_TAGS` + `tagDescriptions`), create `lib/documentation/chunks/<tag>.ts`, and wire it into `lib/documentation/index.ts`'s `chunks` map. |

---

## 13. Gotchas worth remembering

- **`tokenFactory` mutates `tokens[]`.** It pops earlier tokens when assembling dates, prefixed units, AM/PM, etc. Don't assume `tokens.length` only grows during lex.
- **Lexer state ≠ final token type.** Lexer state decides character-level grouping; `tokenFactory` decides the final `TokenType` by looking up the string in `Operators` / `Units` / `Functions` / `Synonyms` / `DateTimeOperands` / `Constants`.
- **`StringToken` and `UndefinedToken` are filtered out before parse.** A free-standing word that doesn't match anything gets silently dropped. If the user's expression contains a stray word, it won't error — it'll just be ignored. Be aware when adding new keywords that *every* unknown identifier currently disappears.
- **`Synonyms` can re-route lookups.** `kg` → `kilo gram` re-enters `tokenFactory` with two words, then `multiWords` splits them, then `prefixUnits` merges `kilo` into `gram`. Several layers of indirection can be in play; trace carefully.
- **Precedence semantics: lower number = binds tighter.** `^` (4) binds tighter than `*` (5). Don't get this backwards.
- **Parser brackets recurse.** `parse(tokens, index, func)` returns the `index` it stopped at; the parent then splices the result back as if it were a literal token. This means the same token array is consumed cooperatively — be careful if you ever clone or mutate tokens during parse.
- **Raw operator funcs receive the *children* array.** Non-raw funcs receive *unwrapped numbers* via `getChildrenValues()`. If you write `isRaw: false` but your function expects tokens, it'll silently get numbers. If you write `isRaw: true` but your function expects numbers, you'll get `TokenType[]` and confused arithmetic.
- **`getNumberType()` derives the result base.** When a non-raw op produces a result, `tokenFactory` is called with `currHead.getNumberType()`, which inspects the left/right child types. Mixed-base operations (e.g. `0b101 + 0x10`) will adopt whichever child the helper finds first — usually fine but worth checking when changing operand handling.
- **`^` / `**` are raw now.** They were converted from non-raw to raw to support complex bases/exponents. The numeric branch in `makePowFunc` must keep mirroring the old non-raw behaviour (base's number base via `a.numbertype`, ambient `exprUnit` attached). If you touch power handling, re-run the full suite — `2^6`, `256 ^ (1/8)`, `(5 m)^2` all exercise it.
- **Symbolic operands skip `solve()`.** `parse()` routes any tree containing a `SymbolToken`/`ExprToken` to `simplify(parseTreeToExpr(...))` instead of the numeric solver (see §11). If you add a new operand token, decide whether it is numeric (extend the eager path like `ComplexToken`) or symbolic (extend `isSymbolic` + `parseTreeToExpr`).
- **POSTFIX-type units have two roles**: as standalone multipliers on numbers (`5 million` → `5000000`, unit dropped) and as prefixes on other units (`5 mega byte` → `MB`). The branch is in `CompleteState.handleUnit` (parser) and `tokenFactory` (lexer/factory) respectively.
- **The `=` operator stores the variable name on the result token**, not in some symbol table. The consumer reads `result.variableName` from `parseResultIf.meta` after `doParse`. Persistence across lines is the consumer's job (see `calculateExpressions.ts`).
- **Don't rely on `_children` on `Token`.** It's gone — `OperatorToken` has `left` / `right` / `more`, `FunctionToken` has `args`. The `children` getter on `OperatorToken` returns a *sparse* `[left, right, ...more]` view so legacy destructuring like `([_, n1]) => ...` (used by trig, `~`) still puts the right operand at index 1 when `left` is null. If you write a new raw func, prefer named-field access (`op.right`, `op.left`) over destructuring.
- **The lexer skips `$` and other currency glyphs entirely.** Currency is referenced by ISO code (`usd`, `eur`, …). Any parser-state code that special-cased `value === "$"` has been removed; don't reintroduce it without first making the lexer emit something.
- **`NumberToken.probability` tags a value as a probability.** `P(...)` (and the probability functions in `function.ts`) return a dimensionless `NumberToken` in [0,1] with `.probability = true`. The `~`, `&`, `|`, `xor` operators check this flag and overload onto probability math (`~`→complement, `&`→intersection `a·b`, `|`→union `a+b−a·b`, `xor`→`a+b−2ab`) — the same overloading pattern they use for `IpToken`. Results stay tagged so chains work. Without any tagged operand, those ops stay integer bitwise. There is no `ProbabilityToken`; this is intentionally as lightweight as the `percent` flag.
- **Don't hand-edit `skills/*/documentation.md`** — they're generated from `lib/documentation/base.ts` via `pnpm sync:skill-docs`. The hand-edited syntax docs live in `lib/documentation/` at the repo root (base + per-category chunks under `chunks/`); keep them in sync with operator/unit changes.
- **Compound-unit gotchas:**
  - `m` is a million-multiplier synonym (POSTFIX), not meter. `5 m → 5,000,000`. Compound-unit notation needs the full word (`9.8 meter/second^2`), not `m/s^2`. Other single-letter SI symbols (`N`, `J`, `W`, `Pa`, `Hz`) are wired up because they don't collide with existing aliases.
  - `*` and `/` only absorb into a unit when followed *immediately* by a UnitToken (or unit-only paren group). `5 m * 2` is still arithmetic; `5 m * N` composes the unit.
  - `^<integer>` after a number-with-unit binds to the *unit* (`5 m ^ 2 → 5 m²`). To square the number, use parens: `(5 m) ^ 2 → 25 m`. This is intentional — the parens move the `^` out of the parser's compound-absorption window and into the regular arithmetic operator.
  - Temperature units other than `kelvin`/`rankine` cannot appear in a compound (affine offset breaks composition). `CURRENCY` is also rejected from compounds in v1.
  - Dim cancellation inside `*`/`/` (`5 km / 2 m`) drops the unit and folds the residual `siFactor` ratio into the value. Mixed-base partial cancellation (`60 km/hour * 30 minute`) is NOT auto-simplified — the result is `1,800 kilometer*minute/hour`; the user can `to kilometer` to canonicalise.
  - `baseSiFactor` prefers `data.factors[BASE_UNIT]` over `data.factor` when both exist (e.g., `mile.factor = 1609.3` is the rounded display value but `mile.factors.meter = 1609.344` is the precise SI value).

---

## 14. End-to-end example

Trace `"5 km + 3 miles to feet"`:

1. **Lex.**
   - `5` → `NumberToken("5", DECIMAL)`
   - `km` → via `Synonyms`, becomes `"kilo meter"` → via `multiWords`, `kilo` (UnitToken, POSTFIX) then `meter` (UnitToken, LENGTH) is created; `buildUnit` sees `kilo` as `prevToken` of POSTFIX type, absorbs it as `meter.prefix`, multiplies factor → final emit is `UnitToken("meter", factor=1000)`
   - `+` → `OperatorToken` (precedence 6, raw, prenumber+postnumber; `shape = { prenumber: true, postnumber: true, … }`)
   - `3` → `NumberToken("3", DECIMAL)`
   - `miles` → plural strip → `mile` → `UnitToken("mile", LENGTH)`
   - `to` → `OperatorToken` (precedence 23, raw, prenumber+postunit)
   - `feet` → `UnitToken("feet", LENGTH)`
2. **Parse.**
   - `5` → FreshParse → CompleteState; `parseTree.head = 5`
   - `meter` → CompleteState.handleUnit: attaches to `5`, sets `exprUnit = meter (×1000 due to kilo)`; `5.unit = meter[×1000]`
   - `+` → CompleteState.handleOperator (`shape.prenumber === true`): splices `+` above `5`, NeedNumberState
   - `3` → NeedNumber.handleOperand → CompleteState; `+.right = 3`
   - `mile` → CompleteState.handleUnit: `3.unit = mile`, but `exprUnit` is already meter[×1000]; same type (LENGTH) → `ProcessConversions` runs `linearFactor("mile", "meter")` to convert `3 miles` into meters, updates `3.value` and `3.unit`
   - `to` → CompleteState.handleOperator: splices `to` above the whole `+` subtree, NeedUnitState
   - `feet` → NeedUnit.handleUnit: inserted as child of `to`. CompleteState.
3. **Solve (post-order).**
   - Recurse into `+` first: left = `5 (meter, ×1000)`, right = `3 (now in meters)`. `+` is raw, calls `NumberToken.add` → produces a NumberToken in meters.
   - Then `to`: raw func sees `[sumNumberToken, feetUnitToken]`, calls `ProcessConversions.to(feet).convert()`, sets `isExplicit = true`.
4. **Format.** Because `isExplicit = true`, skip `humanize`, call `result.getString()` → `"21401.04 feet"` (or similar).

That's the whole pipeline. Most engine changes will touch one or two of these stages — keep the others in mind so you don't accidentally break adjacent behaviour.
