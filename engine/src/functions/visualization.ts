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

export const visualizationFunctions: Record<string, FunctionDef> = {
  // ---- Visualization ----------------------------------------------------
  // draw()/plot() produce a PlotToken describing what to graph; the engine does
  // no rendering (the app reads the series and plots it). When an argument
  // carries a free symbol the whole call is symbolic, so it is intercepted in
  // parser.ts (which builds curve series). This `run` fires only for the purely
  // numeric path: complex numbers (Argand plane) and coordinate points.
  draw: {
    run: drawFn,
    description:
      "Graph one or more curves/points: draw(x^2), draw(sin(x), cos(x)), draw(3+4i), draw(point(1,2))",
    isRaw: true,
  },
  plot: {
    run: drawFn,
    description: "Graph expressions/points (alias of draw)",
    isRaw: true,
  },
};

// ---- Visualization ------------------------------------------------------

// Numeric draw(): build a PlotToken from already-solved operand tokens. Symbolic
// curves never reach here (parser.ts handles them); this covers complex numbers
// and coordinate points. A bare real number plots as a point on the real axis.
function drawFn(args: TokenType[]): PlotToken {
  if (args.length === 0) throw new UserError(8250);
  const series: PlotSeries[] = args.map((a) => {
    if (a instanceof ComplexToken)
      return { type: "complex", re: a.re, im: a.im, label: a.getString() };
    if (a instanceof PointToken)
      return { type: "point", coords: a.cartesian(), label: a.getString() };
    if (a instanceof NumberToken)
      return { type: "complex", re: a.toNumber(), im: 0, label: a.getString() };
    throw new UserError(8251);
  });
  return new PlotToken(series);
}
