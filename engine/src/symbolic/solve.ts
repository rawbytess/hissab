// Equation solving: the values of a variable that make `body = 0` (an equation
// `lhs = rhs` is captured as `lhs - rhs`, see from_tree.ts).
//
// - A polynomial in the variable with numeric coefficients gets every root,
//   real and complex: rational roots exactly (rational-root theorem over BigInt),
//   then the closed form up to quadratics, then Durand–Kerner + Newton polish.
// - Linear in the variable with symbolic coefficients (`2x + 3y - 8` for x)
//   gets a symbolic answer.
// - Anything else in one variable (`2^x - 10`, `sin(x) - 0.5`) gets a numeric
//   search for real roots. Trig here is in radians, as in the rest of the
//   symbolic subsystem.

import { UserError } from "../exceptions";
import { evalExpr, freeSymbols } from "./calculus";
import { type Cx, cx, cxAbs, cxAdd, cxDiv, cxMul, cxSub } from "./complex";
import {
  add,
  cst,
  type Expr,
  IMAGINARY,
  mul,
  neg,
  pow,
  type SolutionsExpr,
  sym,
} from "./expr";
import { simplify } from "./polynomial";
import { toFraction } from "./util";

// Numeric search: at most this many real roots are listed (nearest zero first).
const MAX_NUMERIC_ROOTS = 12;

export function solveFor(body: Expr, variable: string | null): SolutionsExpr {
  const e = simplify(body);
  const free = freeSymbols(e);
  let v = variable;
  if (!v) {
    if (free.length > 1) throw new UserError(8821);
    v = free[0] ?? "x";
  }
  const result = (
    values: Expr[],
    extra: Partial<SolutionsExpr> = {},
  ): SolutionsExpr => ({
    kind: "solutions",
    variable: v,
    values,
    exhaustive: true,
    ...extra,
  });

  if (!free.includes(v)) {
    const isZero = e.kind === "const" && e.value === 0;
    return result([], { all: isZero });
  }

  const poly = coefficients(e, v);
  if (poly) {
    const { coeffs, excludesZero } = poly;
    if (coeffs.every((c) => c.kind === "const")) {
      const nums = coeffs.map((c) => (c.kind === "const" ? c.value : 0));
      const roots = polynomialRoots(nums).filter(
        (r) => !(excludesZero && r.re === 0 && r.im === 0),
      );
      return result(sortRoots(roots).map(cxToExpr));
    }
    if (coeffs.length === 2) {
      // c1·v + c0 = 0 → v = -c0 / c1
      const [c0, c1] = coeffs;
      return result([simplify(mul(neg(c0), pow(c1, cst(-1))))]);
    }
    throw new UserError(8822);
  }

  if (free.length > 1) throw new UserError(8821);
  const { roots, more } = numericRealRoots(e, v);
  return result(roots.map(cst), { exhaustive: false, more });
}

// ---------------------------------------------------------------------------
// Polynomial structure
// ---------------------------------------------------------------------------

// `e` as a polynomial in `v`: coeffs[k] multiplies v^k. Null when `v` appears
// other than as an integer power (sin(v), v^(1/2), 2^v). Negative powers
// (`x + 1/x`) are shifted away by multiplying through by v^m; v = 0 is then
// not a solution (`excludesZero`).
function coefficients(
  e: Expr,
  v: string,
): { coeffs: Expr[]; excludesZero: boolean } | null {
  const byPower = new Map<number, Expr[]>();
  for (const term of e.kind === "add" ? e.terms : [e]) {
    let power = 0;
    const rest: Expr[] = [];
    for (const f of term.kind === "mul" ? term.factors : [term]) {
      if (f.kind === "sym" && f.name === v) power += 1;
      else if (
        f.kind === "pow" &&
        f.base.kind === "sym" &&
        f.base.name === v &&
        f.exp.kind === "const" &&
        Number.isInteger(f.exp.value)
      )
        power += f.exp.value;
      else if (freeSymbols(f).includes(v)) return null;
      else rest.push(f);
    }
    const coeff =
      rest.length === 0 ? cst(1) : rest.length === 1 ? rest[0] : mul(...rest);
    byPower.set(power, [...(byPower.get(power) ?? []), coeff]);
  }
  const powers = [...byPower.keys()];
  const low = Math.min(...powers);
  const shift = low < 0 ? -low : 0;
  const degree = Math.max(...powers) + shift;
  const coeffs: Expr[] = [];
  for (let k = 0; k <= degree; k++) {
    const parts = byPower.get(k - shift);
    coeffs.push(parts ? simplify(add(...parts)) : cst(0));
  }
  return { coeffs, excludesZero: shift > 0 };
}

// ---------------------------------------------------------------------------
// Numeric-coefficient polynomial roots
// ---------------------------------------------------------------------------

