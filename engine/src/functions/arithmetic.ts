// biome-ignore-all assist/source/organizeImports: ./tokens/compound must be
// imported after the unit_types/token_factory/plurals modules below; alphabetical
// sorting would pull it earlier and break the engine's module-init order
// (plurals.ts reads Units before unit_types finishes). Keep compound's import last.
import chroma from "chroma-js";
import {
  combination,
  decimalToFraction,
  divisors,
  isPrime,
} from "../arithmetic_functions";
import {
  gcdExact,
  isPrimeExact,
  isSafe,
  lcmExact,
  powmodExact,
} from "../exact";
import {
  angleBetween,
  angularAxes,
  type CoordSystem,
  cross,
  dot,
  euclidean,
  expectedArity,
  magnitude,
  midpoint,
  minkowskiInterval,
  normalize,
  radToDeg,
} from "../coordinates";
import { UserError } from "../exceptions";
import * as ip from "../ip";
import * as mat from "../matrix";
import { hashText, type HashName } from "../hash";
import { mulberry32, nanoidId, seededUuidV4, seededUuidV7 } from "../random";
import TokenBaseType, { type TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import {
  BooleanToken,
  ColorToken,
  ComplexToken,
  convertPointToken,
  type expressionUnit,
  FractionToken,
  IpToken,
  ListToken,
  MatrixToken,
  NumberToken,
  type PlotSeries,
  PlotToken,
  PointToken,
  SeedToken,
  TextToken,
  type UnitToken,
} from "../tokens/tokens";
import UnitTypes from "../types/unit_enum";
import ProcessConversions from "../units_processor";

// New calculator domains, kept as a separate trailing import group (the blank
// line above stops the import organizer from folding them into the block above
// and re-sorting them). The engine graph has a unit_types ↔ token_factory ↔
// plurals load-order cycle; pulling ./tokens/compound in *after* the modules
// above ensures `Units` is defined before plurals.ts reads it. geometry/health
// otherwise depend only on ./exceptions.
import {
  boxVolume,
  circleArea,
  circleCircumference,
  coneSurfaceArea,
  coneVolume,
  cubeSurfaceArea,
  cubeVolume,
  cylinderSurfaceArea,
  cylinderVolume,
  ellipseArea,
  heronArea,
  lineSlope,
  parallelogramArea,
  pyramidVolume,
  rectangleArea,
  rectanglePerimeter,
  sphereSurfaceArea,
  sphereVolume,
  squareArea,
  squarePerimeter,
  trapezoidArea,
  triangleArea,
} from "../geometry_functions";
import {
  bmi,
  bmrFemale,
  bmrMale,
  bodyFatFemale,
  bodyFatMale,
  caloriesBurned,
  devineFemale,
  devineMale,
  maxHeartRate,
  waterIntakeLiters,
} from "../health_functions";
import { scaleUnit } from "../tokens/compound";
import type { FunctionDef, RawFn } from "./types";
import { money, need, pct, plain, type SetExplicit } from "./util";

export const arithmeticFunctions: Record<string, FunctionDef> = {
  abs: {
    run: absolute,
    exact: (...v) => (v.length === 1 ? (v[0] < 0n ? -v[0] : v[0]) : null),
    description: "Absolute value",
    isRaw: false,
  },
  lcm: {
    run: getLCM,
    exact: (...v) => (v.length < 2 ? null : lcmExact(...v)),
    description: "Find least common multiple from a range of numbers",
    isRaw: false,
  },
  gcd: {
    run: getGCD,
    exact: (...v) => (v.length < 2 ? null : gcdExact(...v)),
    description: "Find greatest common divisor from a range of numbers",
    isRaw: false,
  },

  // ---- Rounding -----------------------------------------------------------
  floor: {
    run: roundingFn("floor"),
    description: "Round down, to an integer or n decimal places: floor(x, [n])",
    isRaw: true,
  },
  ceil: {
    run: roundingFn("ceil"),
    description: "Round up, to an integer or n decimal places: ceil(x, [n])",
    isRaw: true,
  },
  round: {
    run: roundingFn("round"),
    description:
      "Round half away from zero, to an integer or n decimal places: round(x, [n])",
    isRaw: true,
  },

  // Modular exponentiation, exact at any size: powmod(7, 222, 1000) → 49.
  powmod: {
    run: () => {
      throw new UserError(7812);
    },
    exact: (base, exp, mod) =>
      exp === undefined || mod === undefined || exp < 0n || mod === 0n
        ? null
        : powmodExact(base, exp, mod),
    description: "Modular exponentiation: powmod(base, exponent, modulus)",
    isRaw: false,
  },

  // ---- Number theory ----------------------------------------------------
  // All raw: each returns a non-number result token (BooleanToken /
  // FractionToken / ListToken). They take a single pre-solved numeric
  // argument, ignoring any unit. See ./arithmetic_functions.ts for the math.
  isprime: {
    run: isPrimeFn,
    description: "Whether a number is prime (e.g. isprime(7))",
    isRaw: true,
  },
  fraction: {
    run: fractionFn,
    description: "Reduce a decimal to a fraction (e.g. fraction(0.75) → 3/4)",
    isRaw: true,
  },
  "mixed fraction": {
    run: mixedFractionFn,
    description:
      "Reduce a decimal to a mixed number (e.g. mixed fraction(2.5) → 2 1/2)",
    isRaw: true,
  },
  factors: {
    run: factorsFn,
    description: "All divisors of a positive integer (e.g. factors(12))",
    isRaw: true,
  },
};

// floor / ceil / round to an integer, or to `digits` decimal places (negative
// digits round to tens, hundreds, …). The unit is kept. `round` goes half away
// from zero (2.5 → 3, -2.5 → -3); an exact integer stays exact.
function roundingFn(mode: "floor" | "ceil" | "round"): RawFn {
  return (args) => {
    const [x, d] = args;
    if (args.length > 2 || !(x instanceof NumberToken))
      throw new UserError(7810);
    let digits = 0;
    if (d !== undefined) {
      if (!(d instanceof NumberToken) || d.unit) throw new UserError(7811);
      digits = d.toNumber();
      if (!Number.isInteger(digits)) throw new UserError(7811);
    }
    const exact = x.exactValue();
    if (exact !== null) {
      if (digits >= 0) return x;
      const result = NumberToken.fromExact(roundExact(exact, -digits, mode));
      result.unit = x.unit;
      return result;
    }
    const v = x.toNumber();
    // Shift the decimal point in the digit string (`1.005e2`), not by
    // multiplying — 1.005 * 100 is 100.49999999999999 in floating point.
    const text = String(Math.abs(v));
    const scaled = text.includes("e")
      ? Math.abs(v) * 10 ** digits
      : Number(`${text}e${digits}`);
    const signed = v < 0 ? -scaled : scaled;
    const whole =
      mode === "floor"
        ? Math.floor(signed)
        : mode === "ceil"
          ? Math.ceil(signed)
          : Math.sign(signed) * Math.round(Math.abs(signed));
    const shifted = String(Math.abs(whole));
    const value = shifted.includes("e")
      ? whole / 10 ** digits
      : Math.sign(whole) * Number(`${shifted}e${-digits}`);
    const result = tokenFactory(
      (Object.is(value, -0) ? 0 : value).toString(),
      x.numbertype,
    ) as NumberToken;
    result.unit = x.unit;
    return result;
  };
}

// Round an exact integer to a multiple of 10^places.
function roundExact(
  n: bigint,
  places: number,
  mode: "floor" | "ceil" | "round",
): bigint {
  const step = 10n ** BigInt(places);
  let q = n / step;
  const r = n % step;
  if (mode === "floor" && r < 0n) q -= 1n;
  if (mode === "ceil" && r > 0n) q += 1n;
  if (mode === "round" && 2n * (r < 0n ? -r : r) >= step)
    q += r < 0n ? -1n : 1n;
  return q * step;
}

function absolute(...params: number[]) {
  if (params.length > 1) throw new UserError(12343);
  return Math.abs(params[0]);
}

function getLCM(...numbers: number[]) {
  if (numbers.length < 2) throw new UserError(5209);

  let resultLCM = numbers[0];
  for (let i = 1; i < numbers.length; i++)
    resultLCM = lcm(resultLCM, numbers[i]);

  return resultLCM;
}

function getGCD(...numbers: number[]) {
  if (numbers.length < 2) throw new UserError(5309);

  let resultGCD = numbers[0];
  for (let i = 1; i < numbers.length; i++)
    resultGCD = gcd(resultGCD, numbers[i]);

  return resultGCD;
}

function gcd(a: number, b: number) {
  if (b === 0) return a;

  return gcd(b, a % b);
}

function lcm(a: number, b: number) {
  return (a * b) / gcd(a, b);
}

// ---- Number theory ------------------------------------------------------

// Read the single numeric argument, ignoring any unit. Wrong arity or a
// non-number argument is a user error.
function singleNumber(args: TokenType[], code: number): number {
  if (args.length !== 1) throw new UserError(code);
  const a = args[0];
  if (!(a instanceof NumberToken)) throw new UserError(code);
  return a.toNumber();
}

// Exact integers of any size get a Miller–Rabin test; a float past 2^53 has
// already lost digits, so there is no honest answer for it.
function isPrimeFn(args: TokenType[]): BooleanToken {
  const n = singleNumber(args, 7801);
  const exact = (args[0] as NumberToken).exactValue();
  if (exact !== null) return new BooleanToken(isPrimeExact(exact));
  if (Number.isInteger(n) && Math.abs(n) > Number.MAX_SAFE_INTEGER)
    throw new UserError(7806);
  return new BooleanToken(isPrime(n));
}

function fractionFn(args: TokenType[]): FractionToken {
  const { numerator, denominator } = decimalToFraction(
    singleNumber(args, 7802),
  );
  return new FractionToken(numerator, denominator, false);
}

function mixedFractionFn(args: TokenType[]): FractionToken {
  const { numerator, denominator } = decimalToFraction(
    singleNumber(args, 7802),
  );
  return new FractionToken(numerator, denominator, true);
}

function factorsFn(args: TokenType[]): ListToken {
  const n = singleNumber(args, 7803);
  const exact = (args[0] as NumberToken).exactValue();
  if (
    Math.abs(n) > Number.MAX_SAFE_INTEGER ||
    (exact !== null && !isSafe(exact))
  )
    throw new UserError(7807);
  return new ListToken(divisors(n));
}
