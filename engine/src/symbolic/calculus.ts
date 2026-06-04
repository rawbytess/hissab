// Calculus over the Expr AST: differentiation, integration and limits. This is
// the "computation" half of the symbolic subsystem (alongside simplify and
// complex arithmetic) — see ./expr.ts for the representation and ./polynomial.ts
// for the canonicaliser these functions lean on.
//
// Scope is deliberately the part a calculator actually needs and we can do
// *exactly*: polynomials and elementary functions. Differentiation is complete
// for that class; integration is power-rule + a small antiderivative table;
// limits are continuity (substitution). Anything outside that degrades
// gracefully — `evaluate` leaves the original `derivative`/`integral`/`limit`
// node in place (so it still renders as operator notation) rather than throwing.
//
// Two numeric fallbacks keep the calculator useful where no closed form exists:
// a two-sided numeric estimate for indeterminate limits (`(x^2-1)/(x-1) -> 2`,
// `sin(x)/x -> 1`) and composite-Simpson quadrature for definite integrals.

import {
  add,
  cst,
  type Expr,
  func,
  IMAGINARY,
  isConst,
  mul,
  neg,
  pow,
  sub,
  sym,
} from "./expr";
import { simplify } from "./polynomial";

// Internal sentinel: "this construct is outside the supported class". Caught at
// the `evaluate` boundary, where it means "leave the node unevaluated".
class Unsupported extends Error {}

// ---------------------------------------------------------------------------
// Structural helpers
// ---------------------------------------------------------------------------

const isSymVar = (e: Expr, v: string): boolean =>
  e.kind === "sym" && e.name === v;

// Does the expression mention the variable we're differentiating/integrating
// against? Everything else is a constant w.r.t. that variable.
function dependsOn(e: Expr, v: string): boolean {
  switch (e.kind) {
    case "const":
      return false;
    case "sym":
      return e.name === v;
    case "add":
      return e.terms.some((t) => dependsOn(t, v));
    case "mul":
      return e.factors.some((f) => dependsOn(f, v));
    case "pow":
      return dependsOn(e.base, v) || dependsOn(e.exp, v);
    case "func":
      return e.args.some((a) => dependsOn(a, v));
    default:
      return true;
  }
}

// Substitute `r` for every occurrence of the symbol `v`, then canonicalise.
function substRaw(e: Expr, v: string, r: Expr): Expr {
  switch (e.kind) {
    case "const":
      return e;
    case "sym":
      return e.name === v ? r : e;
    case "add":
      return add(...e.terms.map((t) => substRaw(t, v, r)));
    case "mul":
      return mul(...e.factors.map((f) => substRaw(f, v, r)));
    case "pow":
      return pow(substRaw(e.base, v, r), substRaw(e.exp, v, r));
    case "func":
      return func(e.name, ...e.args.map((a) => substRaw(a, v, r)));
    default:
      return e;
  }
}

export const subst = (e: Expr, v: string, r: Expr): Expr =>
  simplify(substRaw(e, v, r));

// ---------------------------------------------------------------------------
// Numeric evaluation (for the limit / definite-integral fallbacks)
// ---------------------------------------------------------------------------

const NUMERIC_FUNCS: Record<string, (x: number) => number> = {
  sin: Math.sin,
  cos: Math.cos,
  tan: Math.tan,
  sec: (x) => 1 / Math.cos(x),
  csc: (x) => 1 / Math.sin(x),
  cot: (x) => 1 / Math.tan(x),
  sinh: Math.sinh,
  cosh: Math.cosh,
  tanh: Math.tanh,
  exp: Math.exp,
  ln: Math.log,
  loge: Math.log,
  log: Math.log,
  log10: Math.log10,
  log2: Math.log2,
};

// Evaluate to a concrete number under an environment binding free symbols.
// Throws Unsupported on an unbound symbol (e.g. another free variable, or `i`)
// or an unknown function, so callers can abandon the numeric path cleanly.
function numericEval(e: Expr, env: Record<string, number>): number {
  switch (e.kind) {
    case "const":
      return e.value;
    case "sym":
      if (e.name in env) return env[e.name];
      throw new Unsupported();
    case "add":
      return e.terms.reduce((s, t) => s + numericEval(t, env), 0);
    case "mul":
      return e.factors.reduce((p, f) => p * numericEval(f, env), 1);
    case "pow":
      return numericEval(e.base, env) ** numericEval(e.exp, env);
    case "func": {
      const fn = NUMERIC_FUNCS[e.name];
      if (!fn || e.args.length !== 1) throw new Unsupported();
      return fn(numericEval(e.args[0], env));
    }
    default:
      throw new Unsupported();
  }
}

