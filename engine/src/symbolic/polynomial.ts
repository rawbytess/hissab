// Canonical polynomial normal form. `simplify(expr)` expands products/powers and
// collects like terms into a sum of monomials, ordered by descending total
// degree then lexicographically. This is the one symbolic *computation* shipped
// in this phase (alongside complex arithmetic); solve/calculus are scaffolded
// for the next phase.
//
// A monomial is a numeric coefficient times a product of "factors", where each
// factor is an opaque atom (a symbol, a function application, or a power the
// simplifier can't expand) raised to an *integer* exponent. Atoms are keyed by a
// deterministic serialisation so like terms collapse (`sin(x) + sin(x)` →
// `2sin(x)`); the atom registry maps each key back to its Expr for rebuilding.

import {
  add,
  cst,
  type DerivativeExpr,
  type Expr,
  func,
  type IntegralExpr,
  type LimitExpr,
  mul,
  pow,
  sym,
} from "./expr";

// A single monomial: coefficient and a map of atomKey → integer exponent.
interface Term {
  coeff: number;
  factors: Map<string, number>;
}

// monomialKey → Term, plus a shared atomKey → Expr registry.
class Poly {
  terms = new Map<string, Term>();
  atoms = new Map<string, Expr>();
}

// Stable key for a monomial from its factor map: "x^2*y^1" (factors sorted,
// zero exponents dropped, empty string for the constant monomial).
function monomialKey(factors: Map<string, number>): string {
  const parts: string[] = [];
  for (const [k, e] of factors) if (e !== 0) parts.push(`${k}^${e}`);
  parts.sort();
  return parts.join("*");
}

// Deterministic, commutativity-stable serialisation used to key atoms. Operates
// on already-simplified Exprs so structurally-equal atoms key identically.
function serialize(e: Expr): string {
  switch (e.kind) {
    case "const":
      return String(e.value);
    case "sym":
      return e.name;
    case "pow":
      return `pow(${serialize(e.base)},${serialize(e.exp)})`;
    case "func":
      return `${e.name}(${e.args.map(serialize).join(",")})`;
    case "mul":
      return `mul(${e.factors.map(serialize).sort().join(",")})`;
    case "add":
      return `add(${e.terms.map(serialize).sort().join(",")})`;
    default:
      return JSON.stringify(e);
  }
}

function polyConst(value: number): Poly {
  const p = new Poly();
  if (value !== 0) p.terms.set("", { coeff: value, factors: new Map() });
  return p;
}

// An atom raised to an integer exponent → a one-term Poly.
function atomizeFactor(atom: Expr, exponent: number): Poly {
  const p = new Poly();
  if (exponent === 0) return polyConst(1);
  const key = serialize(atom);
  p.atoms.set(key, atom);
  const factors = new Map<string, number>([[key, exponent]]);
  p.terms.set(monomialKey(factors), { coeff: 1, factors });
  return p;
}

function addTerm(target: Poly, term: Term): void {
  const key = monomialKey(term.factors);
  const existing = target.terms.get(key);
  if (existing) {
    existing.coeff += term.coeff;
    if (existing.coeff === 0) target.terms.delete(key);
  } else if (term.coeff !== 0) {
    target.terms.set(key, {
      coeff: term.coeff,
      factors: new Map(term.factors),
    });
  }
}

function polyAdd(a: Poly, b: Poly): Poly {
  const out = new Poly();
  for (const [k, v] of a.atoms) out.atoms.set(k, v);
  for (const [k, v] of b.atoms) out.atoms.set(k, v);
  for (const t of a.terms.values()) addTerm(out, t);
  for (const t of b.terms.values()) addTerm(out, t);
  return out;
}

function polyMul(a: Poly, b: Poly): Poly {
  const out = new Poly();
  for (const [k, v] of a.atoms) out.atoms.set(k, v);
  for (const [k, v] of b.atoms) out.atoms.set(k, v);
  for (const ta of a.terms.values()) {
    for (const tb of b.terms.values()) {
      const factors = new Map<string, number>(ta.factors);
      for (const [k, e] of tb.factors) {
        const merged = (factors.get(k) ?? 0) + e;
        if (merged === 0) factors.delete(k);
        else factors.set(k, merged);
      }
      addTerm(out, { coeff: ta.coeff * tb.coeff, factors });
    }
  }
  return out;
}

