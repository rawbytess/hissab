import chroma from "chroma-js";
import soft from "timezone-soft";
import DateTimeOperands from "../datetime_operands";
import Functions from "../function";
import { Controllers, Operators } from "../types/operator_types";
import Plurals, { IrregularPlurals } from "../types/plurals";
import Synonyms from "../types/synonyms";
import { Constants, Units, UnitTypes } from "../types/unit_types";
import TokenBaseType, { type TokenType } from "./token_basetypes";
import {
  ColorToken,
  ControllerToken,
  DateToken,
  FunctionToken,
  NumberToken,
  OperatorToken,
  StringToken,
  UndefinedToken,
  UnitToken,
  VariableNameToken,
  type Variables,
  VariableToken,
} from "./tokens";

const NUMBER_BASETYPES = new Set<TokenBaseType>([
  TokenBaseType.DECIMAL,
  TokenBaseType.BINARY,
  TokenBaseType.OCTAL,
  TokenBaseType.HEX,
]);

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
  if (basetype === TokenBaseType.VARIABLENAME)
    return new VariableNameToken(originalValue, originalValue);
  if (basetype === TokenBaseType.SYMBOL) {
    if (value in Operators) return makeOperator(value, originalValue);
  }
  return new UndefinedToken(value, originalValue);
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
      tokens.pop();
      return prevToken
        .set({ date: n })
        .appendOriginalValue(originalValue)
        .setObject();
    }
    if (n > 99 && !prevToken.year) {
      tokens.pop();
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
    tokens.pop();
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
    tokens.pop();
    return new DateToken(
      `${prevToken.value} ${value}`,
      `${prevToken.originalValue} ${originalValue}`,
    )
      .set({ date: parseFloat(prevToken.value), month: monthFactor })
      .setObject();
  }
  if (prevToken instanceof DateToken) {
    if (prevToken.month) return new UndefinedToken(value, originalValue);
    tokens.pop();
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
    tokens.pop();
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
  let prevToken: TokenType | null = tokens[tokens.length - 1] ?? null;

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

  const val = value.toLowerCase().trim().split(" ");
  const lastWord = val[val.length - 1];
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
  multiWord = multiWord && val.length > 1;
  if (multiWord) {
    const oVal = originalValue.split(" ");
    multiWords(val, oVal, [], [], basetype, tokens, variables, lineNumber);
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

  if (value in Functions) {
    return new FunctionToken(
      value,
      originalValue,
      Functions[value].run,
      Functions[value].isRaw,
    );
  }
  if (value in Units) {
    return buildUnit(
      value,
      originalValue,
      lineNumber,
      percent,
      prevToken,
      tokens,
      variables,
    );
  }
  if (value in Operators) return makeOperator(value, originalValue);
  if (value in DateTimeOperands) {
    return new DateToken(
      value,
      originalValue,
      DateTimeOperands[value].dateformat,
      DateTimeOperands[value].timeformat,
    ).setObject(DateTimeOperands[value].func());
  }
  if (val[0] === "in") {
    prevToken = tokenFactory(val[0], TokenBaseType.STRING);
    if (prevToken) tokens.push(prevToken);
    val.shift();
    value = val.join(" ");
    const originalValueA = originalValue.split(" ");
    originalValueA.shift();
    originalValue = originalValueA?.join(" ");
  }
  const tz = soft(value);
  if (tz.length > 0) {
    if (prevToken instanceof DateToken) {
      tokens.pop();
      return prevToken
        .set({ iana: tz[0].iana, timezone: originalValue })
        .appendOriginalValue(originalValue)
        .setObject();
    }
    return new UnitToken(value, originalValue, {
      type: UnitTypes.CITY,
      timezone: tz[0].iana,
      description: "City",
    });
  }
  if (chroma.valid(value)) {
    return new ColorToken(value, originalValue, chroma(value).hex(), "NAME");
  }
  return prefixUnits(value, originalValue, tokens, variables, lineNumber);
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
      tokens.pop();
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
      tokens.pop();
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
    tokens.pop();
  }
  return unitTkn;
}

function makeOperator(value: string, originalValue: string): OperatorToken {
  const op = Operators[value];
  return new OperatorToken(
    value,
    originalValue,
    op.precedence,
    op.operands,
    op.func,
    op.isRaw,
  );
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
