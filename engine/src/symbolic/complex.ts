// Pure complex-number arithmetic over { re, im } pairs. No engine tokens here —
// ComplexToken (tokens.ts) and the +,-,*,/,^ operators (operator_types.ts) wrap
// these. Complex numbers are a *closed numeric domain*, so unlike the symbolic
// AST they ride the engine's ordinary eager solve().

export interface Cx {
  re: number;
  im: number;
}

export const cx = (re: number, im = 0): Cx => ({ re, im });

export function cxAdd(a: Cx, b: Cx): Cx {
  return { re: a.re + b.re, im: a.im + b.im };
}

export function cxSub(a: Cx, b: Cx): Cx {
  return { re: a.re - b.re, im: a.im - b.im };
}

export function cxMul(a: Cx, b: Cx): Cx {
  return {
    re: a.re * b.re - a.im * b.im,
    im: a.re * b.im + a.im * b.re,
  };
}

export function cxDiv(a: Cx, b: Cx): Cx {
  const denom = b.re * b.re + b.im * b.im;
  return {
    re: (a.re * b.re + a.im * b.im) / denom,
    im: (a.im * b.re - a.re * b.im) / denom,
  };
}

export function cxAbs(a: Cx): number {
  return Math.hypot(a.re, a.im);
}

// Natural log of a complex number: ln|a| + i·arg(a).
export function cxLn(a: Cx): Cx {
  return { re: Math.log(cxAbs(a)), im: Math.atan2(a.im, a.re) };
}

// Complex exponential: e^a = e^re · (cos im + i·sin im).
export function cxExp(a: Cx): Cx {
  const r = Math.exp(a.re);
  return { re: r * Math.cos(a.im), im: r * Math.sin(a.im) };
}

// a ^ b. Integer real exponents use exact repeated multiplication (so i^2 is
// exactly -1, with no floating-point fuzz); everything else uses the principal
// branch via exp(b · ln a).
export function cxPow(a: Cx, b: Cx): Cx {
  if (b.im === 0 && Number.isInteger(b.re)) {
    let n = b.re;
    if (n === 0) return { re: 1, im: 0 };
    const negative = n < 0;
    n = Math.abs(n);
    let result: Cx = { re: 1, im: 0 };
    let pow: Cx = { re: a.re, im: a.im };
    while (n > 0) {
      if (n & 1) result = cxMul(result, pow);
      pow = cxMul(pow, pow);
      n >>= 1;
    }
    return negative ? cxDiv({ re: 1, im: 0 }, result) : result;
  }
  // a == 0 is handled by the integer branch (0^n); the principal branch below
  // would hit ln(0) for a non-integer exponent — leave that as the usual NaN.
  return cxExp(cxMul(b, cxLn(a)));
}

// Round away floating-point dust introduced by trig/exp so results like i*i
// render cleanly as -1 rather than -1 + 1.2e-16 i.
function clean(n: number): number {
  if (Math.abs(n) < 1e-12) return 0;
  const rounded = Math.round(n);
  if (Math.abs(n - rounded) < 1e-12) return rounded;
  return parseFloat(n.toFixed(10));
}

// Render a complex value: "5", "i", "-i", "3i", "2 + 3i", "2 - 3i".
export function cxString(a: Cx): string {
  const re = clean(a.re);
  const im = clean(a.im);
  if (im === 0) return formatReal(re);
  const imag = formatImag(im);
  if (re === 0) return imag;
  return im < 0
    ? `${formatReal(re)} - ${formatImag(-im)}`
    : `${formatReal(re)} + ${imag}`;
}

function formatReal(n: number): string {
  return Number.isInteger(n)
    ? n.toString()
    : parseFloat(n.toFixed(4)).toString();
}

function formatImag(n: number): string {
  if (n === 1) return "i";
  if (n === -1) return "-i";
  return `${formatReal(n)}i`;
}
