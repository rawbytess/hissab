// Exact integer arithmetic (BigInt). Numbers are float64 by default, which
// silently loses digits past 2^53 — `7^222 mod 1000` came out 912 instead of
// 49 and `(2^60 + 1) - 2^60` came out 0. Integers that are written out, or
// produced by integer arithmetic on such integers, are kept exact instead
// (NumberToken.exactValue); everything here is the BigInt math behind that.
// Pure — no engine imports, so it adds no edges to the init-order-sensitive
// token/unit module graph.

export const MAX_SAFE = BigInt(Number.MAX_SAFE_INTEGER);

// Past these sizes an exact result is not worth building (and `9^9^9` would
// never finish); the caller falls back to the float path.
const MAX_POW_BITS = 100_000; // ~30,000 digits
const MAX_TERMS = 10_000n; // factorial / perm / comb multiplications

// Exact integers up to this many digits display in full; longer ones fall back
// to 11-significant-digit scientific notation (the float display style).
const MAX_DISPLAY_DIGITS = 100;

const abs = (n: bigint) => (n < 0n ? -n : n);

export function isSafe(n: bigint): boolean {
  return n <= MAX_SAFE && n >= -MAX_SAFE;
}

// Past 1e15 the float display switches to scientific notation; an exact
// integer there is shown with all its digits instead (formatExactInteger).
export function beyondFloatDisplay(n: bigint): boolean {
  return abs(n) > 10n ** 15n;
}

export function powExact(base: bigint, exp: bigint): bigint | null {
  if (exp < 0n) return null;
  if (abs(base) <= 1n)
    return base === -1n && exp % 2n === 1n ? -1n : base ** exp;
  const bits = BigInt(abs(base).toString(2).length);
  if (bits * exp > BigInt(MAX_POW_BITS)) return null;
  return base ** exp;
}

export function factorialExact(n: bigint): bigint | null {
  if (n < 0n || n > MAX_TERMS) return null;
  let result = 1n;
  for (let i = 2n; i <= n; i++) result *= i;
  return result;
}

// n perm r = n! / (n - r)!
export function permExact(n: bigint, r: bigint): bigint | null {
  if (r < 0n || n < r || r > MAX_TERMS) return null;
  let result = 1n;
  for (let i = 0n; i < r; i++) result *= n - i;
  return result;
}

// n comb r, built multiplicatively so every intermediate stays an integer.
export function combExact(n: bigint, r: bigint): bigint | null {
  if (r < 0n || n < r) return null;
  const k = r < n - r ? r : n - r;
  if (k > MAX_TERMS) return null;
  let result = 1n;
  for (let i = 1n; i <= k; i++) result = (result * (n - k + i)) / i;
  return result;
}

export function gcdExact(...values: bigint[]): bigint {
  let g = 0n;
  for (const v of values) {
    let a = abs(g);
    let b = abs(v);
    while (b) [a, b] = [b, a % b];
    g = a;
  }
  return g;
}

export function lcmExact(...values: bigint[]): bigint {
  let l = 1n;
  for (const v of values) {
    if (v === 0n) return 0n;
    l = abs((l / gcdExact(l, v)) * v);
  }
  return l;
}

// base^exp mod m by square-and-multiply, so the power is never materialised
// (`powmod(7, 10^18, 1000)` is instant). The result is in [0, |m|).
export function powmodExact(base: bigint, exp: bigint, m: bigint): bigint {
  if (m === 0n) throw new RangeError("modulus is zero");
  const mod = abs(m);
  if (mod === 1n) return 0n;
  let result = 1n;
  let b = ((base % mod) + mod) % mod;
  let e = exp;
  while (e > 0n) {
    if (e & 1n) result = (result * b) % mod;
    b = (b * b) % mod;
    e >>= 1n;
  }
  return result;
}

// floor(√n) for n ≥ 0 (Newton's method on integers).
export function isqrt(n: bigint): bigint {
  if (n < 2n) return n;
  let x = BigInt(Math.floor(Math.sqrt(Number(n))));
  // The float guess can be off either way for huge n; Newton settles it.
  if (x === 0n) x = 1n;
  for (;;) {
    const y = (x + n / x) >> 1n;
    if (y >= x && y - x <= 1n) break;
    x = y;
  }
  while (x * x > n) x -= 1n;
  while ((x + 1n) * (x + 1n) <= n) x += 1n;
  return x;
}

// Miller–Rabin with the first 13 prime bases: deterministic below 3.3·10^24,
// and a vanishingly small error probability beyond.
export function isPrimeExact(n: bigint): boolean {
  if (n < 2n) return false;
  const bases = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n, 41n];
  for (const p of bases) if (n % p === 0n) return n === p;
  let d = n - 1n;
  let s = 0;
  while (d % 2n === 0n) {
    d /= 2n;
    s++;
  }
  outer: for (const a of bases) {
    let x = powmodExact(a, d, n);
    if (x === 1n || x === n - 1n) continue;
    for (let i = 1; i < s; i++) {
      x = (x * x) % n;
      if (x === n - 1n) continue outer;
    }
    return false;
  }
  return true;
}

// a / b as a float, even when a or b is too large for a float on its own.
export function ratio(a: bigint, b: bigint): number {
  const shift =
    Math.max(abs(a).toString().length, abs(b).toString().length) - 300;
  if (shift <= 0) return Number(a) / Number(b);
  const p = 10n ** BigInt(shift);
  return Number(a / p) / Number(b / p);
}

// Grouped full digits (`1,267,650,600,228,229,401,496,703,205,376`), or
// 11-significant-digit scientific notation past MAX_DISPLAY_DIGITS.
export function formatExactInteger(n: bigint): string {
  const digits = abs(n).toString();
  if (digits.length <= MAX_DISPLAY_DIGITS) return n.toLocaleString();
  let lead = String(Math.round(Number(digits.slice(0, 12)) / 10));
  let exponent = digits.length - 1;
  if (lead.length > 11) {
    lead = lead.slice(0, 11);
    exponent += 1;
  }
  const mantissa = `${lead[0]}.${lead.slice(1)}`.replace(/\.?0+$/, "");
  return `${n < 0n ? "-" : ""}${mantissa}E${exponent}`;
}
