import { UserError } from "../exceptions";
import { evaluate, parseTreeToExpr, simplify } from "../symbolic";
import type { TokenType } from "../tokens/token_basetypes";
import {
  ColorToken,
  ComplexToken,
  ControllerToken,
  DateToken,
  Direction,
  ExprToken,
  FunctionToken,
  IpToken,
  NumberToken,
  OperatorToken,
  StringToken,
  SymbolToken,
  UnitToken,
  VariableNameToken,
  VariableToken,
} from "../tokens/tokens";

// An expression is symbolic when a free variable (or an already-built symbolic
// sub-expression) appears anywhere in the tree. ComplexToken does NOT count — it
// is a closed numeric domain handled by the ordinary eager solver.
function isSymbolic(token: TokenType | null): boolean {
  if (!token) return false;
  if (token instanceof SymbolToken || token instanceof ExprToken) return true;
  if (token instanceof OperatorToken)
    return (
      isSymbolic(token.left) ||
      isSymbolic(token.right) ||
      token.more.some((t) => isSymbolic(t))
    );
  if (token instanceof FunctionToken)
    return token.args.some((t) => isSymbolic(t));
  if (token instanceof VariableToken) return isSymbolic(token.valueToken);
  return false;
}

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
    if (
      token instanceof NumberToken ||
      token instanceof ComplexToken ||
      token instanceof SymbolToken ||
      token instanceof ExprToken
    )
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
            if (
              result instanceof NumberToken ||
              result instanceof ComplexToken ||
              result instanceof SymbolToken ||
              result instanceof ExprToken
            )
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

  if (isSymbolic(parseTree.head)) {
    // Symbolic route: skip the numeric solver entirely (it would try to reduce a
    // free variable to a number). Convert the parse tree to the Expr AST,
    // compute any calculus nodes (derivative/integral/limit), then simplify to
    // canonical form and carry it out as an ExprToken. We keep the *captured*
    // (pre-evaluation) Expr as `source` so consumers can still render the input
    // notation (∫, d/dx) while the value shows the computed answer. The numeric
    // path below is byte-for-byte unchanged for non-symbolic input.
    const captured = parseTreeToExpr(parseTree.head);
    const expr = simplify(evaluate(captured));
    parseTree.head = new ExprToken(expr, captured);
  } else {
    await parseTree.solve(parseTree.head, null, Direction.RIGHT);
  }
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