function polyPowInt(p: Poly, n: number): Poly {
  let result = polyConst(1);
  for (let i = 0; i < n; i++) result = polyMul(result, p);
  return result;
}

function buildPoly(e: Expr): Poly {
  switch (e.kind) {
    case "const":
      return polyConst(e.value);
    case "sym":
      return atomizeFactor(sym(e.name), 1);
    case "add": {
      let acc = polyConst(0);
      for (const t of e.terms) acc = polyAdd(acc, buildPoly(t));
      return acc;
    }
    case "mul": {
      let acc = polyConst(1);
      for (const f of e.factors) acc = polyMul(acc, buildPoly(f));
      return acc;
    }
    case "pow": {
      const sb = simplify(e.base);
      const se = simplify(e.exp);
      if (se.kind === "const") {
        const n = se.value;
        if (sb.kind === "const") return polyConst(sb.value ** n);
        if (Number.isInteger(n)) {
          if (n === 0) return polyConst(1);
          if (n > 0) return polyPowInt(buildPoly(sb), n);
          return atomizeFactor(sb, n); // negative integer power → x^-k factor
        }
        return atomizeFactor(pow(sb, se), 1); // fractional power → opaque atom
      }
      return atomizeFactor(pow(sb, se), 1); // symbolic exponent → opaque atom
    }
    case "func":
      return atomizeFactor(func(e.name, ...e.args.map(simplify)), 1);
    default:
      // equation / derivative / integral / limit aren't polynomials.
      return atomizeFactor(e, 1);
  }
}

function totalDegree(factors: Map<string, number>): number {
  let d = 0;
  for (const e of factors.values()) d += e;
  return d;
}

// Rebuild a canonical Expr from the collected terms: descending total degree,
// then lexicographic monomial key. Within a monomial, factors are alphabetical.
function polyToExpr(poly: Poly): Expr {
  const entries = [...poly.terms.entries()].filter(([, t]) => t.coeff !== 0);
  if (entries.length === 0) return cst(0);

  entries.sort((a, b) => {
    const da = totalDegree(a[1].factors);
    const db = totalDegree(b[1].factors);
    if (da !== db) return db - da;
    return a[0] < b[0] ? -1 : a[0] > b[0] ? 1 : 0;
  });

  const termExprs: Expr[] = entries.map(([, term]) => {
    const factorKeys = [...term.factors.entries()]
      .filter(([, e]) => e !== 0)
      .sort((a, b) => (a[0] < b[0] ? -1 : 1));
    if (factorKeys.length === 0) return cst(term.coeff);
    const factorExprs: Expr[] = factorKeys.map(([k, e]) => {
      const atom = poly.atoms.get(k) ?? sym(k);
      return e === 1 ? atom : pow(atom, cst(e));
    });
    if (term.coeff === 1) {
      return factorExprs.length === 1 ? factorExprs[0] : mul(...factorExprs);
    }
    return mul(cst(term.coeff), ...factorExprs);
  });

  return termExprs.length === 1 ? termExprs[0] : add(...termExprs);
}

// Simplify an expression to canonical form. Equations/calculus nodes simplify
// their sub-parts (their evaluation is the next phase); everything else folds
// into polynomial normal form.
export function simplify(e: Expr): Expr {
  switch (e.kind) {
    case "equation":
      return { kind: "equation", lhs: simplify(e.lhs), rhs: simplify(e.rhs) };
    case "derivative":
      return { ...e, body: simplify(e.body) } as DerivativeExpr;
    case "integral":
      return {
        ...e,
        body: simplify(e.body),
        lower: e.lower ? simplify(e.lower) : undefined,
        upper: e.upper ? simplify(e.upper) : undefined,
      } as IntegralExpr;
    case "limit":
      return {
        ...e,
        body: simplify(e.body),
        point: simplify(e.point),
      } as LimitExpr;
    default:
      return polyToExpr(buildPoly(e));
  }
}
