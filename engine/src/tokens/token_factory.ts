import chroma from "chroma-js";
import soft from "timezone-soft";
import DateTimeOperands from "../datetime_operands";
import { UnhandledError } from "../exceptions";
import Functions from "../function";
import { parseIp } from "../ip";
import { Controllers, Operators } from "../types/operator_types";
import Plurals, { IrregularPlurals } from "../types/plurals";
import Synonyms from "../types/synonyms";
import { Constants, Units, UnitTypes } from "../types/unit_types";
import TokenBaseType, { type TokenType } from "./token_basetypes";
import {
  BooleanToken,
  ColorToken,
  ComplexToken,
  ControllerToken,
  DateToken,
  FunctionToken,
  IpToken,
  MatrixToken,
  NumberToken,
  OperatorToken,
  SeedToken,
  StringToken,
  SymbolToken,
  TextToken,
  UndefinedToken,
  UnitToken,
  VariableNameToken,
  type Variables,
  VariableToken,
} from "./tokens";

// Curated free-variable symbols recognised in symbolic expressions. Matched only
// as an exact, whole-token fallback (after units / functions / operators /
// constants / timezones would have claimed the token), so real units and the
// e/pi constants keep priority and the "unknown word = error" guarantee holds
// for every identifier outside this set. `x, y, z` are guaranteed; extend
// deliberately, watching for unit collisions.
const Symbols = new Set(["x", "y", "z"]);

const NUMBER_BASETYPES = new Set<TokenBaseType>([
  TokenBaseType.DECIMAL,
  TokenBaseType.BINARY,
  TokenBaseType.OCTAL,
  TokenBaseType.HEX,
]);

// The look-back contract. tokenFactory may absorb the previous token into the
// one being built (date assembly, AM/PM, unit prefixes, …); this is the ONLY
// sanctioned way to consume from tokens[]. It asserts that the token being
// removed is exactly the one the caller examined, so a future edit can't pop
// blindly after its look-back check has drifted out of sync.
function absorbPrev<T extends TokenType>(tokens: TokenType[], prev: T): T {
  if (tokens[tokens.length - 1] !== prev) throw new UnhandledError(9007);
  tokens.pop();
  return prev;
}

export default function tokenFactory(
  value: string,
  basetype: TokenBaseType,
  tokens: TokenType[] = [],
  variables: Variables = {},
  percent = false,
  lineNumber = 0,
  originalValue = "",
  multiWord = false,
): TokenType | null {
  originalValue = originalValue || value;
  const prevToken = tokens[tokens.length - 1] ?? null;

  if (NUMBER_BASETYPES.has(basetype)) {
    return buildNumber(
      value,
      originalValue,
      basetype,
      percent,
      prevToken,
      tokens,
    );
  }
  if (value in Controllers)
    return new ControllerToken(value, originalValue, Controllers[value]);
  if (basetype === TokenBaseType.DATE) {
    return buildDate(value, originalValue, prevToken, tokens);
  }
  if (basetype === TokenBaseType.TIME) {
    return buildTime(value, originalValue, prevToken, tokens);
  }
  if (basetype === TokenBaseType.STRING) {
    return buildString(
      value,
      originalValue,
      basetype,
      percent,
      lineNumber,
      multiWord,
      tokens,
      variables,
    );
  }
  if (basetype === TokenBaseType.COLOR) {
    return new ColorToken(value, originalValue, value, "HEX");
  }
  if (basetype === TokenBaseType.IP) {
    return buildIp(value, originalValue);
  }
  if (basetype === TokenBaseType.MATRIX) {
    return buildMatrix(value, originalValue);
  }
  if (basetype === TokenBaseType.TEXT) {
    return new TextToken(value, originalValue);
  }
  if (basetype === TokenBaseType.SEED) {
    return new SeedToken(value, originalValue);
  }
  if (basetype === TokenBaseType.VARIABLENAME)
    return new VariableNameToken(originalValue, originalValue);
  if (basetype === TokenBaseType.SYMBOL) {
    if (value in Operators) return makeOperator(value, originalValue);
  }
  return new UndefinedToken(value, originalValue);
}

