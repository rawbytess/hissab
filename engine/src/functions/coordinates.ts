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

export const coordinatesFunctions: Record<string, FunctionDef> = {
  // ---- Coordinate systems -------------------------------------------------
  // All raw: constructors read arg tokens so angle args honour an explicit
  // radian/grad/degree unit (default degree), and a single point arg means
  // "convert to this system". Operations build their own result tokens.
  point: {
    run: makePointCtor("cartesian"),
    description: "Cartesian point/vector: point(x, y, z, …)",
    isRaw: true,
  },
  cartesian: {
    run: makePointCtor("cartesian"),
    description: "Cartesian point (alias of point)",
    isRaw: true,
  },
  vector: {
    run: makePointCtor("cartesian"),
    description: "Cartesian vector (alias of point)",
    isRaw: true,
  },
  polar: {
    run: makePointCtor("polar"),
    description: "2-D polar point: polar(r, θ) (θ in degrees)",
    isRaw: true,
  },
  cylindrical: {
    run: makePointCtor("cylindrical"),
    description: "3-D cylindrical point: cylindrical(r, θ, z)",
    isRaw: true,
  },
  spherical: {
    run: makePointCtor("spherical"),
    description:
      "3-D spherical point: spherical(ρ, θ, φ) (θ inclination, φ azimuth)",
    isRaw: true,
  },
  minkowski: {
    run: makePointCtor("minkowski"),
    description: "Minkowski spacetime point: minkowski(t, x, y, z)",
    isRaw: true,
  },
  distance: {
    run: distanceFn,
    description: "Distance between two points: distance(a, b)",
    isRaw: true,
  },
  magnitude: {
    run: magnitudeFn,
    description: "Length of a point/vector from the origin",
    isRaw: true,
  },
  norm: {
    run: magnitudeFn,
    description: "Vector norm (alias of magnitude)",
    isRaw: true,
  },
  midpoint: {
    run: midpointFn,
    description: "Midpoint of two points: midpoint(a, b)",
    isRaw: true,
  },
  dot: {
    run: dotFn,
    description: "Dot product of two vectors: dot(a, b)",
    isRaw: true,
  },
  cross: {
    run: crossFn,
    description: "Cross product of two 3-D vectors: cross(a, b)",
    isRaw: true,
  },
  angle: {
    run: angleFn,
    description: "Angle between two vectors in degrees: angle(a, b)",
    isRaw: true,
  },
  normalize: {
    run: normalizeFn,
    description: "Unit vector in the direction of a vector: normalize(v)",
    isRaw: true,
  },
  interval: {
    run: intervalFn,
    description: "Signed spacetime interval s² between two events",
    isRaw: true,
  },
  atan2: {
    run: atan2Fn,
    description: "Two-argument arctangent in degrees: atan2(y, x)",
    isRaw: true,
  },
  hypot: {
    run: hypotFn,
    description: "Euclidean norm: hypot(x, y, …) = √(x²+y²+…)",
    isRaw: false,
  },
};

// ---- Coordinate helpers ---------------------------------------------------

function makePointCtor(system: CoordSystem) {
  return async (args: TokenType[]): Promise<PointToken> =>
    buildPoint(args, system);
}

// Construct a point in `system` from numeric args, or convert a single point
// argument into `system`. Angle axes honour an explicit angle unit.
async function buildPoint(
  args: TokenType[],
  system: CoordSystem,
): Promise<PointToken> {
  if (args.length === 1 && args[0] instanceof PointToken)
    return convertPointToken(args[0], system) as PointToken;

  const { min, max } = expectedArity(system);
  if (args.length < min || args.length > max) throw new UserError(8201);

  const ang = angularAxes(system);
  const coords: number[] = [];
  for (let i = 0; i < args.length; i++) {
    const t = args[i];
    if (!(t instanceof NumberToken)) throw new UserError(8202);
    coords.push(ang.has(i) ? await readAngleDegrees(t) : t.toNumber());
  }
  return new PointToken(coords, system);
}

