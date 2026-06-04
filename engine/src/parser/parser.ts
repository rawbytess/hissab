import { UserError } from "../exceptions";
import {
  evaluate,
  exprToString,
  freeSymbols,
  parseTreeToExpr,
  simplify,
} from "../symbolic";
import type { TokenType } from "../tokens/token_basetypes";
import {
  BooleanToken,
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
  type PlotSeries,
  PlotToken,
  PointToken,
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

// Build a PlotToken of curve series from a symbolic draw()/plot() call. Each
// argument becomes its own simplified Expr; its single free variable (default
// `x`) is the axis the consumer samples over. A constant arg (no free variable)
// plots as a flat line.
function buildPlotFromCurves(args: TokenType[]): PlotToken {
  const series: PlotSeries[] = args.map((arg) => {
    const expr = simplify(evaluate(parseTreeToExpr(arg)));
    return {
      type: "curve",
      expr,
      variable: freeSymbols(expr)[0] ?? "x",
      label: exprToString(expr),
    };
  });
  return new PlotToken(series);
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
    else if (token instanceof PointToken)
      parseState = parseState.handlePoint(parseTree, token);
    else if (token instanceof BooleanToken)
      parseState = parseState.handleBoolean(parseTree, token);
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
          // Collect this function's args with a *local* flag. Using the `func`
          // parameter here would clobber it — when an arg is itself a function
          // call (`distance(point(1,2), point(3,4))`, `min(max(1,2), 3)`), the
          // inner arg-loop would flip `func` to false and the parent's
          // comma/paren separator would then be misread.
          let argFunc = true;
          while (argFunc) {
            parseIndex += 1;
            const { result, index, isFunc, isExplicit } = await parse(
              tokens,
              parseIndex,
              argFunc,
            );
            parseIndex = index;
            argFunc = isFunc;
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
            else if (result instanceof PointToken)
              parseState = parseState.handlePoint(parseTree, result);
            else if (result instanceof BooleanToken)
              parseState = parseState.handleBoolean(parseTree, result);
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
    const head = parseTree.head;
    if (
      head instanceof FunctionToken &&
      (head.value === "draw" || head.value === "plot")
    ) {
      // draw()/plot() over symbolic args is a *command*, not an algebraic term:
      // build one curve series per argument (its own simplified Expr + free
      // variable) and carry it out as a PlotToken. The numeric draw() path
      // (complex/points) is handled by drawFn in the solver below.
      parseTree.head = buildPlotFromCurves(head.args);
    } else {
      // Symbolic route: skip the numeric solver entirely (it would try to reduce
      // a free variable to a number). Convert the parse tree to the Expr AST,
      // compute any calculus nodes (derivative/integral/limit), then simplify to
      // canonical form and carry it out as an ExprToken. We keep the *captured*
      // (pre-evaluation) Expr as `source` so consumers can still render the input
      // notation (∫, d/dx) while the value shows the computed answer. The numeric
      // path below is byte-for-byte unchanged for non-symbolic input.
      const captured = parseTreeToExpr(parseTree.head);
      const expr = simplify(evaluate(captured));
      parseTree.head = new ExprToken(expr, captured);
    }
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