// Parse a raw matrix literal (`[1 2 3, 4 5 6]`) the lexer accumulated whole.
// Rows split on `,` or `;`; columns split on whitespace; each cell must be a
// plain number (Number() rejects `1/2`, `2x`, etc.). Anything malformed (empty,
// ragged, non-numeric) returns an UndefinedToken — the engine's standard
// "unrecognised input" path (doParse → UserError 103) — mirroring buildIp.
function buildMatrix(value: string, originalValue: string): TokenType {
  const inner = value.replace(/^\[/, "").replace(/\]$/, "").trim();
  if (inner === "") return new UndefinedToken(value, originalValue);
  const data: number[][] = [];
  let cols = -1;
  for (const rowStr of inner.split(/[,;]/)) {
    const cells = rowStr
      .trim()
      .split(/\s+/)
      .filter((c) => c.length > 0);
    if (cells.length === 0) return new UndefinedToken(value, originalValue);
    const row: number[] = [];
    for (const cell of cells) {
      const n = Number(cell);
      if (!Number.isFinite(n)) return new UndefinedToken(value, originalValue);
      row.push(n);
    }
    if (cols === -1) cols = row.length;
    else if (row.length !== cols)
      return new UndefinedToken(value, originalValue);
    data.push(row);
  }
  return new MatrixToken(data, originalValue);
}

// Validate an IPv4/IPv6 run the lexer flagged as IP. parseIp returns null for
// anything ipaddr.js rejects (bad octet, too many groups, …) → UndefinedToken,
// the engine's standard "unrecognised input" outcome.
function buildIp(value: string, originalValue: string): TokenType {
  const parsed = parseIp(value);
  if (!parsed) return new UndefinedToken(value, originalValue);
  return new IpToken(
    value,
    originalValue,
    parsed.version,
    parsed.address,
    parsed.prefix,
  );
}

function buildNumber(
  value: string,
  originalValue: string,
  basetype: TokenBaseType,
  percent: boolean,
  prevToken: TokenType | null,
  tokens: TokenType[],
): TokenType {
  if (prevToken instanceof DateToken) {
    const n = parseFloat(value);
    if (n < 32 && !prevToken.date) {
      absorbPrev(tokens, prevToken);
      return prevToken
        .set({ date: n })
        .appendOriginalValue(originalValue)
        .setObject();
    }
    if (n > 99 && !prevToken.year) {
      absorbPrev(tokens, prevToken);
      return prevToken
        .set({ year: n })
        .appendOriginalValue(originalValue)
        .setObject();
    }
  }
  return new NumberToken(value, originalValue, basetype, percent);
}

function buildDate(
  value: string,
  originalValue: string,
  prevToken: TokenType | null,
  tokens: TokenType[],
): TokenType {
  if (value in Units && Units[value].type === UnitTypes.MONTH) {
    return buildMonth(value, originalValue, prevToken, tokens);
  }
  const dt = new DateToken(value, originalValue);
  const [x, y, z] = value.split(".");
  const xn = parseFloat(x);
  if (xn > 99) {
    return dt
      .set({ year: xn, month: parseFloat(y), date: parseFloat(z) })
      .setObject();
  }
  if (xn < 13) {
    return dt
      .set({ month: xn, date: parseFloat(y), year: parseFloat(z) })
      .setObject();
  }
  return dt
    .set({ date: xn, month: parseFloat(y), year: parseFloat(z) })
    .setObject();
}