// Read an angle argument as degrees. A bare number is already degrees; an
// explicit angle unit (radian/grad/…) is converted; a non-angle unit errors.
async function readAngleDegrees(t: NumberToken): Promise<number> {
  const u = t.unit;
  if (!u) return t.toNumber();
  if (u.unitdata.type !== UnitTypes.ANGLE) throw new UserError(8203);
  if (u.value === "degree") return t.toNumber();
  const deg = (await new ProcessConversions(t)
    .to(tokenFactory("degree", TokenBaseType.STRING) as UnitToken)
    .convert()) as NumberToken;
  return deg.toNumber();
}

function needPoints(
  args: TokenType[],
  min: number,
  max: number,
  code: number,
): PointToken[] {
  if (args.length < min || args.length > max) throw new UserError(code);
  for (const a of args)
    if (!(a instanceof PointToken)) throw new UserError(code);
  return args as PointToken[];
}

// Like needPoints but rejects Minkowski points (dot/cross/angle/normalize are
// Euclidean operations).
function needSpatialPoints(
  args: TokenType[],
  min: number,
  max: number,
  code: number,
): PointToken[] {
  const pts = needPoints(args, min, max, code);
  for (const p of pts) if (p.system === "minkowski") throw new UserError(8226);
  return pts;
}

function degreeToken(value: number): NumberToken {
  const r = plain(value);
  r.unit = tokenFactory("degree", TokenBaseType.STRING) as UnitToken;
  return r;
}

function distanceFn(args: TokenType[]): NumberToken {
  const [a, b] = needPoints(args, 2, 2, 8230);
  if (a.system === "minkowski" || b.system === "minkowski") {
    if (a.system !== b.system) throw new UserError(8231);
    return plain(Math.sqrt(Math.abs(minkowskiInterval(a.coords, b.coords))));
  }
  return plain(euclidean(a.cartesian(), b.cartesian()));
}

function magnitudeFn(args: TokenType[]): NumberToken {
  // Polymorphic: Frobenius norm for a matrix, vector length for a point.
  if (args.length === 1 && args[0] instanceof MatrixToken)
    return plain(mat.frobeniusNorm(args[0].data));
  const [p] = needPoints(args, 1, 1, 8232);
  return plain(magnitude(p.coords, p.system));
}

function midpointFn(args: TokenType[]): PointToken {
  const [a, b] = needPoints(args, 2, 2, 8233);
  if (a.system === "minkowski" || b.system === "minkowski") {
    if (a.system !== b.system) throw new UserError(8231);
    return new PointToken(midpoint(a.coords, b.coords), "minkowski");
  }
  return new PointToken(midpoint(a.cartesian(), b.cartesian()), "cartesian");
}

function dotFn(args: TokenType[]): NumberToken {
  const [a, b] = needSpatialPoints(args, 2, 2, 8234);
  return plain(dot(a.cartesian(), b.cartesian()));
}

function crossFn(args: TokenType[]): PointToken {
  const [a, b] = needSpatialPoints(args, 2, 2, 8235);
  return new PointToken(cross(a.cartesian(), b.cartesian()), "cartesian");
}

function angleFn(args: TokenType[]): NumberToken {
  const [a, b] = needSpatialPoints(args, 2, 2, 8236);
  return degreeToken(angleBetween(a.cartesian(), b.cartesian()));
}

function normalizeFn(args: TokenType[]): PointToken {
  const [v] = needSpatialPoints(args, 1, 1, 8237);
  return new PointToken(normalize(v.cartesian()), "cartesian");
}

function intervalFn(args: TokenType[]): NumberToken {
  const [a, b] = needPoints(args, 2, 2, 8238);
  if (a.system === "minkowski" || b.system === "minkowski") {
    if (a.system !== b.system) throw new UserError(8231);
    return plain(minkowskiInterval(a.coords, b.coords));
  }
  const d = euclidean(a.cartesian(), b.cartesian());
  return plain(d * d);
}

function atan2Fn(args: TokenType[]): NumberToken {
  if (args.length !== 2) throw new UserError(8240);
  const [y, x] = args;
  if (!(y instanceof NumberToken) || !(x instanceof NumberToken))
    throw new UserError(8240);
  return degreeToken(radToDeg(Math.atan2(y.toNumber(), x.toNumber())));
}

function hypotFn(...params: number[]): number {
  return Math.hypot(...params);
}