// A pure-numeric Expr → number, or null if it isn't fully numeric.
function tryNum(e: Expr): number | null {
  try {
    const n = numericEval(e, {});
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// Round away float noise from a numeric estimate so 1.9999999998 reads as 2.
const clean = (n: number): number => Math.round(n * 1e8) / 1e8;

// ---------------------------------------------------------------------------
// Public sampling surface (used by consumers to plot curves)
// ---------------------------------------------------------------------------

// Evaluate `expr` to a finite number under `env`, or `null` when it can't be:
// an unbound symbol, an unknown function, or a non-finite result (∞ / NaN, e.g.
// ln of a negative or a division by zero). Callers sampling a curve treat a
// `null` as a gap in the plotted line rather than an error.
export function evalExpr(
  expr: Expr,
  env: Record<string, number>,
): number | null {
  try {
    const n = numericEval(expr, env);
    return Number.isFinite(n) ? n : null;
  } catch {
    return null;
  }
}

// Every free variable mentioned in `expr`, excluding the reserved imaginary
// unit `i`. Used to decide which variable a curve is a function of (and to
// reject multi-variable expressions from a 2-D plot).
export function freeSymbols(expr: Expr): string[] {
  const out = new Set<string>();
  const walk = (e: Expr): void => {
    switch (e.kind) {
      case "const":
        return;
      case "sym":
        if (e.name !== IMAGINARY) out.add(e.name);
        return;
      case "add":
        e.terms.forEach(walk);
        return;
      case "mul":
        e.factors.forEach(walk);
        return;
      case "pow":
        walk(e.base);
        walk(e.exp);
        return;
      case "func":
        e.args.forEach(walk);
        return;
      case "equation":
        walk(e.lhs);
        walk(e.rhs);
        return;
      default:
        // derivative / integral / limit — the bound variable still "appears".
        walk(e.body);
    }
  };
  walk(expr);
  return [...out];
}

// ---------------------------------------------------------------------------
// Differentiation (exact)
// ---------------------------------------------------------------------------

// d/du f(u) for a known function f — the outer factor of the chain rule. The
// caller multiplies by du. Names match the engine's operator names.
function dFunc(name: string, u: Expr): Expr {
  switch (name) {
    case "sin":
      return func("cos", u);
    case "cos":
      return neg(func("sin", u));
    case "tan":
      return pow(func("sec", u), cst(2));
    case "sec":
      return mul(func("sec", u), func("tan", u));
    case "csc":
      return neg(mul(func("csc", u), func("cot", u)));
    case "cot":
      return neg(pow(func("csc", u), cst(2)));
    case "sinh":
      return func("cosh", u);
    case "cosh":
      return func("sinh", u);
    case "tanh":
      return sub(cst(1), pow(func("tanh", u), cst(2)));
    case "exp":
      return func("exp", u);
    case "ln":
    case "loge":
      return pow(u, cst(-1));
    case "log10":
      return pow(mul(u, cst(Math.log(10))), cst(-1));
    case "log2":
      return pow(mul(u, cst(Math.log(2))), cst(-1));
    default:
      throw new Unsupported();
  }
}

function differentiateRaw(e: Expr, v: string): Expr {
  switch (e.kind) {
    case "const":
      return cst(0);
    case "sym":
      return cst(e.name === v ? 1 : 0);
    case "add":
      return add(...e.terms.map((t) => differentiateRaw(t, v)));
    case "mul": {
      // Product rule: Σ_i (f_i' · Π_{j≠i} f_j).
      const fs = e.factors;
      const terms = fs.map((_, i) =>
        mul(differentiateRaw(fs[i], v), ...fs.filter((_, j) => j !== i)),
      );
      return add(...terms);
    }
    case "pow": {
      const { base, exp } = e;
      const db = differentiateRaw(base, v);
      if (isConst(exp)) {
        // Power + chain rule: n·base^(n-1)·base'.
        return mul(cst(exp.value), pow(base, cst(exp.value - 1)), db);
      }
      const de = differentiateRaw(exp, v);
      if (isConst(base)) {
        // Exponential rule: a^u·ln(a)·u'.
        return mul(pow(base, exp), cst(Math.log(base.value)), de);
      }
      // General: base^exp · (exp'·ln(base) + exp·base'/base).
      return mul(
        pow(base, exp),
        add(mul(de, func("ln", base)), mul(exp, db, pow(base, cst(-1)))),
      );
    }
    case "func": {
      if (e.args.length !== 1) throw new Unsupported();
      const u = e.args[0];
      return mul(dFunc(e.name, u), differentiateRaw(u, v));
    }
    default:
      throw new Unsupported();
  }
}

export const differentiate = (e: Expr, v: string): Expr =>
  simplify(differentiateRaw(simplify(e), v));

// ---------------------------------------------------------------------------
// Integration (power rule + small antiderivative table; definite via FTC or
// numeric quadrature)
// ---------------------------------------------------------------------------

// ∫ f(v) dv for a known function f whose argument is exactly the variable.
function intFunc(name: string, u: Expr): Expr {
  switch (name) {
    case "sin":
      return neg(func("cos", u));
    case "cos":
      return func("sin", u);
    case "exp":
      return func("exp", u);
    default:
      throw new Unsupported();
  }
}

function integrateRaw(e: Expr, v: string): Expr {
  switch (e.kind) {
    case "add":
      return add(...e.terms.map((t) => integrateRaw(t, v)));
    case "const":
      return mul(e, sym(v)); // ∫ c dv = c·v
    case "sym":
      // ∫ v dv = v²/2; a different symbol is a constant → c·v.
      return e.name === v ? mul(cst(0.5), pow(sym(v), cst(2))) : mul(e, sym(v));
    case "mul": {
      // Pull constant factors out front; integrate the single v-dependent part.
      const consts: Expr[] = [];
      const varParts: Expr[] = [];
      for (const f of e.factors) {
        (dependsOn(f, v) ? varParts : consts).push(f);
      }
      if (varParts.length === 0) return mul(...consts, sym(v)); // constant · v
      if (varParts.length !== 1) throw new Unsupported(); // product of v-terms
      return mul(...consts, integrateRaw(varParts[0], v));
    }
    case "pow": {
      if (isSymVar(e.base, v) && isConst(e.exp)) {
        const n = e.exp.value;
        if (n === -1) return func("ln", sym(v)); // ∫ v^-1 dv = ln(v)
        return mul(cst(1 / (n + 1)), pow(sym(v), cst(n + 1)));
      }
      throw new Unsupported();
    }
    case "func":
      if (e.args.length === 1 && isSymVar(e.args[0], v)) {
        return intFunc(e.name, sym(v));
      }
      throw new Unsupported();
    default:
      throw new Unsupported();
  }
}

export const integrate = (e: Expr, v: string): Expr =>
  simplify(integrateRaw(simplify(e), v));

// Composite Simpson's rule over [a, b]. Used only as a numeric fallback when the
// integrand has no closed-form antiderivative but the bounds are numeric.
function simpson(e: Expr, v: string, a: number, b: number, n = 1000): number {
  const h = (b - a) / n;
  let s = numericEval(e, { [v]: a }) + numericEval(e, { [v]: b });
  for (let i = 1; i < n; i++) {
    s += (i % 2 === 0 ? 2 : 4) * numericEval(e, { [v]: a + i * h });
  }
  return (s * h) / 3;
}

function definiteIntegral(e: Expr, v: string, lo: Expr, hi: Expr): Expr {
  try {
    const F = integrate(e, v);
    return simplify(sub(subst(F, v, hi), subst(F, v, lo)));
  } catch (err) {
    if (!(err instanceof Unsupported)) throw err;
    // No closed form — numerically integrate if both bounds are numbers.
    const a = tryNum(lo);
    const b = tryNum(hi);
    if (a === null || b === null) throw err;
    return cst(clean(simpson(e, v, a, b)));
  }
}

// ---------------------------------------------------------------------------
// Limits (continuity / two-sided numeric estimate)
// ---------------------------------------------------------------------------

// Does the expression contain a non-finite constant (∞ / NaN), i.e. did naive
// substitution hit a pole or an indeterminate form?
function hasNonFinite(e: Expr): boolean {
  switch (e.kind) {
    case "const":
      return !Number.isFinite(e.value);
    case "sym":
      return false;
    case "add":
      return e.terms.some(hasNonFinite);
    case "mul":
      return e.factors.some(hasNonFinite);
    case "pow":
      return hasNonFinite(e.base) || hasNonFinite(e.exp);
    case "func":
      return e.args.some(hasNonFinite);
    default:
      return true;
  }
}

// Two-sided numeric estimate: sample point ± 10^-k for growing k and require the
// midpoints to converge and the two sides to agree. Returns null if they don't.
function numericLimit(e: Expr, v: string, p: number): number | null {
  let prev: number | null = null;
  let result: number | null = null;
  for (let k = 1; k <= 10; k++) {
    const d = 10 ** -k;
    let left: number;
    let right: number;
    try {
      left = numericEval(e, { [v]: p - d });
      right = numericEval(e, { [v]: p + d });
    } catch {
      return null;
    }
    if (!Number.isFinite(left) || !Number.isFinite(right)) return null;
    // Sides must agree for a two-sided limit to exist.
    if (Math.abs(left - right) > 1e-6 * (1 + Math.abs(left))) {
      prev = null;
      continue;
    }
    const mid = (left + right) / 2;
    if (prev !== null && Math.abs(mid - prev) <= 1e-9 * (1 + Math.abs(mid))) {
      result = mid;
      break;
    }
    prev = mid;
  }
  if (result === null) result = prev;
  return result === null ? null : clean(result);
}

function limitOf(e: Expr, v: string, point: Expr): Expr {
  const direct = subst(e, v, point);
  const p = tryNum(point);

  // Continuous case: plain substitution gives a finite value. Cross-check
  // against a numeric estimate when the point is numeric, because simplify can
  // collapse a 0·∞ indeterminate form to a misleading 0.
  if (!hasNonFinite(direct)) {
    if (isConst(direct) && p !== null) {
      const est = numericLimit(e, v, p);
      if (
        est !== null &&
        Math.abs(est - direct.value) > 1e-6 * (1 + Math.abs(est))
      ) {
        return cst(est); // substitution lied — trust the estimate
      }
    }
    if (!dependsOn(direct, v)) return direct; // finite, possibly symbolic (e.g. 2y)
  }

  // Indeterminate / pole — fall back to the numeric estimate.
  if (p !== null) {
    const est = numericLimit(e, v, p);
    if (est !== null) return cst(est);
  }
  throw new Unsupported();
}

// ---------------------------------------------------------------------------
// Driver: compute every calculus node, post-order, leaving unsupported ones in
// place (so they still render as operator notation rather than erroring).
// ---------------------------------------------------------------------------

export function evaluate(e: Expr): Expr {
  switch (e.kind) {
    case "derivative": {
      const body = evaluate(e.body);
      try {
        return differentiate(body, e.variable);
      } catch (err) {
        if (err instanceof Unsupported) return { ...e, body };
        throw err;
      }
    }
    case "integral": {
      const body = evaluate(e.body);
      try {
        return e.lower && e.upper
          ? definiteIntegral(
              body,
              e.variable,
              evaluate(e.lower),
              evaluate(e.upper),
            )
          : integrate(body, e.variable);
      } catch (err) {
        if (err instanceof Unsupported) return { ...e, body };
        throw err;
      }
    }
    case "limit": {
      const body = evaluate(e.body);
      try {
        return limitOf(body, e.variable, evaluate(e.point));
      } catch (err) {
        if (err instanceof Unsupported) return { ...e, body };
        throw err;
      }
    }
    case "add":
      return add(...e.terms.map(evaluate));
    case "mul":
      return mul(...e.factors.map(evaluate));
    case "pow":
      return pow(evaluate(e.base), evaluate(e.exp));
    case "func":
      return func(e.name, ...e.args.map(evaluate));
    case "equation":
      return { kind: "equation", lhs: evaluate(e.lhs), rhs: evaluate(e.rhs) };
    default:
      return e;
  }
}
