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
import { money, need, pct, plain, readRate, type SetExplicit } from "./util";

export const healthFunctions: Record<string, FunctionDef> = {
  // ---- Health & Fitness -------------------------------------------------
  // Body metrics. Inputs accept units (kg/lb, m/cm/ft); a bare number is read
  // in metric — kilograms, and meters for BMI / centimeters for BMR. Sex
  // formulas split into `… male` / `… female` because functions take no string
  // arguments. See ./health_functions.ts for the formula standards used.
  bmi: {
    run: bmiFn,
    description:
      "Body Mass Index: weight(kg) / height(m)² — bmi(70 kg, 1.75 m)",
    isRaw: true,
  },
  "bmr male": {
    run: bmrMaleFn,
    description:
      "Basal metabolic rate for men (Mifflin–St Jeor), kcal/day: bmr male(weight, height, age)",
    isRaw: true,
  },
  "bmr female": {
    run: bmrFemaleFn,
    description:
      "Basal metabolic rate for women (Mifflin–St Jeor), kcal/day: bmr female(weight, height, age)",
    isRaw: true,
  },
  tdee: {
    run: tdeeFn,
    description:
      "Total daily energy expenditure: bmr · activity factor (1.2 sedentary … 1.9 athlete)",
    isRaw: false,
  },
  "body fat male": {
    run: bodyFatMaleFn,
    description:
      "Body fat % for men (Deurenberg): body fat male(weight, height, age)",
    isRaw: true,
  },
  "body fat female": {
    run: bodyFatFemaleFn,
    description:
      "Body fat % for women (Deurenberg): body fat female(weight, height, age)",
    isRaw: true,
  },
  "ideal weight male": {
    run: idealWeightMaleFn,
    description:
      "Ideal body weight for men (Devine): ideal weight male(height)",
    isRaw: true,
  },
  "ideal weight female": {
    run: idealWeightFemaleFn,
    description:
      "Ideal body weight for women (Devine): ideal weight female(height)",
    isRaw: true,
  },
  "max heart rate": {
    run: maxHeartRate,
    description: "Predicted maximum heart rate (bpm): 220 - age",
    isRaw: false,
  },
  "target heart rate": {
    run: targetHeartRateFn,
    description:
      "Target heart rate (bpm): (220 - age) · intensity — target heart rate(age, intensity%)",
    isRaw: true,
  },
  "calories burned": {
    run: caloriesBurnedFn,
    description:
      "Calories burned: MET · weight(kg) · minutes/60 — calories burned(met, weight, minutes)",
    isRaw: true,
  },
  "water intake": {
    run: waterIntakeFn,
    description: "Suggested daily water (liters): about 33 ml per kg of weight",
    isRaw: true,
  },
};

// ---- Health & Fitness ---------------------------------------------------

// Convert a token to `target` when it carries a unit of `type`; otherwise read
// its bare number as already being in the target unit. Mirrors readYears.
async function readAs(
  token: NumberToken,
  target: string,
  type: UnitTypes,
): Promise<number> {
  const unit = token.unit;
  if (unit && unit.unitdata.type === type) {
    const tu = tokenFactory(target, TokenBaseType.STRING, [], {}) as UnitToken;
    const converted = (await new ProcessConversions(token)
      .to(tu)
      .convert()) as NumberToken;
    return converted.toNumber();
  }
  return token.toNumber();
}

const readKg = (t: NumberToken) => readAs(t, "kilogram", UnitTypes.WEIGHT);

const readMeters = (t: NumberToken) => readAs(t, "meter", UnitTypes.LENGTH);

const readCm = (t: NumberToken) => readAs(t, "centimeter", UnitTypes.LENGTH);

// Height in inches: a length unit is converted; a bare number is taken as cm
// (the metric default), since the Devine formula is defined in inches.
async function readHeightInches(t: NumberToken): Promise<number> {
  const u = t.unit;
  if (u && u.unitdata.type === UnitTypes.LENGTH)
    return readAs(t, "inch", UnitTypes.LENGTH);
  return t.toNumber() / 2.54;
}

// A weight result expressed in kilograms (rendered explicitly as `kg`).
function kilograms(value: number, setIsExplicit: SetExplicit): NumberToken {
  const r = plain(value);
  r.unit = tokenFactory("kilogram", TokenBaseType.STRING) as UnitToken;
  setIsExplicit(true);
  return r;
}

async function bmiFn(args: TokenType[]): Promise<NumberToken> {
  const [w, h] = need(args, 2, 2, 9702);
  return plain(bmi(await readKg(w), await readMeters(h)));
}

async function bmrMaleFn(args: TokenType[]): Promise<NumberToken> {
  const [w, h, age] = need(args, 3, 3, 9703);
  return plain(bmrMale(await readKg(w), await readCm(h), age.toNumber()));
}

async function bmrFemaleFn(args: TokenType[]): Promise<NumberToken> {
  const [w, h, age] = need(args, 3, 3, 9704);
  return plain(bmrFemale(await readKg(w), await readCm(h), age.toNumber()));
}

async function bodyFatMaleFn(args: TokenType[]): Promise<NumberToken> {
  const [w, h, age] = need(args, 3, 3, 9705);
  const b = bmi(await readKg(w), await readMeters(h));
  return plain(bodyFatMale(b, age.toNumber()));
}

async function bodyFatFemaleFn(args: TokenType[]): Promise<NumberToken> {
  const [w, h, age] = need(args, 3, 3, 9706);
  const b = bmi(await readKg(w), await readMeters(h));
  return plain(bodyFatFemale(b, age.toNumber()));
}

async function idealWeightMaleFn(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [h] = need(args, 1, 1, 9707);
  return kilograms(devineMale(await readHeightInches(h)), setIsExplicit);
}

async function idealWeightFemaleFn(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [h] = need(args, 1, 1, 9708);
  return kilograms(devineFemale(await readHeightInches(h)), setIsExplicit);
}

async function targetHeartRateFn(args: TokenType[]): Promise<NumberToken> {
  const [age, intensity] = need(args, 2, 2, 9709);
  return plain((220 - age.toNumber()) * readRate(intensity));
}

async function caloriesBurnedFn(args: TokenType[]): Promise<NumberToken> {
  const [met, weight, minutes] = need(args, 3, 3, 9710);
  return plain(
    caloriesBurned(met.toNumber(), await readKg(weight), minutes.toNumber()),
  );
}

function tdeeFn(bmrValue: number, activityFactor: number): number {
  return bmrValue * activityFactor;
}

async function waterIntakeFn(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [weight] = need(args, 1, 1, 9711);
  const r = plain(waterIntakeLiters(await readKg(weight)));
  r.unit = tokenFactory("liter", TokenBaseType.STRING) as UnitToken;
  setIsExplicit(true);
  return r;
}