function buildMonth(
  value: string,
  originalValue: string,
  prevToken: TokenType | null,
  tokens: TokenType[],
): TokenType {
  const monthFactor = Units[value].factor!;
  if (prevToken instanceof NumberToken && parseFloat(prevToken.value) > 99) {
    absorbPrev(tokens, prevToken);
    return new DateToken(
      `${prevToken.value} ${value}`,
      `${prevToken.originalValue} ${originalValue}`,
    )
      .set({ year: parseFloat(prevToken.value), month: monthFactor })
      .setObject();
  }
  if (
    prevToken instanceof NumberToken &&
    parseFloat(prevToken.value) < 32 &&
    parseFloat(prevToken.value) > 0
  ) {
    absorbPrev(tokens, prevToken);
    return new DateToken(
      `${prevToken.value} ${value}`,
      `${prevToken.originalValue} ${originalValue}`,
    )
      .set({ date: parseFloat(prevToken.value), month: monthFactor })
      .setObject();
  }
  if (prevToken instanceof DateToken) {
    if (prevToken.month) return new UndefinedToken(value, originalValue);
    absorbPrev(tokens, prevToken);
    return prevToken
      .set({ month: monthFactor })
      .appendOriginalValue(originalValue)
      .setObject();
  }
  return new DateToken(value, originalValue)
    .set({ month: monthFactor })
    .setObject();
}

function buildTime(
  value: string,
  originalValue: string,
  prevToken: TokenType | null,
  tokens: TokenType[],
): TokenType {
  let dt: DateToken;
  if (prevToken instanceof DateToken) {
    dt = prevToken;
    dt.appendOriginalValue(originalValue);
    absorbPrev(tokens, prevToken);
  } else {
    dt = new DateToken(value, originalValue);
  }
  const [hour, minute, second, millisecond] = value.split(":");
  dt.set({
    hour: hour ? parseFloat(hour) : undefined,
    minute: minute ? parseFloat(minute) : undefined,
    second: second ? parseFloat(second) : undefined,
    millisecond: millisecond ? parseFloat(millisecond) : undefined,
  });
  return dt.setObject();
}

// ---------------------------------------------------------------------------
// buildString — a mutating normalization preamble (constants/variables, plural
// strip, synonym rewrite, multi-word routing) followed by a first-match-wins
// resolver chain. To recognise a new keyword class, insert one resolver at the
// right rank in STRING_RESOLVERS.
// ---------------------------------------------------------------------------

type BuildStringCtx = {
  value: string;
  originalValue: string;
  // The pre-normalization lowercased words (kept for the `in`-prefix rewrite,
  // which deliberately reads the words as originally written).
  words: string[];
  percent: boolean;
  lineNumber: number;
  tokens: TokenType[];
  variables: Variables;
};

// A resolver either claims the token (returns it) or passes. Resolvers may
// mutate ctx (the `in`-prefix rewrite) — later resolvers see the mutation.
type StringResolver = (ctx: BuildStringCtx) => TokenType | "pass";

function resolveFunction(ctx: BuildStringCtx): TokenType | "pass" {
  if (!(ctx.value in Functions)) return "pass";
  return new FunctionToken(ctx.value, ctx.originalValue, Functions[ctx.value]);
}

function resolveUnit(ctx: BuildStringCtx): TokenType | "pass" {
  if (!(ctx.value in Units)) return "pass";
  return buildUnit(
    ctx.value,
    ctx.originalValue,
    ctx.lineNumber,
    ctx.percent,
    ctx.tokens[ctx.tokens.length - 1] ?? null,
    ctx.tokens,
    ctx.variables,
  );
}

function resolveOperator(ctx: BuildStringCtx): TokenType | "pass" {
  if (!(ctx.value in Operators)) return "pass";
  return makeOperator(ctx.value, ctx.originalValue);
}

function resolveImaginary(ctx: BuildStringCtx): TokenType | "pass" {
  if (ctx.value !== "i") return "pass";
  return new ComplexToken(0, 1, ctx.originalValue);
}

function resolveFreeSymbol(ctx: BuildStringCtx): TokenType | "pass" {
  if (!Symbols.has(ctx.value)) return "pass";
  return new SymbolToken(ctx.value, ctx.originalValue);
}

function resolveBooleanLiteral(ctx: BuildStringCtx): TokenType | "pass" {
  if (ctx.value !== "true" && ctx.value !== "false") return "pass";
  return new BooleanToken(ctx.value === "true", ctx.originalValue);
}

