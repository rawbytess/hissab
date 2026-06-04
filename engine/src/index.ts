import DateTimeOperands from "./datetime_operands";
import { UserError } from "./exceptions";
import Functions from "./function";
import lexer from "./lexer/lexer";
import parse from "./parser/parser";
import { humanize } from "./pro";
import { exprToLatex } from "./symbolic";
import TokenBaseType, { type TokenType } from "./tokens/token_basetypes";
import tokenFactory from "./tokens/token_factory";
import {
  BooleanToken,
  ColorToken,
  ComplexToken,
  DateToken,
  ExprToken,
  FractionToken,
  IpToken,
  ListToken,
  NumberToken,
  PointToken,
  StringToken,
  SymbolToken,
  UndefinedToken,
  type Variables,
} from "./tokens/tokens";
import { Operators } from "./types/operator_types";
import { Units } from "./types/unit_types";

interface ParseResult {
  result: string;
  resultToken: TokenType;
  meta: {
    variableName: string;
  };
}

type parseResultIf = ParseResult;

interface CalculateOptions {
  variables?: Variables;
  lineNumber?: number;
}

function doLex(
  line: string,
  variables: Variables = {},
  lineNumber: number = 0,
): TokenType[] {
  if (!line) throw new UserError(101);
  return lexer(line, variables, lineNumber);
}

async function doParse(tokens: TokenType[]): Promise<ParseResult> {
  if (!tokens) throw new UserError(102);
  // Any token the lexer couldn't recognise (an unknown word, a typo'd unit, a
  // stray symbol) makes the whole expression invalid. We deliberately do NOT
  // strip these and compute on the remainder — that produced plausible-but-
  // wrong results (e.g. `10 blah to foo` → `10`). No result is better than a
  // wrong result.
  if (
    tokens.some(
      (token) =>
        token instanceof UndefinedToken || token instanceof StringToken,
    )
  )
    throw new UserError(103);
  const { result, isExplicit, convertTo } = await parse(tokens);

  if (
    result instanceof NumberToken ||
    result instanceof DateToken ||
    result instanceof ColorToken ||
    result instanceof IpToken ||
    result instanceof BooleanToken ||
    result instanceof FractionToken ||
    result instanceof ListToken ||
    result instanceof ComplexToken ||
    result instanceof PointToken ||
    result instanceof ExprToken
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
      result: result.getString(),
      resultToken: result,
      meta: { variableName: result.variableName },
    };
  }
  throw new UserError(6235);
}

async function calculate(
  line: string,
  options: CalculateOptions = {},
): Promise<ParseResult> {
  const { variables = {}, lineNumber = 0 } = options;
  return doParse(doLex(line, variables, lineNumber));
}

export type {
  CalculateOptions,
  ParseResult,
  parseResultIf,
  TokenType,
  Variables,
};
export {
  ComplexToken,
  calculate,
  DateTimeOperands,
  doLex,
  doParse,
  ExprToken,
  exprToLatex,
  Functions,
  Operators,
  PointToken,
  SymbolToken,
  TokenBaseType,
  tokenFactory,
  Units,
  UserError,
};
