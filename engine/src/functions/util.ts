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
  type NumberToken,
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

// ---- Finance helpers ----------------------------------------------------

export type SetExplicit = (isExplicit: boolean) => void;

// Validate argument count and surface the args as NumberTokens. Finance args
// always resolve to numbers (each is pre-solved in its own sub-ParseTree).
export function need(
  args: TokenType[],
  min: number,
  max: number,
  code: number,
): NumberToken[] {
  if (args.length < min || args.length > max) throw new UserError(code);
  return args as NumberToken[];
}

// Build a plain numeric result token (used for counts/percentages).
export function plain(value: number): NumberToken {
  return tokenFactory(value.toString(), TokenBaseType.DECIMAL) as NumberToken;
}

// Build a rate result expressed as a percentage value (0.125 → 12.5).
export function pct(fraction: number): NumberToken {
  return plain(fraction * 100);
}

// Build a monetary result. If the principal carries a currency unit, propagate
// it to the result and mark the result explicit so it renders as currency.
export function money(
  value: number,
  principal: NumberToken,
  setIsExplicit: SetExplicit,
): NumberToken {
  const result = plain(value);
  const unit = principal.unit;
  if (unit && unit.unitdata.type === UnitTypes.CURRENCY) {
    result.unit = unit;
    setIsExplicit(true);
  }
  return result;
}

// A rate may be written as a percent (`5%` → already 0.05, percent flag set) or
// as a bare number meaning that many percent (`5` → 0.05). Either way we return
// the decimal fraction.
export function readRate(token: NumberToken): number {
  return token.percent ? token.toNumber() : token.toNumber() / 100;
}