function resolveDateTimeOperand(ctx: BuildStringCtx): TokenType | "pass" {
  if (!(ctx.value in DateTimeOperands)) return "pass";
  return new DateToken(
    ctx.value,
    ctx.originalValue,
    DateTimeOperands[ctx.value].dateformat,
    DateTimeOperands[ctx.value].timeformat,
  ).setObject(DateTimeOperands[ctx.value].func());
}

// `in <city>` — split the `in` off as its own token (it's a `to` synonym) and
// leave the remainder for the resolvers below. Never claims the token itself.
function resolveInPrefix(ctx: BuildStringCtx): TokenType | "pass" {
  if (ctx.words[0] !== "in") return "pass";
  const inToken = tokenFactory(ctx.words[0], TokenBaseType.STRING);
  if (inToken) ctx.tokens.push(inToken);
  ctx.words.shift();
  ctx.value = ctx.words.join(" ");
  const originalWords = ctx.originalValue.split(" ");
  originalWords.shift();
  ctx.originalValue = originalWords.join(" ");
  return "pass";
}

function resolveTimezone(ctx: BuildStringCtx): TokenType | "pass" {
  const tz = soft(ctx.value);
  if (tz.length === 0) return "pass";
  const prevToken = ctx.tokens[ctx.tokens.length - 1] ?? null;
  if (prevToken instanceof DateToken) {
    absorbPrev(ctx.tokens, prevToken);
    return prevToken
      .set({ iana: tz[0].iana, timezone: ctx.originalValue })
      .appendOriginalValue(ctx.originalValue)
      .setObject();
  }
  return new UnitToken(ctx.value, ctx.originalValue, {
    type: UnitTypes.CITY,
    timezone: tz[0].iana,
    description: "City",
  });
}

function resolveColorName(ctx: BuildStringCtx): TokenType | "pass" {
  if (!chroma.valid(ctx.value)) return "pass";
  return new ColorToken(
    ctx.value,
    ctx.originalValue,
    chroma(ctx.value).hex(),
    "NAME",
  );
}

// THE ORDER IS LOAD-BEARING. Exact table lookups go first (so collisions
// resolve in their favour); the single-letter literals (`i`, free symbols) and
// keyword literals come next — before the fuzzy matchers (timezone-soft, CSS
// color names), which claim anything they recognise and would otherwise grab
// short words like `x` or `true`. prefixUnits runs after the chain as the
// final fallback before StringToken.
const STRING_RESOLVERS: StringResolver[] = [
  resolveFunction,
  resolveUnit,
  resolveOperator,
  resolveImaginary,
  resolveFreeSymbol,
  resolveBooleanLiteral,
  resolveDateTimeOperand,
  resolveInPrefix,
  resolveTimezone,
  resolveColorName,
];

