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
  type ColorToken,
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

export const colorFunctions: Record<string, FunctionDef> = {
  rgb: {
    run: rgbColor,
    description: "Represent color in RGB format",
    isRaw: true,
  },
  hsl: {
    run: hslColor,
    description: "Represent color in HSL format",
    isRaw: true,
  },
};

function rgbColor(...params: any[]): any {
  if (params[0].length < 3 || params[0].length > 4) throw new UserError(63434);
  const [redT, greenT, blueT, alphaT] = params[0];
  const red = redT.toNumber();
  const green = greenT.toNumber();
  const blue = blueT.toNumber();
  const alpha = alphaT?.toNumber() || 1;
  if (!chroma.valid([red, green, blue, alpha])) throw new UserError(976);
  const color = chroma(red, green, blue, alpha);

  const colorToken: ColorToken = tokenFactory(
    color.hex(),
    TokenBaseType.COLOR,
  ) as ColorToken;
  colorToken.unit = alphaT ? "RGBA" : "RGB";
  return colorToken;
}

function hslColor(...params: any[]): any {
  if (params[0].length !== 3) throw new UserError(63434);
  const [hueT, saturationT, lightT] = params[0];
  const hue = hueT.toNumber();
  const saturation = saturationT.toNumber();
  const light = lightT.toNumber();
  const color = chroma(hue, saturation, light, "hsl");

  const colorToken: ColorToken = tokenFactory(
    color.hex(),
    TokenBaseType.COLOR,
  ) as ColorToken;
  colorToken.unit = "HSL";
  return colorToken;
}
