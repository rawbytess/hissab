import { UserError } from "./exceptions";

function factorial(n: number): number {
  let res = n;
  if (n === 0 || n === 1) res = 1;
  else {
    while (n > 1) {
      n -= 1;
      res *= n;
    }
  }
  return res;
}

function combination(n: number, r: number): number {
  if (n < r) throw new UserError(6743);
  if (n === r) return 1;

  return factorial(n) / (factorial(r) * factorial(n - r));
}

function permutation(n: number, r: number): number {
  if (n < r) throw new UserError(7453);
  if (n === r) return 1;

  return factorial(n) / factorial(n - r);
}

// Primality test. Non-integers and anything below 2 are not prime; otherwise
// trial-divide by 2, 3, and 6k±1 up to √n.
function isPrime(n: number): boolean {
  if (!Number.isInteger(n) || n < 2) return false;
  if (n < 4) return true;
  if (n % 2 === 0 || n % 3 === 0) return false;
  for (let i = 5; i * i <= n; i += 6) {
    if (n % i === 0 || n % (i + 2) === 0) return false;
  }
  return true;
}

// All divisors of a positive integer, ascending. Pairs i with n/i for i up to
// √n, deduping the perfect-square middle.
function divisors(n: number): number[] {
  if (!Number.isInteger(n) || n < 1) throw new UserError(7803);
  const small: number[] = [];
  const large: number[] = [];
  for (let i = 1; i * i <= n; i++) {
    if (n % i === 0) {
      small.push(i);
      if (i !== n / i) large.push(n / i);
    }
  }
  return small.concat(large.reverse());
}

// Approximate a decimal as a reduced fraction via the continued-fraction
// (Stern–Brocot) convergents. Stops once the convergent is within a small
// relative epsilon of x or its denominator would exceed maxDenominator, so
// repeating decimals collapse cleanly (0.333… → 1/3, not 333…/1000…). The
// convergents are coprime by construction, so the result is already reduced.
function decimalToFraction(
  x: number,
  maxDenominator = 1_000_000,
): { numerator: number; denominator: number } {
  if (!Number.isFinite(x)) throw new UserError(7804);
  const sign = x < 0 ? -1 : 1;
  const value = Math.abs(x);
  if (Number.isInteger(value))
    return { numerator: sign * value, denominator: 1 };

  const epsilon = Math.max(Math.abs(x) * 1e-12, 1e-12);
  let prevNum = 0;
  let prevDen = 1;
  let num = 1;
  let den = 0;
  let b = value;
  do {
    const a = Math.floor(b);
    const nextNum = a * num + prevNum;
    const nextDen = a * den + prevDen;
    if (nextDen > maxDenominator) break;
    prevNum = num;
    prevDen = den;
    num = nextNum;
    den = nextDen;
    const frac = b - a;
    if (frac === 0) break;
    b = 1 / frac;
  } while (Math.abs(value - num / den) > epsilon);

  return { numerator: sign * num, denominator: den };
}

export {
  combination,
  decimalToFraction,
  divisors,
  factorial,
  isPrime,
  permutation,
};
