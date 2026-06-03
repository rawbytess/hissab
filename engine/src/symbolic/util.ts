// Numeric formatting shared by the Expr renderers (string + LaTeX). Coefficients
// in symbolic results are JS floats, and integration in particular produces clean
// rationals (1/3, 2/3, 3/2). We reconstruct a fraction from the float when one
// exists (bounded denominator) so results read the way they're written on paper;
// otherwise we fall back to a 4-dp decimal.

export function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  return parseFloat(n.toFixed(4)).toString();
}

function gcd(a: number, b: number): number {
  a = Math.abs(a);
  b = Math.abs(b);
  while (b) {
    [a, b] = [b, a % b];
  }
  return a || 1;
}

// Reconstruct [numerator, denominator] from a float via the continued-fraction
// algorithm, or null when no fraction with denominator <= maxDen matches within
// tolerance (i.e. the value is effectively irrational / messy).
export function toFraction(
  x: number,
  maxDen = 1000,
  tol = 1e-9,
): [number, number] | null {
  if (!Number.isFinite(x)) return null;
  if (Number.isInteger(x)) return [x, 1];
  const sign = x < 0 ? -1 : 1;
  const ax = Math.abs(x);
  let h1 = 1;
  let h0 = 0;
  let k1 = 0;
  let k0 = 1;
  let b = ax;
  for (let i = 0; i < 64; i++) {
    const a = Math.floor(b);
    const h2 = a * h1 + h0;
    const k2 = a * k1 + k0;
    h0 = h1;
    h1 = h2;
    k0 = k1;
    k1 = k2;
    if (k1 > maxDen) {
      // Overshot the denominator bound — fall back to the previous convergent.
      h1 = h0;
      k1 = k0;
      break;
    }
    if (Math.abs(ax - h1 / k1) <= tol * ax) break;
    const frac = b - a;
    if (Math.abs(frac) < 1e-15) break;
    b = 1 / frac;
  }
  if (k1 === 0 || k1 > maxDen) return null;
  if (Math.abs(ax - h1 / k1) > Math.max(tol, tol * ax)) return null;
  const g = gcd(h1, k1);
  return [(sign * h1) / g, k1 / g];
}

// A coefficient as a fraction string ("2/3") when one cleanly reconstructs, else
// a decimal.
export function formatRational(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const fr = toFraction(n);
  if (fr) {
    const [a, d] = fr;
    return d === 1 ? a.toString() : `${a}/${d}`;
  }
  return formatNum(n);
}
