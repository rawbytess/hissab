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
import type { FunctionDef } from "./types";
import { money, need, pct, plain, type SetExplicit } from "./util";

export const arithmeticFunctions: Record<string, FunctionDef> = {
  abs: {
    run: absolute,
    description: "Absolute value",
    isRaw: false,
  },
  lcm: {
    run: getLCM,
    description: "Find least common multiple from a range of numbers",
    isRaw: false,
  },
  gcd: {
    run: getGCD,
    description: "Find greatest common divisor from a range of numbers",
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

function isPrimeFn(args: TokenType[]): BooleanToken {
  return new BooleanToken(isPrime(singleNumber(args, 7801)));
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
  return new ListToken(divisors(singleNumber(args, 7803)));
}
