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

export const geometryFunctions: Record<string, FunctionDef> = {
  // ---- Geometry ---------------------------------------------------------
  // Area / perimeter / surface-area / volume of common shapes, plus line
  // slope. Raw so a length unit on the arguments carries into the result
  // (meter → meter^2 for an area, meter^3 for a volume). The shape is the
  // leading word so names never collide with units. See ./geometry_functions.ts.
  "circle area": {
    run: circleAreaFn,
    description: "Area of a circle: π·r² — circle area(radius)",
    isRaw: true,
  },
  "circle circumference": {
    run: circleCircumferenceFn,
    description: "Circumference of a circle: 2·π·r",
    isRaw: true,
  },
  "circle perimeter": {
    run: circleCircumferenceFn,
    description: "Circumference of a circle (alias of circle circumference)",
    isRaw: true,
  },
  "square area": {
    run: squareAreaFn,
    description: "Area of a square: side²",
    isRaw: true,
  },
  "square perimeter": {
    run: squarePerimeterFn,
    description: "Perimeter of a square: 4·side",
    isRaw: true,
  },
  "rectangle area": {
    run: rectangleAreaFn,
    description: "Area of a rectangle: width·height",
    isRaw: true,
  },
  "rectangle perimeter": {
    run: rectanglePerimeterFn,
    description: "Perimeter of a rectangle: 2·(width + height)",
    isRaw: true,
  },
  "triangle area": {
    run: triangleAreaFn,
    description:
      "Area of a triangle: ½·base·height, or Heron's from three sides",
    isRaw: true,
  },
  "trapezoid area": {
    run: trapezoidAreaFn,
    description: "Area of a trapezoid: ½·(a + b)·height",
    isRaw: true,
  },
  "parallelogram area": {
    run: parallelogramAreaFn,
    description: "Area of a parallelogram: base·height",
    isRaw: true,
  },
  "ellipse area": {
    run: ellipseAreaFn,
    description: "Area of an ellipse: π·a·b (semi-axes a, b)",
    isRaw: true,
  },
  "sphere volume": {
    run: sphereVolumeFn,
    description: "Volume of a sphere: 4/3·π·r³",
    isRaw: true,
  },
  "sphere surface area": {
    run: sphereSurfaceAreaFn,
    description: "Surface area of a sphere: 4·π·r²",
    isRaw: true,
  },
  "sphere area": {
    run: sphereSurfaceAreaFn,
    description: "Surface area of a sphere (alias of sphere surface area)",
    isRaw: true,
  },
  "cube volume": {
    run: cubeVolumeFn,
    description: "Volume of a cube: side³",
    isRaw: true,
  },
  "cube surface area": {
    run: cubeSurfaceAreaFn,
    description: "Surface area of a cube: 6·side²",
    isRaw: true,
  },
  "cylinder volume": {
    run: cylinderVolumeFn,
    description: "Volume of a cylinder: π·r²·height",
    isRaw: true,
  },
  "cylinder surface area": {
    run: cylinderSurfaceAreaFn,
    description: "Surface area of a closed cylinder: 2·π·r·(r + height)",
    isRaw: true,
  },
  "cone volume": {
    run: coneVolumeFn,
    description: "Volume of a cone: 1/3·π·r²·height",
    isRaw: true,
  },
  "cone surface area": {
    run: coneSurfaceAreaFn,
    description: "Surface area of a cone: π·r·(r + √(r² + h²))",
    isRaw: true,
  },
  "rectangular prism volume": {
    run: boxVolumeFn,
    description: "Volume of a rectangular prism (box): length·width·height",
    isRaw: true,
  },
  "box volume": {
    run: boxVolumeFn,
    description: "Volume of a box (alias of rectangular prism volume)",
    isRaw: true,
  },
  "pyramid volume": {
    run: pyramidVolumeFn,
    description: "Volume of a rectangular pyramid: 1/3·length·width·height",
    isRaw: true,
  },
  slope: {
    run: slopeFn,
    description: "Slope of the line through two points: slope(x1, y1, x2, y2)",
    isRaw: true,
  },
};

// ---- Geometry -----------------------------------------------------------

// The common length unit across the numeric args, or null when the args carry
// no length unit or a mix of different length units. Used to dimension a
// shape result (a single side's unit, raised to the shape's power).
function lengthUnitOf(args: TokenType[]): UnitToken | null {
  let found: UnitToken | null = null;
  for (const a of args) {
    if (!(a instanceof NumberToken)) continue;
    const u = a.unit;
    if (!u || u.unitdata.type !== UnitTypes.LENGTH) continue;
    if (!found) found = u;
    else if (u.value !== found.value || u.factor !== found.factor) return null;
  }
  return found;
}

