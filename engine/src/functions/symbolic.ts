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

export const symbolicFunctions: Record<string, FunctionDef> = {
  // ---- Symbolic / algebra -----------------------------------------------
  // Registered so the lexer tokenises `simplify(...)`, `derivative(...)`,
  // `integrate(...)`, `limit(...)`. When an argument carries a free symbol the
  // whole call is routed to the symbolic subsystem (see parser.ts / from_tree.ts)
  // which builds the Expr AST node and renders it, so these `run`s fire only for
  // purely numeric arguments. `simplify(5)` is the identity; the calculus
  // keywords require a symbolic variable and otherwise error.
  simplify: {
    run: symbolicIdentity,
    description: "Simplify an algebraic expression to canonical form",
    isRaw: true,
  },
  derivative: {
    run: requiresSymbol,
    description: "Derivative w.r.t. a variable: derivative(2x^2, x)",
    isRaw: true,
  },
  diff: {
    run: requiresSymbol,
    description: "Derivative (alias of derivative)",
    isRaw: true,
  },
  integrate: {
    run: requiresSymbol,
    description: "Integral: integrate(2x^2, x) or integrate(2x^2, x, 0, 50)",
    isRaw: true,
  },
  integral: {
    run: requiresSymbol,
    description: "Integral (alias of integrate)",
    isRaw: true,
  },
  limit: {
    run: requiresSymbol,
    description: "Limit: limit(2x^2, x, 0)",
    isRaw: true,
  },
};

// `simplify(<numeric>)` is the identity (a symbolic argument is intercepted
// before this runs). A bare symbol or symbolic expression never reaches here.
function symbolicIdentity(args: TokenType[]): TokenType {
  if (args.length !== 1) throw new UserError(8806);
  return args[0];
}

// Calculus keywords are only meaningful with a symbolic variable; with purely
// numeric arguments there is nothing to differentiate/integrate against.
function requiresSymbol(): never {
  throw new UserError(8805);
}