function buildString(
  value: string,
  originalValue: string,
  basetype: TokenBaseType,
  percent: boolean,
  lineNumber: number,
  multiWord: boolean,
  tokens: TokenType[],
  variables: Variables,
): TokenType | null {
  // --- normalization preamble (order matters; everything below may rewrite
  // `value`/`basetype` or route the token away entirely) ---
  if (value in Constants) {
    return new NumberToken(
      Constants[value].value.toString(),
      originalValue,
      TokenBaseType.DECIMAL,
    );
  }
  if (value.toLowerCase() === "total" || value.toLowerCase() === "prev")
    value = `${value}${lineNumber}`;
  if (value in variables) {
    return new VariableToken(value, originalValue, variables[value]);
  }

  // Pre-normalization word snapshot — multi-word routing and the `in`-prefix
  // resolver read the words as originally written, not the rewritten value.
  const words = value.toLowerCase().trim().split(" ");
  const lastWord = words[words.length - 1];
  const irregularSingular = IrregularPlurals[lastWord];
  if (irregularSingular) {
    const parts = value.trim().split(" ");
    parts[parts.length - 1] = irregularSingular;
    value = parts.join(" ");
  } else if (Plurals.has(lastWord)) {
    value = value.slice(0, -1);
  }

  let didSynonym = false;
  if (value.toLowerCase() in Synonyms) {
    basetype = Synonyms[value.toLowerCase()].basetype;
    value = Synonyms[value.toLowerCase()].value;
    didSynonym = true;
  }
  value = value.replace(/^(sq )/i, "square ");
  value = value.replace(/^(cu )/i, "cubic ");
  multiWord = multiWord && words.length > 1;
  if (multiWord) {
    const oVal = originalValue.split(" ");
    multiWords(words, oVal, [], [], basetype, tokens, variables, lineNumber);
    return null;
  }
  // Synonym expansion can introduce compound notation (`mph → mile per hour`,
  // `psi → pound per square inch`). When the expansion contains `per`, route
  // through multiWords so the parser sees individual unit/operator tokens
  // ready for compound-unit absorption. Single-word expansions and
  // prefix-only expansions like `kg → kilo gram` stay on the prefixUnits
  // path to preserve their existing display behaviour.
  if (didSynonym) {
    const valAfter = value.toLowerCase().trim().split(" ");
    if (valAfter.length > 1 && /(^|\s)per(\s|$)/.test(value.toLowerCase())) {
      multiWords(
        valAfter,
        [...valAfter],
        [],
        [],
        basetype,
        tokens,
        variables,
        lineNumber,
      );
      return null;
    }
  }
  value = value.toLowerCase();

  // --- resolver chain ---
  const ctx: BuildStringCtx = {
    value,
    originalValue,
    words,
    percent,
    lineNumber,
    tokens,
    variables,
  };
  for (const resolve of STRING_RESOLVERS) {
    const token = resolve(ctx);
    if (token !== "pass") return token;
  }
  // Nothing claimed it — last chance is a prefixed unit (`kilometer`), else an
  // inert StringToken that doParse will reject.
  return prefixUnits(
    ctx.value,
    ctx.originalValue,
    tokens,
    variables,
    lineNumber,
  );
}

function buildUnit(
  value: string,
  originalValue: string,
  lineNumber: number,
  percent: boolean,
  prevToken: TokenType | null,
  tokens: TokenType[],
  variables: Variables,
): TokenType {
  const unitData = Units[value];
  if (unitData.type === UnitTypes.MONTH) {
    return tokenFactory(
      value,
      TokenBaseType.DATE,
      tokens,
      variables,
      percent,
      lineNumber,
      originalValue,
    )!;
  }
  if (unitData.type === UnitTypes.AMPM && prevToken instanceof DateToken) {
    if (prevToken.hour) {
      absorbPrev(tokens, prevToken);
      return prevToken
        .set({ meridian: value })
        .appendOriginalValue(originalValue)
        .setObject();
    }
    return new UndefinedToken(value, originalValue);
  }
  if (unitData.type === UnitTypes.AMPM && prevToken instanceof NumberToken) {
    const n = parseFloat(prevToken.value);
    if (Number.isInteger(n) && n <= 12) {
      absorbPrev(tokens, prevToken);
      return new DateToken(`${prevToken.value}:00`, prevToken.originalValue, "")
        .set({ hour: n, meridian: value })
        .appendOriginalValue(originalValue)
        .setObject();
    }
    return new UndefinedToken(value, originalValue);
  }
  const unitTkn = new UnitToken(value, originalValue, unitData);
  if (
    prevToken instanceof UnitToken &&
    prevToken.unitdata.type === UnitTypes.POSTFIX
  ) {
    unitTkn.prefix = prevToken;
    unitTkn.originalValue = `${prevToken.originalValue} ${unitTkn.originalValue}`;
    const mult =
      unitTkn.unitdata.type === UnitTypes.DATA
        ? prevToken.unitdata.datafactor || prevToken.factor
        : prevToken.factor!;
    unitTkn.factor *= mult;
    unitTkn.siFactor *= mult;
    absorbPrev(tokens, prevToken);
  }
  return unitTkn;
}

