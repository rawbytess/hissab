import DateTimeOperands from "./datetime_operands";
import { ReportError, UserError } from "./exceptions";
import Functions from "./function";
import lexer from "./lexer/lexer";
import parse from "./parser/parser";
import { humanize } from "./pro";
import TokenBaseType, { type TokenType } from "./tokens/token_basetypes";
import tokenFactory from "./tokens/token_factory";
import {
  ColorToken,
  DateToken,
  NumberToken,
  ResultToken,
  StringToken,
  Token,
  UndefinedToken,
  type Variables,
} from "./tokens/tokens";
import { Operators } from "./types/operator_types";
import { Units } from "./types/unit_types";

interface parseResultIf {
  result: string;
  resultToken: TokenType;
  meta: {
    variableName: string;
  };
}

async function doExpression(expressions: string[]) {
  const results: string[] = [];
  for (const expression of expressions) {
    const tokens = doLex(expression);
    const result = await doParse(tokens, true);
    results.push(result.result);
  }
  return results;
}

function doLex(
  line: string,
  variables: Variables = {},
  lineNumber: number = 0,
) {
  if (!line) throw new UserError(101);
  return lexer(line, variables, lineNumber);
}

async function doParse(
  tokens: TokenType[],
  isPro = true,
): Promise<parseResultIf> {
  if (!tokens) throw new UserError(102);
  const cleanTokens = tokens.filter(
    (token) =>
      !(token instanceof UndefinedToken || token instanceof StringToken),
  );
  const { result, isExplicit, convertTo } = await parse(cleanTokens, isPro);

  if (
    result instanceof NumberToken ||
    result instanceof DateToken ||
    result instanceof ColorToken ||
    result instanceof ResultToken
  ) {
    if (!isExplicit && result instanceof NumberToken) {
      const humanized: string = humanize(result, convertTo);
      return {
        result: humanized,
        resultToken: result,
        meta: { variableName: result.variableName },
      };
    }
    return {
      result: result.getString(isPro),
      resultToken: result,
      meta: { variableName: result.variableName },
    };
  }
  throw new UserError(6235);
}

export {
  doExpression,
  doLex,
  doParse,
  tokenFactory,
  TokenBaseType,
  ReportError,
  DateTimeOperands,
  Units,
  Functions,
  Operators,
};
export type { parseResultIf, Variables, TokenType };
