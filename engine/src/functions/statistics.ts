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
import { money, need, pct, plain, type SetExplicit } from "./util";

export const statisticsFunctions: Record<string, FunctionDef> = {
  avg: {
    run: average,
    description: "Function to calculate Average for all values",
    isRaw: false,
  },
  sum: {
    run: addition,
    description: "Function to add all values",
    isRaw: false,
  },
  min: {
    run: minimum,
    description: "Function to find minimum of all parameters",
    isRaw: true,
  },
  max: {
    run: maximum,
    description: "Function to find maximum of all parameters",
    isRaw: true,
  },
  "harmonic mean": {
    run: harmonicMean,
    description: "Find harmonic mean from a range of numbers",
    isRaw: false,
  },
  "geometric mean": {
    run: geometricMean,
    description: "Find geometric mean from a range of numbers",
    isRaw: false,
  },
  "standard deviation": {
    run: standardDeviation,
    description: "Find standard deviation from a range of numbers",
    isRaw: false,
  },
  variance: {
    run: variance,
    description: "Find variance from a range of numbers",
    isRaw: false,
  },
  median: {
    run: median,
    description: "Find median from a range of numbers",
    isRaw: false,
  },
  range: {
    run: range,
    description: "Find statistical range from a range of numbers",
    isRaw: false,
  },
};

function average(...params: number[]): number {
  if (params) {
    let res = 0;
    for (const param of params) {
      res += param;
    }
    return res / params.length;
  }
  return 0;
}

function addition(...params: number[]): number {
  if (params) {
    let res = 0;
    for (const param of params) {
      res += param;
    }
    return res;
  }
  return 0;
}

async function minimum(...allparams: any[]): Promise<NumberToken> {
  const params: NumberToken[] = allparams[0];
  allparams[2](true);
  if (params) {
    const sameParams = await getSameParams(params, params[0].unit?.value);
    let minValue = Infinity;
    let minIndex = 0;
    for (const [i, v] of sameParams.entries()) {
      if (v < minValue) {
        minValue = v;
        minIndex = i;
      }
    }
    return params[minIndex];
  }
  throw new UserError(6341);
}

async function maximum(...allparams: any[]): Promise<NumberToken> {
  const params: NumberToken[] = allparams[0];
  allparams[2](true);
  if (params) {
    const sameParams = await getSameParams(params, params[0].unit?.value);
    let maxValue = -Infinity;
    let maxIndex = 0;
    for (const [i, v] of sameParams.entries()) {
      if (v > maxValue) {
        maxValue = v;
        maxIndex = i;
      }
    }
    return params[maxIndex];
  }
  throw new UserError(6341);
}

async function getSameParams(params: NumberToken[], unit: string | undefined) {
  const sameParams = unit
    ? await Promise.all(
        params.map(async (param) => {
          if (
            param.unit?.value === unit &&
            param.unit?.factor === params[0].unit?.factor
          )
            return param.toNumber();
          const p: NumberToken = (await new ProcessConversions(param)
            .to(params[0].unit)
            .convert()) as NumberToken;
          return p.toNumber();
        }),
      )
    : params.map((param) => param.toNumber());
  return sameParams;
}

function geometricMean(...numbers: number[]) {
  if (numbers.length === 0) throw new UserError(5319);

  let product = 1;
  for (let i = 0; i < numbers.length; i++) product *= numbers[i];

  return product ** (1 / numbers.length);
}

function harmonicMean(...numbers: number[]) {
  if (numbers.length === 0) throw new UserError(5318);

  let reciprocalsSum = 0;
  for (let i = 0; i < numbers.length; i++) reciprocalsSum += 1 / numbers[i];

  return numbers.length / reciprocalsSum;
}

function standardDeviation(...numbers: number[]) {
  if (numbers.length === 0) throw new UserError(5329);

  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDifferences = numbers.map((num) => (num - mean) ** 2);
  const v =
    squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) /
    numbers.length;
  return Math.sqrt(v);
}

function variance(...numbers: number[]) {
  if (numbers.length === 0) throw new UserError(5339);

  const mean = numbers.reduce((sum, num) => sum + num, 0) / numbers.length;
  const squaredDifferences = numbers.map((num) => (num - mean) ** 2);
  return (
    squaredDifferences.reduce((sum, squaredDiff) => sum + squaredDiff, 0) /
    numbers.length
  );
}

function median(...numbers: number[]) {
  if (numbers.length === 0) throw new UserError(5349);

  const sortedNumbers = numbers.slice().sort((a, b) => a - b);
  const middleIndex = Math.floor(sortedNumbers.length / 2);

  if (sortedNumbers.length % 2 === 0)
    return (sortedNumbers[middleIndex - 1] + sortedNumbers[middleIndex]) / 2;
  return sortedNumbers[middleIndex];
}

function range(...numbers: number[]) {
  if (numbers.length === 0) throw new UserError(5359);
  const sortedNumbers = numbers.slice().sort((a, b) => a - b);
  return sortedNumbers[sortedNumbers.length - 1] - sortedNumbers[0];
}
