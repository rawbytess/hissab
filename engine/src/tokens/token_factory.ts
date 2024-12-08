import soft from "timezone-soft";
import chroma from "chroma-js";
import TokenBaseType, { TokenType } from "./token_basetypes";
import { Controllers, Operators } from "../types/operator_types";
import { Constants, Units, UnitTypes } from "../types/unit_types";
import Plurals from "../types/plurals";
import Synonyms from "../types/synonyms";
import Functions from "../function";
import DateTimeOperands from "../datetime_operands";
import {
  ColorToken,
  ControllerToken,
  DateToken,
  FunctionToken,
  NumberToken,
  OperatorToken,
  ResultToken,
  StringToken,
  UndefinedToken,
  UnitToken,
  VariableNameToken,
  Variables,
  VariableToken,
} from "./tokens";

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
  let prevToken = tokens ? tokens[tokens.length - 1] : null;
  const isNumber = () =>
    basetype === TokenBaseType.DECIMAL ||
    basetype === TokenBaseType.BINARY ||
    basetype === TokenBaseType.OCTAL ||
    basetype === TokenBaseType.HEX;
  if (isNumber()) {
    if (prevToken instanceof DateToken) {
      if (parseFloat(value) < 32 && !prevToken.date) {
        tokens.pop();
        return prevToken
          .setDate(parseFloat(value))
          .appendOriginalValue(originalValue)
          .setObject();
      }
      if (parseFloat(value) > 99 && !prevToken.year) {
        tokens.pop();
        return prevToken
          .setYear(parseFloat(value))
          .appendOriginalValue(originalValue)
          .setObject();
      }
    }
    return new NumberToken(value, originalValue, basetype, percent);
  }
  if (value in Controllers)
    return new ControllerToken(value, originalValue, Controllers[value]);
  if (basetype === TokenBaseType.DATE) {
    if (value in Units && Units[value].type === UnitTypes.MONTH) {
      if (
        prevToken instanceof NumberToken &&
        parseFloat(prevToken.value) > 99
      ) {
        tokens.pop();
        return new DateToken(
          `${prevToken.value} ${value}`,
          `${prevToken.originalValue} ${originalValue}`,
        )
          .setYear(parseFloat(prevToken.value))
          .setMonth(Units[value].factor!)
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
          .setDate(parseFloat(prevToken.value))
          .setMonth(Units[value].factor!)
          .setObject();
      }
      if (prevToken instanceof DateToken) {
        if (prevToken.month) return new UndefinedToken(value, originalValue);
        tokens.pop();
        return prevToken
          .setMonth(Units[value].factor!)
          .appendOriginalValue(originalValue)
          .setObject();
      }
      return new DateToken(value, originalValue)
        .setMonth(Units[value].factor!)
        .setObject();
    }
    const dt = new DateToken(value, originalValue);
    const [x, y, z] = value.split(".");
    if (parseFloat(x) > 99) {
      return dt
        .setYear(parseFloat(x))
        .setMonth(parseFloat(y))
        .setDate(parseFloat(z))
        .setObject();
    }
    if (parseFloat(x) < 13) {
      return dt
        .setMonth(parseFloat(x))
        .setDate(parseFloat(y))
        .setYear(parseFloat(z))
        .setObject();
    }
    return dt
      .setDate(parseFloat(x))
      .setMonth(parseFloat(y))
      .setYear(parseFloat(z))
      .setObject();
  }
  if (basetype === TokenBaseType.TIME) {
    let dt;
    if (prevToken instanceof DateToken) {
      dt = prevToken;
      dt.appendOriginalValue(originalValue);
      tokens.pop();
    } else dt = new DateToken(value, originalValue);
    const [hour, minute, second, millisecond] = value.split(":");
    if (hour) dt.setHour(parseFloat(hour));
    if (minute) dt.setMinute(parseFloat(minute));
    if (second) dt.setSecond(parseFloat(second));
    if (millisecond) dt.setMillisecond(parseFloat(millisecond));
    return dt.setObject();
  }
  if (basetype === TokenBaseType.STRING) {
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
    if (Plurals.has(val[val.length - 1])) value = value.slice(0, -1);

    if (value.toLowerCase() in Synonyms) {
      basetype = Synonyms[value.toLowerCase()].basetype;
      value = Synonyms[value.toLowerCase()].value;
    }
    value = value.replace(/^(sq )/i, "square ");
    value = value.replace(/^(cu )/i, "cubic ");
    multiWord = multiWord && val.length > 1;
    if (multiWord) {
      const oVal = originalValue.split(" ");
      multiWords(val, oVal, [], [], basetype, tokens, variables, lineNumber);
      return null;
    }
    value = value.toLowerCase();

    if (value in Functions) {
      return new FunctionToken(
        value,
        originalValue,
        Functions[value].run,
        Functions[value].isRaw,
        Functions[value].needsPro,
      );
    }
    if (value in Units) {
      if (Units[value].type === UnitTypes.MONTH) {
        return tokenFactory(
          value,
          TokenBaseType.DATE,
          tokens,
          variables,
          percent,
          lineNumber,
          originalValue,
        );
      }
      if (
        Units[value].type === UnitTypes.AMPM &&
        prevToken instanceof DateToken
      ) {
        if (prevToken.hour) {
          tokens.pop();
          return prevToken
            .setMeridian(value)
            .appendOriginalValue(originalValue)
            .setObject();
        }
        return new UndefinedToken(value, originalValue);
      }
      if (
        Units[value].type === UnitTypes.AMPM &&
        prevToken instanceof NumberToken
      ) {
        if (
          Number.isInteger(parseFloat(prevToken.value)) &&
          parseFloat(prevToken.value) <= 12
        ) {
          tokens.pop();
          return new DateToken(
            `${prevToken.value}:00`,
            prevToken.originalValue,
            "",
          )
            .setHour(parseFloat(prevToken.value))
            .setMeridian(value)
            .appendOriginalValue(originalValue)
            .setObject();
        }
        return new UndefinedToken(value, originalValue);
      }
      const unitTkn = new UnitToken(
        value,
        originalValue,
        Units[value],
        Units[value].needsPro,
      );
      if (
        prevToken instanceof UnitToken &&
        prevToken.unitdata.type === UnitTypes.POSTFIX
      ) {
        unitTkn.prefix = prevToken;
        unitTkn.originalValue = `${prevToken.originalValue} ${unitTkn.originalValue}`;
        if (unitTkn.unitdata.type === UnitTypes.DATA)
          unitTkn.factor *= prevToken.unitdata.datafactor || prevToken.factor;
        else unitTkn.factor *= prevToken.factor!;
        tokens.pop();
      }
      return unitTkn;
    }
    if (value in Operators) {
      return new OperatorToken(
        value,
        originalValue,
        Operators[value].precedence,
        Operators[value].operands,
        Operators[value].func,
        Operators[value].isRaw,
        Operators[value].needsPro,
      );
    }
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
          .setTimezone(tz[0].iana, originalValue)
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
  if (basetype === TokenBaseType.COLOR) {
    return new ColorToken(value, originalValue, value, "HEX");
  }
  if (basetype === TokenBaseType.VARIABLENAME)
    return new VariableNameToken(originalValue, originalValue);
  if (basetype === TokenBaseType.SYMBOL) {
    if (value in Operators) {
      return new OperatorToken(
        value,
        originalValue,
        Operators[value].precedence,
        Operators[value].operands,
        Operators[value].func,
        Operators[value].isRaw,
        Operators[value].needsPro,
      );
    }
  }
  if (basetype === TokenBaseType.RESULT) {
    return new ResultToken(value, originalValue);
  }
  return new UndefinedToken(value, originalValue);
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
          if (posttkn.unitdata.type === UnitTypes.DATA)
            posttkn.factor *= pretkn.unitdata.datafactor || thefactor;
          else posttkn.factor *= thefactor;

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
  }
}