// Build a geometry result, attaching the args' length unit raised to
// `exponent` (1 = length, 2 = area, 3 = volume) when present. A compound
// area/volume unit renders as `meter^2` / `meter^3`; a length result (exponent
// 1) humanizes like any other length. A unitless input stays a plain number.
// Build a geometry result, attaching the args' length unit raised to
// `exponent` (1 = length, 2 = area, 3 = volume) when present, and marking the
// result explicit so it renders on one line (`78.5398 meter^2`, `31.4159
// meter`) rather than humanizing a length into a metric breakdown. A unitless
// input stays a plain number.
function geomResult(
  value: number,
  args: TokenType[],
  exponent: number,
  setIsExplicit: SetExplicit,
): NumberToken {
  const r = plain(value);
  const unit = scaleUnit(lengthUnitOf(args), exponent);
  if (unit) {
    r.unit = unit;
    setIsExplicit(true);
  }
  return r;
}

function circleAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [r] = need(args, 1, 1, 9601);
  return geomResult(circleArea(r.toNumber()), args, 2, setExplicit);
}

function circleCircumferenceFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [r] = need(args, 1, 1, 9602);
  return geomResult(circleCircumference(r.toNumber()), args, 1, setExplicit);
}

function squareAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [s] = need(args, 1, 1, 9603);
  return geomResult(squareArea(s.toNumber()), args, 2, setExplicit);
}

function squarePerimeterFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [s] = need(args, 1, 1, 9604);
  return geomResult(squarePerimeter(s.toNumber()), args, 1, setExplicit);
}

function rectangleAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [w, h] = need(args, 2, 2, 9605);
  return geomResult(
    rectangleArea(w.toNumber(), h.toNumber()),
    args,
    2,
    setExplicit,
  );
}

function rectanglePerimeterFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [w, h] = need(args, 2, 2, 9606);
  return geomResult(
    rectanglePerimeter(w.toNumber(), h.toNumber()),
    args,
    1,
    setExplicit,
  );
}

function triangleAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const a = need(args, 2, 3, 9607);
  const value =
    a.length === 3
      ? heronArea(a[0].toNumber(), a[1].toNumber(), a[2].toNumber())
      : triangleArea(a[0].toNumber(), a[1].toNumber());
  return geomResult(value, args, 2, setExplicit);
}

function trapezoidAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [a, b, h] = need(args, 3, 3, 9608);
  return geomResult(
    trapezoidArea(a.toNumber(), b.toNumber(), h.toNumber()),
    args,
    2,
    setExplicit,
  );
}

function parallelogramAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [b, h] = need(args, 2, 2, 9609);
  return geomResult(
    parallelogramArea(b.toNumber(), h.toNumber()),
    args,
    2,
    setExplicit,
  );
}

function ellipseAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [a, b] = need(args, 2, 2, 9611);
  return geomResult(
    ellipseArea(a.toNumber(), b.toNumber()),
    args,
    2,
    setExplicit,
  );
}

function sphereVolumeFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [r] = need(args, 1, 1, 9612);
  return geomResult(sphereVolume(r.toNumber()), args, 3, setExplicit);
}

function sphereSurfaceAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [r] = need(args, 1, 1, 9613);
  return geomResult(sphereSurfaceArea(r.toNumber()), args, 2, setExplicit);
}

function cubeVolumeFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [s] = need(args, 1, 1, 9614);
  return geomResult(cubeVolume(s.toNumber()), args, 3, setExplicit);
}

function cubeSurfaceAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [s] = need(args, 1, 1, 9615);
  return geomResult(cubeSurfaceArea(s.toNumber()), args, 2, setExplicit);
}

function cylinderVolumeFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [r, h] = need(args, 2, 2, 9616);
  return geomResult(
    cylinderVolume(r.toNumber(), h.toNumber()),
    args,
    3,
    setExplicit,
  );
}

function cylinderSurfaceAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [r, h] = need(args, 2, 2, 9617);
  return geomResult(
    cylinderSurfaceArea(r.toNumber(), h.toNumber()),
    args,
    2,
    setExplicit,
  );
}

function coneVolumeFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [r, h] = need(args, 2, 2, 9618);
  return geomResult(
    coneVolume(r.toNumber(), h.toNumber()),
    args,
    3,
    setExplicit,
  );
}

function coneSurfaceAreaFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [r, h] = need(args, 2, 2, 9619);
  return geomResult(
    coneSurfaceArea(r.toNumber(), h.toNumber()),
    args,
    2,
    setExplicit,
  );
}

function boxVolumeFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [l, w, h] = need(args, 3, 3, 9621);
  return geomResult(
    boxVolume(l.toNumber(), w.toNumber(), h.toNumber()),
    args,
    3,
    setExplicit,
  );
}

function pyramidVolumeFn(
  args: TokenType[],
  _e: expressionUnit,
  setExplicit: SetExplicit,
): NumberToken {
  const [l, w, h] = need(args, 3, 3, 9622);
  return geomResult(
    pyramidVolume(l.toNumber(), w.toNumber(), h.toNumber()),
    args,
    3,
    setExplicit,
  );
}

function slopeFn(args: TokenType[]): NumberToken {
  const [x1, y1, x2, y2] = need(args, 4, 4, 9623);
  return plain(
    lineSlope(x1.toNumber(), y1.toNumber(), x2.toNumber(), y2.toNumber()),
  );
}
