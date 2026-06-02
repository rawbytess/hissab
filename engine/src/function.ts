import chroma from "chroma-js";
import { UserError } from "./exceptions";
import TokenBaseType from "./tokens/token_basetypes";
import tokenFactory from "./tokens/token_factory";
import type { ColorToken, NumberToken } from "./tokens/tokens";
import ProcessConversions from "./units_processor";

type functionType = {
  [fn: string]: {
    run: () => any;
    description: string;
    isRaw: boolean;
  };
};

const Functions: functionType = {
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
  abs: {
    run: absolute,
    description: "Absolute value",
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

function absolute(...params: number[]) {
  if (params.length > 1) throw new UserError(12343);
  return Math.abs(params[0]);
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

export default Functions;