// Distinct roots of Σ a[k]·x^k.
function polynomialRoots(a: number[]): Cx[] {
  let p = trim([...a]);
  const roots: Cx[] = [];
  if (p.length > 1 && p[0] === 0) {
    roots.push(cx(0));
    while (p.length > 1 && p[0] === 0) p = p.slice(1);
  }
  const rational = rationalRoots(p);
  if (rational) {
    roots.push(...rational.roots.map((r) => cx(r)));
    p = rational.rest;
  }
  if (p.length === 2) roots.push(cx(-p[0] / p[1]));
  else if (p.length === 3) roots.push(...quadratic(p[2], p[1], p[0]));
  else if (p.length > 3) roots.push(...durandKerner(p));
  return dedupe(roots.map(clean));
}

function trim(p: number[]): number[] {
  while (p.length > 1 && p[p.length - 1] === 0) p.pop();
  return p;
}

// Rational roots, found exactly: scale the coefficients to integers, test every
// ±p/q (p | a0, q | an) with BigInt arithmetic, and deflate by each root found.
// Null when the coefficients aren't clean rationals or are too large to factor.
function rationalRoots(
  p: number[],
): { roots: number[]; rest: number[] } | null {
  if (p.length < 2) return null;
  const fracs: [number, number][] = [];
  for (const c of p) {
    const f = toFraction(c, 1_000_000);
    if (!f) return null;
    fracs.push(f);
  }
  const scale = fracs.reduce(
    (l, [, d]) => (l * BigInt(d)) / bigGcd(l, BigInt(d)),
    1n,
  );
  let ints = fracs.map(([n, d]) => (BigInt(n) * scale) / BigInt(d));
  const limit = 10n ** 10n;
  const lead = (i: bigint[]) => i[i.length - 1];
  if (bigAbs(ints[0]) > limit || bigAbs(lead(ints)) > limit) return null;
  const roots: number[] = [];
  for (const q of divisors(bigAbs(lead(ints)))) {
    for (const pNum of divisors(bigAbs(ints[0]))) {
      for (const num of [pNum, -pNum]) {
        if (bigGcd(bigAbs(num), q) !== 1n) continue;
        while (ints.length > 1 && isRoot(ints, num, q)) {
          if (!roots.includes(Number(num) / Number(q)))
            roots.push(Number(num) / Number(q));
          ints = deflate(ints, num, q);
        }
      }
    }
  }
  return { roots, rest: ints.map(Number) };
}

// Σ c[k]·num^k·q^(n-k) = 0, i.e. P(num/q) = 0 scaled by q^n.
function isRoot(c: bigint[], num: bigint, q: bigint): boolean {
  const n = c.length - 1;
  let sum = 0n;
  for (let k = 0; k <= n; k++)
    sum += c[k] * num ** BigInt(k) * q ** BigInt(n - k);
  return sum === 0n;
}

// Divide Σ c[k]·x^k by (q·x - num), exactly (Gauss: the quotient stays integral).
function deflate(c: bigint[], num: bigint, q: bigint): bigint[] {
  const n = c.length - 1;
  const out: bigint[] = new Array(n).fill(0n);
  let carry = c[n];
  for (let k = n - 1; k >= 0; k--) {
    out[k] = carry / q;
    carry = c[k] + out[k] * num;
  }
  return out;
}

function divisors(n: bigint): bigint[] {
  if (n === 0n) return [1n];
  const small: bigint[] = [];
  const large: bigint[] = [];
  for (let i = 1n; i * i <= n; i++) {
    if (n % i === 0n) {
      small.push(i);
      if (i * i !== n) large.push(n / i);
    }
  }
  return [...small, ...large.reverse()];
}

const bigAbs = (n: bigint) => (n < 0n ? -n : n);
function bigGcd(a: bigint, b: bigint): bigint {
  let x = bigAbs(a);
  let y = bigAbs(b);
  while (y) [x, y] = [y, x % y];
  return x || 1n;
}

// Roots of a·x² + b·x + c, in the numerically stable form.
function quadratic(a: number, b: number, c: number): Cx[] {
  const disc = b * b - 4 * a * c;
  if (disc < 0) {
    const re = -b / (2 * a);
    const im = Math.sqrt(-disc) / (2 * Math.abs(a));
    return [cx(re, im), cx(re, -im)];
  }
  const q = -(b + Math.sign(b || 1) * Math.sqrt(disc)) / 2;
  const r1 = q / a;
  const r2 = q !== 0 ? c / q : r1;
  return [cx(r1), cx(r2)];
}

