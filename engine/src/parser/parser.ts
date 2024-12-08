import {
  ControllerToken,
  Direction,
  FunctionToken,
  OperatorToken,
  StringToken,
  VariableNameToken,
  VariableToken,
  DateToken,
  ColorToken,
  UnitToken,
  NumberToken,
} from "../tokens/tokens";

import {
  CombineNumberState,
  CompleteState,
  FreshParseState,
  FunctionState,
  NeedNumberState,
  NeedUnitState,
  ParserStateTypes,
} from "./parser_states";

import { UserError } from "../exceptions";
import ParseTree from "./parsetree";
import { TokenType } from "../tokens/token_basetypes";

interface parseIf {
  result: TokenType;
  index: number;
  isFunc: boolean;
  isExplicit: boolean;
  convertTo: string[] | undefined;
}

async function parse(
  tokens: TokenType[],
  isPro: boolean,
  parseIndex = 0,
  func = false,
): Promise<parseIf> {
  const parseTree = new ParseTree(isPro);
  let parseState: ParserStateTypes = FreshParseState;

  for (; parseIndex < tokens.length; parseIndex += 1) {
    let token: TokenType = tokens[parseIndex];
    if (token instanceof VariableToken) token = token.valueToken;
    if (token instanceof NumberToken)
      parseState = await parseState.handleOperand(parseTree, token);
    else if (token instanceof StringToken || token instanceof VariableNameToken)
      parseState = parseState.handleString(parseTree, token);
    else if (token instanceof DateToken)
      parseState = parseState.handleDate(parseTree, token);
    else if (token instanceof ColorToken)
      parseState = parseState.handleColor(parseTree, token);
    else if (token instanceof OperatorToken)
      parseState = parseState.handleOperator(parseTree, token);
    else if (token instanceof FunctionToken)
      parseState = parseState.handleFunction(parseTree, token);
    else if (token instanceof UnitToken)
      parseState = await parseState.handleUnit(parseTree, token);
    else if (token instanceof ControllerToken) {
      if (
        parseState.instanceName === "FreshParseState" ||
        parseState.instanceName === "NeedNumberState"
      ) {
        if (token.basetype === "BRAC_START") {
          parseIndex += 1;
          const { result, index } = await parse(
            tokens,
            isPro,
            parseIndex,
            false,
          );
          parseIndex = index;
          tokens.splice(parseIndex + 1, 0, result);
        }
      } else if (parseState.instanceName === "CompleteState") {
        if (token.basetype === "BRAC_END") {
          func = false;
          break;
        } else if (token.basetype === "COMMA" && func) break;
        else if (token.basetype === "COMMA" && !func) {
          if (tokens[parseIndex - 1] instanceof UnitToken) {
            parseState = NeedUnitState;
          } else if (tokens[parseIndex - 1] instanceof NumberToken) {
            parseState = CombineNumberState;
          }
        }
      } else if (parseState.instanceName === "FunctionState") {
        if (token.basetype === "BRAC_START") {
          func = true;
          while (func) {
            parseIndex += 1;
            const { result, index, isFunc } = await parse(
              tokens,
              isPro,
              parseIndex,
              func,
            );
            parseIndex = index;
            func = isFunc;
            if (result instanceof NumberToken)
              parseState = await parseState.handleOperand(parseTree, result);
            else if (result instanceof DateToken)
              parseState = parseState.handleDate(parseTree, result);
          }
          parseState = CompleteState;
        }
      }
    } else {
      throw new UserError(201);
    }
  }
  if (parseState.instanceName !== "CompleteState") throw new UserError(231);
  if (parseTree.head === null) throw new UserError(231);

  await parseTree.solve(parseTree.head, null, Direction.RIGHT);
  const resultToken = parseTree.head;
  return {
    result: resultToken,
    index: parseIndex,
    isFunc: func,
    isExplicit: parseTree.isExplicit,
    convertTo: parseTree.convertTo,
  };
}

export default parse;
export type { parseIf };
