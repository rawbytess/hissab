// The symbolic expression AST — the engine's internal representation of an
// algebraic expression or equation. This is deliberately a plain, self-contained
// data structure (no engine tokens, no I/O), so the *representation* of an
// expression is decoupled from the *math* performed on it. Operations like
// simplify / solve / differentiate / integrate / limit are functions over `Expr`
// (see ./polynomial.ts for simplify; the rest are scaffolded for the next phase).
//
// `Add` is an n-ary sum and `Mul` is an n-ary product — flat variadic nodes make
// like-term collection and canonicalisation far simpler than nested binary trees.
// Subtraction and division are normalised away at construction time: `a - b`
// becomes `a + (-1)*b`, and `a / b` becomes `a * b^-1`.

export type Expr =
  | ConstExpr
  | SymExpr
  | AddExpr
  | MulExpr
  | PowExpr
  | FuncExpr
  | EquationExpr
  | DerivativeExpr
  | IntegralExpr
  | LimitExpr;

// A numeric literal. Complex literals are represented structurally (see
// fromTree.ts: `i` → Sym("i")), so `value` is always a real number here.
export interface ConstExpr {
  kind: "const";
  value: number;
}

// A free variable (`x`, `y`, `z`, …) or a reserved symbolic constant (`i`).
export interface SymExpr {
  kind: "sym";
  name: string;
}

// n-ary sum: terms[0] + terms[1] + …
export interface AddExpr {
  kind: "add";
  terms: Expr[];
}

// n-ary product: factors[0] * factors[1] * …
export interface MulExpr {
  kind: "mul";
  factors: Expr[];
}

// base ^ exp. Integer-constant exponents are expanded by simplify; everything
// else is kept as an opaque atom.
export interface PowExpr {
  kind: "pow";
  base: Expr;
  exp: Expr;
}

// A named function application (`sin(x)`, `log(x)`, …). Treated as an opaque
// atom by the polynomial simplifier (its args are still simplified).
export interface FuncExpr {
  kind: "func";
  name: string;
  args: Expr[];
}

// An equation `lhs = rhs`. The grammar that produces these from bare input
// (`2x + 3y = 8`) is a follow-up; the node exists so solve() has a target.
export interface EquationExpr {
  kind: "equation";
  lhs: Expr;
  rhs: Expr;
}

// d(body)/d(variable).
export interface DerivativeExpr {
  kind: "derivative";
  body: Expr;
  variable: string;
}

// ∫ body d(variable), optionally over [lower, upper].
export interface IntegralExpr {
  kind: "integral";
  body: Expr;
  variable: string;
  lower?: Expr;
  upper?: Expr;
}

// limit of body as variable → point.
export interface LimitExpr {
  kind: "limit";
  body: Expr;
  variable: string;
  point: Expr;
}

// ---------------------------------------------------------------------------
// Constructors
// ---------------------------------------------------------------------------

export const cst = (value: number): ConstExpr => ({ kind: "const", value });
export const sym = (name: string): SymExpr => ({ kind: "sym", name });
export const add = (...terms: Expr[]): AddExpr => ({ kind: "add", terms });
export const mul = (...factors: Expr[]): MulExpr => ({ kind: "mul", factors });
export const pow = (base: Expr, exp: Expr): PowExpr => ({
  kind: "pow",
  base,
  exp,
});
export const func = (name: string, ...args: Expr[]): FuncExpr => ({
  kind: "func",
  name,
  args,
});
export const equation = (lhs: Expr, rhs: Expr): EquationExpr => ({
  kind: "equation",
  lhs,
  rhs,
});

// `-e` as `(-1) * e`; `a - b` as `a + (-1)*b`.
export const neg = (e: Expr): Expr => mul(cst(-1), e);
export const sub = (a: Expr, b: Expr): Expr => add(a, neg(b));

// ---------------------------------------------------------------------------
// Predicates
// ---------------------------------------------------------------------------

export function isConst(e: Expr): e is ConstExpr {
  return e.kind === "const";
}

export function isZero(e: Expr): boolean {
  return e.kind === "const" && e.value === 0;
}

export function isOne(e: Expr): boolean {
  return e.kind === "const" && e.value === 1;
}

// The reserved imaginary-unit symbol. Kept as a Sym so symbolic expressions can
// contain `i`; pure-complex numeric arithmetic uses ComplexToken instead.
export const IMAGINARY = "i";
