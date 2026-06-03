import { UserError } from "../exceptions";
import type { TokenType } from "../tokens/token_basetypes";
import {
  ColorToken,
  ControllerToken,
  DateToken,
  Direction,
  FunctionToken,
  IpToken,
  NumberToken,
  OperatorToken,
  StringToken,
  UnitToken,
  VariableNameToken,
  VariableToken,
} from "../tokens/tokens";
import {
  CombineNumberState,
  CompleteState,
  FreshParseState,
  FunctionState,
  NeedNumberState,
  NeedUnitState,
  type ParserStateTypes,
} from "./parser_states";
import ParseTree from "./parsetree";

interface parseIf {
  result: TokenType;
  index: number;
  isFunc: boolean;
  isExplicit: boolean;
  convertTo: string[] | undefined;
}

async function parse(
  tokens: TokenType[],
  parseIndex = 0,
  func = false,
): Promise<parseIf> {
  const parseTree = new ParseTree();
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
    else if (token instanceof IpToken)
      parseState = parseState.handleIp(parseTree, token);
    else if (token instanceof OperatorToken)
      parseState = parseState.handleOperator(parseTree, token);
    else if (token instanceof FunctionToken)
      parseState = parseState.handleFunction(parseTree, token);
    else if (token instanceof UnitToken) {
      const result = await parseState.handleUnit(
        parseTree,
        token,
        tokens,
        parseIndex,
      );
      parseState = result.state;
      parseIndex += result.advance;
    } else if (token instanceof ControllerToken) {
      if (parseState === FreshParseState || parseState === NeedNumberState) {
        if (token.basetype === "BRAC_START") {
          parseIndex += 1;

          const { result, index, convertTo, isExplicit } = await parse(
            tokens,
            parseIndex,
            false,
          );
          parseTree.setIsExplicit(isExplicit);

          parseIndex = index;
          tokens.splice(parseIndex + 1, 0, result);
        }
      } else if (parseState === CompleteState) {
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
      } else if (parseState === FunctionState) {
        if (token.basetype === "BRAC_START") {
          func = true;
          while (func) {
            parseIndex += 1;
            const { result, index, isFunc, isExplicit } = await parse(
              tokens,
              parseIndex,
              func,
            );
            parseIndex = index;
            func = isFunc;
            parseTree.setIsExplicit(isExplicit);
            if (result instanceof NumberToken)
              parseState = await parseState.handleOperand(parseTree, result);
            else if (result instanceof DateToken)
              parseState = parseState.handleDate(parseTree, result);
            else if (result instanceof IpToken)
              parseState = parseState.handleIp(parseTree, result);
          }
          parseState = CompleteState;
        }
      }
    } else {
      throw new UserError(201);
    }
  }
  if (parseState !== CompleteState) throw new UserError(231);
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