function makeOperator(value: string, originalValue: string): OperatorToken {
  const def = Operators[value];
  // Both call sites guard with `value in Operators`; this catches any future
  // caller that doesn't.
  if (!def) throw new UnhandledError(9002);
  return new OperatorToken(value, originalValue, def);
}

function prefixUnits(
  value: string,
  originalValue: string,
  tokens: TokenType[],
  variables: Variables,
  lineNumber: number,
) {
  const prefixes = [
    "zetta",
    "exa",
    "peta",
    "tera",
    "giga",
    "mega",
    "kilo",
    "hecto",
    "deka",
    "deca",
    "deci",
    "centi",
    "milli",
    "micro",
    "nano",
    "pico",
    "femto",
    "atto",
    "zepto",
    "yocto",
  ];
  const sqcuList = ["square ", "cubic "];
  let sqcu = null;
  for (const p of sqcuList) {
    if (value.toLowerCase().startsWith(p)) {
      sqcu = value.substring(0, p.length).trim();
      value = value.slice(p.length, value.length);
      break;
    }
  }

  for (const pre of prefixes) {
    if (value.toLowerCase().startsWith(pre)) {
      const preVal = value.substring(0, pre.length).trim();
      const postVal = value.substring(pre.length).trim();
      if (preVal && postVal) {
        const pretkn = tokenFactory(
          preVal,
          TokenBaseType.STRING,
          tokens,
          variables,
          false,
          lineNumber,
          originalValue,
        );

        const posttkn = sqcu
          ? tokenFactory(
              `${sqcu} ${postVal}`,
              TokenBaseType.STRING,
              tokens,
              variables,
              false,
              lineNumber,
              originalValue,
            )
          : tokenFactory(
              postVal,
              TokenBaseType.STRING,
              tokens,
              variables,
              false,
              lineNumber,
              originalValue,
            );
        if (posttkn instanceof UnitToken && pretkn instanceof UnitToken) {
          posttkn.prefix = pretkn;
          let thefactor = pretkn.factor;
          if (sqcu === "square") thefactor = pretkn.factor * pretkn.factor;
          else if (sqcu === "cubic")
            thefactor = pretkn.factor * pretkn.factor * pretkn.factor;
          const mult =
            posttkn.unitdata.type === UnitTypes.DATA
              ? pretkn.unitdata.datafactor || thefactor
              : thefactor;
          posttkn.factor *= mult;
          posttkn.siFactor *= mult;

          return posttkn;
        }
      }
    }
  }
  return new StringToken(value, originalValue);
}

function multiWords(
  headWords: string[],
  headOriginal: string[],
  tailWords: string[],
  tailOriginal: string[],
  tokentype: TokenBaseType,
  tokens: TokenType[],
  variables: Variables,
  lineNumber: number,
) {
  if (headWords.length > 0) {
    const headWord = headWords.join(" ");
    const headOWord = headOriginal.join(" ");
    const headToken = tokenFactory(
      headWord,
      tokentype,
      tokens,
      variables,
      false,
      lineNumber,
      headOWord,
      false,
    );
    if (
      headToken instanceof StringToken ||
      headToken instanceof UndefinedToken
    ) {
      tailWords.unshift(headWords.pop()!);
      tailOriginal.unshift(headOriginal.pop()!);
      multiWords(
        headWords,
        headOriginal,
        tailWords,
        tailOriginal,
        tokentype,
        tokens,
        variables,
        lineNumber,
      );
    } else {
      if (headToken) tokens.push(headToken);
      multiWords(
        tailWords,
        tailOriginal,
        [],
        [],
        tokentype,
        tokens,
        variables,
        lineNumber,
      );
    }
  } else if (tailWords.length > 0) {
    // No prefix of this phrase matched anything, so the words shifted into the
    // tail are unrecognised. Emit them as a single StringToken instead of
    // silently dropping them — `doParse` rejects any surviving StringToken so
    // the whole expression yields no result (no result > wrong result).
    tokens.push(new StringToken(tailWords.join(" "), tailOriginal.join(" ")));
  }
}
