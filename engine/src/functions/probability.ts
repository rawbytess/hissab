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

export const probabilityFunctions: Record<string, FunctionDef> = {
  // ---- Probability ------------------------------------------------------
  // All raw: they read the argument *tokens* so P() can honour a `%` flag and
  // so results can be tagged `.probability = true`. A probability is a plain
  // dimensionless NumberToken in [0,1]; the AND/OR/NOT operations are the
  // `&` / `|` / `~` operators (see makeBitwiseFunc in operator_types.ts), which
  // overload onto the probability tag. These functions cover everything that
  // isn't a binary operator. Independence is assumed for combinations.
  p: {
    run: probabilityFn,
    description:
      "Define a probability: P(0.1) → 0.1 (accepts a percent: P(10%) → 0.1)",
    isRaw: true,
  },
  probability: {
    run: probabilityFn,
    description: "Define a probability (alias of P)",
    isRaw: true,
  },
  conditional: {
    run: conditionalFn,
    description:
      "Conditional probability P(A|B) = P(A and B) / P(B): conditional(pAandB, pB)",
    isRaw: true,
  },
  bayes: {
    run: bayesFn,
    description:
      "Bayes' theorem posterior P(H|E): bayes(prior, likelihood, likelihoodGivenNot)",
    isRaw: true,
  },
  odds: {
    run: oddsFn,
    description: "Odds for a probability: odds(p) = p / (1 - p)",
    isRaw: true,
  },
  "probability from odds": {
    run: probabilityFromOddsFn,
    description: "Probability implied by odds o: o / (1 + o)",
    isRaw: true,
  },
  binomial: {
    run: binomialFn,
    description:
      "Binomial probability of k successes in n trials: binomial(n, k, p) = C(n,k)·p^k·(1-p)^(n-k)",
    isRaw: true,
  },
  "expected value": {
    run: expectedValueFn,
    description:
      "Expected value of value/probability pairs: expected value(v1, p1, v2, p2, …)",
    isRaw: true,
  },
};

// ---- Probability --------------------------------------------------------

// Validate argument count and surface the args as NumberTokens. Each
// probability argument is pre-solved in its own sub-ParseTree, so a `%` literal
// already carries the divided-by-100 value (10% → 0.1).
function probArgs(args: TokenType[], n: number, code: number): NumberToken[] {
  if (args.length !== n) throw new UserError(code);
  for (const a of args)
    if (!(a instanceof NumberToken)) throw new UserError(code);
  return args as NumberToken[];
}

// A probability must lie in [0,1].
function assertProb(value: number, code: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 1)
    throw new UserError(code);
  return value;
}

// Build a NumberToken tagged as a probability so `&`/`|`/`~` overload onto it
// and so chained operations keep their probability semantics.
function probToken(value: number): NumberToken {
  const result = plain(value);
  result.probability = true;
  return result;
}

function probabilityFn(args: TokenType[]): NumberToken {
  const [x] = probArgs(args, 1, 7901);
  return probToken(assertProb(x.toNumber(), 7901));
}

function conditionalFn(args: TokenType[]): NumberToken {
  const [joint, given] = probArgs(args, 2, 7902);
  const pB = assertProb(given.toNumber(), 7902);
  if (pB === 0) throw new UserError(7902);
  const pAB = assertProb(joint.toNumber(), 7902);
  return probToken(assertProb(pAB / pB, 7902));
}

function bayesFn(args: TokenType[]): NumberToken {
  const [priorT, likelihoodT, likelihoodNotT] = probArgs(args, 3, 7903);
  const prior = assertProb(priorT.toNumber(), 7903);
  const likelihood = assertProb(likelihoodT.toNumber(), 7903);
  const likelihoodNot = assertProb(likelihoodNotT.toNumber(), 7903);
  const evidence = prior * likelihood + (1 - prior) * likelihoodNot;
  if (evidence === 0) throw new UserError(7903);
  return probToken((prior * likelihood) / evidence);
}

function oddsFn(args: TokenType[]): NumberToken {
  const [p] = probArgs(args, 1, 7904);
  const value = assertProb(p.toNumber(), 7904);
  if (value === 1) throw new UserError(7904);
  // A ratio, not itself a probability — left untagged.
  return plain(value / (1 - value));
}

function probabilityFromOddsFn(args: TokenType[]): NumberToken {
  const [o] = probArgs(args, 1, 7906);
  const odds = o.toNumber();
  if (!Number.isFinite(odds) || odds < 0) throw new UserError(7906);
  return probToken(odds / (1 + odds));
}

function binomialFn(args: TokenType[]): NumberToken {
  const [nT, kT, pT] = probArgs(args, 3, 7907);
  const n = nT.toNumber();
  const k = kT.toNumber();
  const p = assertProb(pT.toNumber(), 7907);
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n)
    throw new UserError(7907);
  return probToken(combination(n, k) * p ** k * (1 - p) ** (n - k));
}

function expectedValueFn(args: TokenType[]): NumberToken {
  if (args.length < 2 || args.length % 2 !== 0) throw new UserError(7908);
  for (const a of args)
    if (!(a instanceof NumberToken)) throw new UserError(7908);
  const pairs = args as NumberToken[];
  let total = 0;
  for (let i = 0; i < pairs.length; i += 2) {
    const value = pairs[i].toNumber();
    const prob = assertProb(pairs[i + 1].toNumber(), 7908);
    total += value * prob;
  }
  // A weighted sum of outcome values — a number, not a probability.
  return plain(total);
}