// All roots of a degree ≥ 3 polynomial at once (Weierstrass / Durand–Kerner),
// then Newton-polished against the original polynomial.
function durandKerner(p: number[]): Cx[] {
  const n = p.length - 1;
  const monic = p.map((c) => c / p[n]);
  const evalP = (z: Cx): Cx => {
    let acc = cx(monic[n]);
    for (let k = n - 1; k >= 0; k--) acc = cxAdd(cxMul(acc, z), cx(monic[k]));
    return acc;
  };
  const radius = 1 + Math.max(...monic.slice(0, n).map(Math.abs));
  let z: Cx[] = Array.from({ length: n }, (_, k) => {
    const angle = (2 * Math.PI * k) / n + 0.4;
    return cx(radius * Math.cos(angle), radius * Math.sin(angle));
  });
  for (let iter = 0; iter < 1000; iter++) {
    let delta = 0;
    z = z.map((zi, i) => {
      let denom = cx(1);
      for (let j = 0; j < n; j++)
        if (j !== i) denom = cxMul(denom, cxSub(zi, z[j]));
      const step = cxDiv(evalP(zi), denom);
      delta = Math.max(delta, cxAbs(step));
      return cxSub(zi, step);
    });
    if (delta < 1e-14) break;
  }
  const dp = monic.slice(1).map((c, k) => c * (k + 1));
  const evalD = (w: Cx): Cx => {
    let acc = cx(dp[dp.length - 1]);
    for (let k = dp.length - 2; k >= 0; k--)
      acc = cxAdd(cxMul(acc, w), cx(dp[k]));
    return acc;
  };
  return z.map((root) => {
    let r = root;
    for (let i = 0; i < 20; i++) {
      const d = evalD(r);
      if (cxAbs(d) === 0) break;
      r = cxSub(r, cxDiv(evalP(r), d));
    }
    return r;
  });
}

// Drop float noise: a negligible imaginary part, and near-integer parts.
function clean(z: Cx): Cx {
  const scale = 1 + cxAbs(z);
  const snap = (x: number) => {
    if (Math.abs(x) < 1e-10 * scale) return 0;
    const r = Math.round(x);
    return Math.abs(x - r) < 1e-9 * scale ? r : x;
  };
  return cx(snap(z.re), snap(z.im));
}

function dedupe(roots: Cx[]): Cx[] {
  const out: Cx[] = [];
  for (const r of roots)
    if (!out.some((o) => cxAbs(cxSub(o, r)) < 1e-7 * (1 + cxAbs(r))))
      out.push(r);
  return out;
}

// Real roots ascending, then complex pairs by real part (positive imaginary first).
function sortRoots(roots: Cx[]): Cx[] {
  return [...roots].sort((a, b) => {
    const ar = a.im === 0;
    const br = b.im === 0;
    if (ar !== br) return ar ? -1 : 1;
    return a.re - b.re || b.im - a.im;
  });
}

function cxToExpr(z: Cx): Expr {
  if (z.im === 0) return cst(z.re);
  const imag = z.im === 1 ? sym(IMAGINARY) : mul(cst(z.im), sym(IMAGINARY));
  return z.re === 0 ? imag : add(cst(z.re), imag);
}

// ---------------------------------------------------------------------------
// Numeric real roots of a non-polynomial expression
// ---------------------------------------------------------------------------

// Scan x = sinh(u) for u in [-12, 12] (dense near 0, reaching ±8·10^4), bisect
// every sign change, and keep the ones where the function really vanishes (a
// sign change across a pole, like 1/x at 0, is not a root).
function numericRealRoots(
  e: Expr,
  v: string,
): { roots: number[]; more: boolean } {
  const f = (t: number) => evalExpr(e, { [v]: t });
  const found: number[] = [];
  let prevT = Math.sinh(-12);
  let prevF = f(prevT);
  for (let u = -12 + 0.002; u <= 12; u += 0.002) {
    const t = Math.sinh(u);
    const ft = f(t);
    if (prevF !== null && ft !== null) {
      if (prevF === 0) found.push(prevT);
      else if (prevF * ft < 0) {
        const root = bisect(f, prevT, t, prevF);
        const fr = root === null ? null : f(root);
        const scale = Math.max(1, Math.abs(prevF), Math.abs(ft));
        if (root !== null && fr !== null && Math.abs(fr) <= 1e-6 * scale)
          found.push(root);
      }
    }
    prevT = t;
    prevF = ft;
  }
  const snapped = found.map((r) => {
    const n = Math.round(r);
    return Math.abs(r - n) < 1e-9 * (1 + Math.abs(r)) ? n : r;
  });
  const unique = snapped.filter(
    (r, i) =>
      snapped.findIndex((o) => Math.abs(o - r) < 1e-9 * (1 + Math.abs(r))) ===
      i,
  );
  if (unique.length <= MAX_NUMERIC_ROOTS)
    return { roots: unique.sort((a, b) => a - b), more: false };
  const nearest = [...unique]
    .sort((a, b) => Math.abs(a) - Math.abs(b))
    .slice(0, MAX_NUMERIC_ROOTS);
  return { roots: nearest.sort((a, b) => a - b), more: true };
}

function bisect(
  f: (t: number) => number | null,
  lo: number,
  hi: number,
  fLo: number,
): number | null {
  let a = lo;
  let b = hi;
  let fa = fLo;
  for (let i = 0; i < 200 && b - a > 1e-15 * (1 + Math.abs(a)); i++) {
    const m = (a + b) / 2;
    const fm = f(m);
    if (fm === null) return null;
    if (fm === 0) return m;
    if (fa * fm < 0) b = m;
    else {
      a = m;
      fa = fm;
    }
  }
  return (a + b) / 2;
}
