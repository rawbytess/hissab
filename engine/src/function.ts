import chroma from "chroma-js";
import { UserError } from "./exceptions";
import TokenBaseType, { type TokenType } from "./tokens/token_basetypes";
import tokenFactory from "./tokens/token_factory";
import type { ColorToken, expressionUnit, NumberToken } from "./tokens/tokens";
import UnitTypes from "./types/unit_enum";
import ProcessConversions from "./units_processor";

type functionType = {
  [fn: string]: {
    run: (...args: any[]) => any;
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

  // ---- Finance ----------------------------------------------------------
  // All finance functions are raw: they read the argument *tokens* so they can
  // see a rate's `%` flag, a term's time unit (years/months/…), and a
  // principal's currency unit. See `readRate` / `readYears` / `splitTermAndFreq`
  // for the shared argument conventions.
  "simple interest": {
    run: simpleInterest,
    description: "Simple interest: principal * rate * time",
    isRaw: true,
  },
  "compound interest": {
    run: compoundInterest,
    description:
      "Compound interest earned: principal*(1+rate/n)^(n*time) - principal",
    isRaw: true,
  },
  "future value": {
    run: futureValue,
    description:
      "Future value (compound amount): principal*(1+rate/n)^(n*time)",
    isRaw: true,
  },
  "present value": {
    run: presentValue,
    description: "Present value of a future amount discounted at a rate",
    isRaw: true,
  },
  cagr: {
    run: cagr,
    description:
      "Compound annual growth rate between a start and end value over a term",
    isRaw: true,
  },
  emi: {
    run: emi,
    description: "Monthly payment (EMI) for an amortizing loan",
    isRaw: true,
  },
  mortgage: {
    run: emi,
    description:
      "Monthly mortgage payment for an amortizing loan (alias of emi)",
    isRaw: true,
  },
  "loan payment": {
    run: emi,
    description: "Monthly loan payment for an amortizing loan (alias of emi)",
    isRaw: true,
  },
  "loan interest": {
    run: loanInterest,
    description: "Total interest paid over the life of an amortizing loan",
    isRaw: true,
  },
  "future value annuity": {
    run: futureValueAnnuity,
    description: "Future value of a series of equal periodic payments",
    isRaw: true,
  },
  "present value annuity": {
    run: presentValueAnnuity,
    description: "Present value of a series of equal periodic payments",
    isRaw: true,
  },
  roi: {
    run: roi,
    description: "Return on investment: (final - initial) / initial",
    isRaw: true,
  },
  apy: {
    run: apy,
    description:
      "Annual percentage yield (effective annual rate) from a nominal rate and compounding frequency",
    isRaw: true,
  },
  "profit margin": {
    run: profitMargin,
    description: "Profit margin: (revenue - cost) / revenue",
    isRaw: true,
  },
  markup: {
    run: markup,
    description: "Markup: (price - cost) / cost",
    isRaw: true,
  },
  "break even": {
    run: breakEven,
    description:
      "Break-even units: fixedCost / (pricePerUnit - variableCostPerUnit)",
    isRaw: true,
  },
  runway: {
    run: runway,
    description: "Cash runway in months: cash / monthlyBurn",
    isRaw: true,
  },
  "doubling time": {
    run: doublingTime,
    description: "Years to double an investment (Rule of 72): 72 / rate%",
    isRaw: true,
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

// ---- Finance helpers ----------------------------------------------------

type SetExplicit = (isExplicit: boolean) => void;

// Validate argument count and surface the args as NumberTokens. Finance args
// always resolve to numbers (each is pre-solved in its own sub-ParseTree).
function need(
  args: TokenType[],
  min: number,
  max: number,
  code: number,
): NumberToken[] {
  if (args.length < min || args.length > max) throw new UserError(code);
  return args as NumberToken[];
}

// A rate may be written as a percent (`5%` → already 0.05, percent flag set) or
// as a bare number meaning that many percent (`5` → 0.05). Either way we return
// the decimal fraction.
function readRate(token: NumberToken): number {
  return token.percent ? token.toNumber() : token.toNumber() / 100;
}

// Read a term as a number of years. A term carrying a time unit (months, weeks,
// days, …) is converted to years; a unitless term is taken to be years.
async function readYears(token: NumberToken): Promise<number> {
  const unit = token.unit;
  if (unit && unit.unitdata.type === UnitTypes.TIME) {
    const yearUnit = tokenFactory(
      "year",
      TokenBaseType.STRING,
      [],
      {},
    ) as expressionUnit;
    const converted = (await new ProcessConversions(token)
      .to(yearUnit)
      .convert()) as NumberToken;
    return converted.toNumber();
  }
  return token.toNumber();
}

// For compound functions the term and the compounding frequency are both
// numeric. Disambiguate by unit: the argument carrying a time unit is the term,
// the other bare number is compounds-per-year (default 1). When neither carries
// a time unit, the first is the term (years) and the second is the frequency.
async function splitTermAndFreq(
  rest: NumberToken[],
  code: number,
): Promise<{ years: number; n: number }> {
  if (rest.length === 0) throw new UserError(code);
  const termIndex = rest.findIndex(
    (t) => t.unit?.unitdata.type === UnitTypes.TIME,
  );
  if (termIndex >= 0) {
    const years = await readYears(rest[termIndex]);
    const others = rest.filter((_, i) => i !== termIndex);
    const n = others.length > 0 ? others[0].toNumber() : 1;
    return { years, n };
  }
  const years = rest[0].toNumber();
  const n = rest.length > 1 ? rest[1].toNumber() : 1;
  return { years, n };
}

// Build a plain numeric result token (used for counts/percentages).
function plain(value: number): NumberToken {
  return tokenFactory(value.toString(), TokenBaseType.DECIMAL) as NumberToken;
}

// Build a rate result expressed as a percentage value (0.125 → 12.5).
function pct(fraction: number): NumberToken {
  return plain(fraction * 100);
}

// Build a monetary result. If the principal carries a currency unit, propagate
// it to the result and mark the result explicit so it renders as currency.
function money(
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

// ---- Finance functions --------------------------------------------------

async function simpleInterest(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [principal, rate, term] = need(args, 3, 3, 7701);
  const interest =
    principal.toNumber() * readRate(rate) * (await readYears(term));
  return money(interest, principal, setIsExplicit);
}

async function compoundInterest(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [principal, rate, ...rest] = need(args, 3, 4, 7702);
  const { years, n } = await splitTermAndFreq(rest, 7702);
  const r = readRate(rate);
  const amount = principal.toNumber() * (1 + r / n) ** (n * years);
  return money(amount - principal.toNumber(), principal, setIsExplicit);
}

async function futureValue(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [principal, rate, ...rest] = need(args, 3, 4, 7703);
  const { years, n } = await splitTermAndFreq(rest, 7703);
  const r = readRate(rate);
  const amount = principal.toNumber() * (1 + r / n) ** (n * years);
  return money(amount, principal, setIsExplicit);
}

async function presentValue(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [futureAmount, rate, ...rest] = need(args, 3, 4, 7704);
  const { years, n } = await splitTermAndFreq(rest, 7704);
  const r = readRate(rate);
  const value = futureAmount.toNumber() / (1 + r / n) ** (n * years);
  return money(value, futureAmount, setIsExplicit);
}

async function cagr(args: TokenType[]): Promise<NumberToken> {
  const [begin, end, term] = need(args, 3, 3, 7705);
  const beginValue = begin.toNumber();
  if (beginValue === 0) throw new UserError(7706);
  const years = await readYears(term);
  if (years === 0) throw new UserError(7706);
  return pct((end.toNumber() / beginValue) ** (1 / years) - 1);
}

// Monthly payment for an amortizing loan. r is the monthly rate, N the number
// of monthly payments.
function monthlyPayment(principal: number, monthlyRate: number, n: number) {
  if (monthlyRate === 0) return principal / n;
  const growth = (1 + monthlyRate) ** n;
  return (principal * monthlyRate * growth) / (growth - 1);
}

async function emi(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [principal, rate, term] = need(args, 3, 3, 7707);
  const n = (await readYears(term)) * 12;
  if (n === 0) throw new UserError(7708);
  const payment = monthlyPayment(principal.toNumber(), readRate(rate) / 12, n);
  return money(payment, principal, setIsExplicit);
}

async function loanInterest(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [principal, rate, term] = need(args, 3, 3, 7709);
  const n = (await readYears(term)) * 12;
  if (n === 0) throw new UserError(7708);
  const payment = monthlyPayment(principal.toNumber(), readRate(rate) / 12, n);
  return money(payment * n - principal.toNumber(), principal, setIsExplicit);
}

async function futureValueAnnuity(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [payment, rate, ...rest] = need(args, 3, 4, 7710);
  const { years, n } = await splitTermAndFreq(rest, 7710);
  const i = readRate(rate) / n;
  const periods = n * years;
  const pmt = payment.toNumber();
  const value = i === 0 ? pmt * periods : (pmt * ((1 + i) ** periods - 1)) / i;
  return money(value, payment, setIsExplicit);
}

async function presentValueAnnuity(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): Promise<NumberToken> {
  const [payment, rate, ...rest] = need(args, 3, 4, 7711);
  const { years, n } = await splitTermAndFreq(rest, 7711);
  const i = readRate(rate) / n;
  const periods = n * years;
  const pmt = payment.toNumber();
  const value = i === 0 ? pmt * periods : (pmt * (1 - (1 + i) ** -periods)) / i;
  return money(value, payment, setIsExplicit);
}

async function roi(args: TokenType[]): Promise<NumberToken> {
  const [initial, final] = need(args, 2, 2, 7712);
  const initialValue = initial.toNumber();
  if (initialValue === 0) throw new UserError(7713);
  return pct((final.toNumber() - initialValue) / initialValue);
}

async function apy(args: TokenType[]): Promise<NumberToken> {
  const [rate, frequency] = need(args, 2, 2, 7714);
  const n = frequency.toNumber();
  if (n === 0) throw new UserError(7714);
  return pct((1 + readRate(rate) / n) ** n - 1);
}

async function profitMargin(args: TokenType[]): Promise<NumberToken> {
  const [revenue, cost] = need(args, 2, 2, 7715);
  const rev = revenue.toNumber();
  if (rev === 0) throw new UserError(7716);
  return pct((rev - cost.toNumber()) / rev);
}

async function markup(args: TokenType[]): Promise<NumberToken> {
  const [cost, price] = need(args, 2, 2, 7717);
  const costValue = cost.toNumber();
  if (costValue === 0) throw new UserError(7718);
  return pct((price.toNumber() - costValue) / costValue);
}

async function breakEven(args: TokenType[]): Promise<NumberToken> {
  const [fixedCost, price, variableCost] = need(args, 3, 3, 7719);
  const contribution = price.toNumber() - variableCost.toNumber();
  if (contribution === 0) throw new UserError(7720);
  return plain(fixedCost.toNumber() / contribution);
}

async function runway(args: TokenType[]): Promise<NumberToken> {
  const [cash, burn] = need(args, 2, 2, 7721);
  const burnValue = burn.toNumber();
  if (burnValue === 0) throw new UserError(7722);
  return plain(cash.toNumber() / burnValue);
}

async function doublingTime(args: TokenType[]): Promise<NumberToken> {
  const [rate] = need(args, 1, 1, 7723);
  const ratePercent = readRate(rate) * 100;
  if (ratePercent === 0) throw new UserError(7724);
  return plain(72 / ratePercent);
}

export default Functions;
