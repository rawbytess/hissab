// Bridge the engine's parsed token tree into the symbolic Expr AST. Rather than
// writing a second parser, we reuse the operator/function tree the existing
// parser already builds and translate each node. Reached only when parse()
// detects a symbolic tree (see isSymbolic in parser.ts).

import { UserError } from "../exceptions";
import type { TokenType } from "../tokens/token_basetypes";
import {
  ComplexToken,
  ExprToken,
  FunctionToken,
  NumberToken,
  OperatorToken,
  SymbolToken,
  VariableToken,
} from "../tokens/tokens";
import {
  add,
  cst,
  type Expr,
  equation,
  func,
  mul,
  neg,
  pow,
  sym,
} from "./expr";

// Binary operator value → Expr builder. Subtraction/division are normalised into
// addition/multiplication so the simplifier sees a uniform shape.
function binary(op: string, left: Expr, right: Expr): Expr {
  switch (op) {
    case "+":
      return add(left, right);
    case "-":
      return add(left, neg(right));
    case "*":
      return mul(left, right);
    case "/":
      return mul(left, pow(right, cst(-1)));
    case "^":
    case "**":
      return pow(left, right);
    case "=":
      return equation(left, right);
    default:
      throw new UserError(8801); // operator not supported in symbolic expressions
  }
}

export function parseTreeToExpr(token: TokenType): Expr {
  if (token instanceof VariableToken) return parseTreeToExpr(token.valueToken);
  if (token instanceof ExprToken) return token.expr;
  if (token instanceof NumberToken) return cst(token.toNumber());
  if (token instanceof SymbolToken) return sym(token.value);
  if (token instanceof ComplexToken) {
    // re + im·i, left for the simplifier to fold (drops a zero real part, etc.).
    return add(cst(token.re), mul(cst(token.im), sym("i")));
  }
  if (token instanceof OperatorToken) {
    const right = token.right ? parseTreeToExpr(token.right) : null;
    if (right === null) throw new UserError(8802);
    // Unary prefix operators (trig, log, …) carry only a right child; capture
    // them as function applications (`sin(x)`). `sqrt` becomes `u^(1/2)` so
    // the power rules differentiate, integrate and simplify it.
    if (token.left === null)
      return token.value === "sqrt"
        ? pow(right, cst(0.5))
        : func(token.value, right);
    return binary(token.value, parseTreeToExpr(token.left), right);
  }
  if (token instanceof FunctionToken) {
    const args = token.args.map(parseTreeToExpr);
    // Symbolic-operation keywords build dedicated AST nodes (representation
    // captured this phase; their evaluation — actual differentiation, etc. — is
    // the next phase, except simplify which is sugar over the default route).
    switch (token.value) {
      case "simplify":
        if (args.length !== 1) throw new UserError(8804);
        return args[0];
      case "derivative":
      case "diff":
        return {
          kind: "derivative",
          body: args[0],
          variable: symName(args[1]),
        };
      case "integrate":
      case "integral":
        return {
          kind: "integral",
          body: args[0],
          variable: symName(args[1]),
          lower: args[2],
          upper: args[3],
        };
      case "limit":
        return {
          kind: "limit",
          body: args[0],
          variable: symName(args[1]),
          point: args[2] ?? cst(0),
        };
      case "solve":
        return solveNode(token.args.map(solveArg));
      default:
        return func(token.value, ...args);
    }
  }
  throw new UserError(8803); // unconvertible token in symbolic expression
}

// solve(expr, [var]) → expr = 0; solve(lhs, rhs, [var]) → lhs = rhs; an
// equation argument (`x^2 = 4`) works too. A trailing bare symbol (after the
// first argument) names the variable to solve for.
function solveNode(args: Expr[]): Expr {
  const last = args[args.length - 1];
  const named = args.length >= 2 && last.kind === "sym" ? last.name : null;
  const sides = named ? args.slice(0, -1) : args;
  if (sides.length === 1) {
    const [side] = sides;
    const body = side.kind === "equation" ? add(side.lhs, neg(side.rhs)) : side;
    return { kind: "solve", body, variable: named };
  }
  if (sides.length === 2)
    return {
      kind: "solve",
      body: add(sides[0], neg(sides[1])),
      variable: named,
    };
  throw new UserError(8820);
}

// A `solve` argument. `x = 4` written inside it was evaluated as a label
// assignment (the arg arrives as the value 4, labelled `x`); read it back as the
// equation x = 4 rather than silently solving `4 = 0`. Only the free symbols
// (x, y, z — the `Symbols` set in token_factory.ts) can be solved for.
function solveArg(arg: TokenType): Expr {
  const e = parseTreeToExpr(arg);
  if (!arg.variableName) return e;
  if (!/^[xyz]$/.test(arg.variableName)) throw new UserError(8824);
  return equation(sym(arg.variableName), e);
}

// The variable argument of a calculus operation must be a bare symbol (`x`).
function symName(e: Expr | undefined): string {
  if (!e || e.kind !== "sym") throw new UserError(8804);
  return e.name;
}
