import chroma from "chroma-js";
import {
  combination,
  decimalToFraction,
  divisors,
  isPrime,
} from "./arithmetic_functions";
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
} from "./coordinates";
import { UserError } from "./exceptions";
import * as ip from "./ip";
import TokenBaseType, { type TokenType } from "./tokens/token_basetypes";
import tokenFactory from "./tokens/token_factory";
import {
  BooleanToken,
  type ColorToken,
  convertPointToken,
  type expressionUnit,
  FractionToken,
  IpToken,
  ListToken,
  NumberToken,
  PointToken,
  type UnitToken,
} from "./tokens/tokens";
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

  // ---- IP addresses -----------------------------------------------------
  // All raw: they read the argument *token* so they can see an IpToken's
  // version + CIDR prefix. Subnet math lives in ./ip.ts (BigInt, v4+v6).
  network: {
    run: ipNetwork,
    description: "Network address of a CIDR block (e.g. network(10.0.5.9/24))",
    isRaw: true,
  },
  broadcast: {
    run: ipBroadcast,
    description: "Broadcast address of a CIDR block",
    isRaw: true,
  },
  netmask: {
    run: ipNetmask,
    description: "Subnet mask for a CIDR block (e.g. netmask(10.0.0.0/24))",
    isRaw: true,
  },
  subnetmask: {
    run: ipNetmask,
    description: "Subnet mask for a CIDR block (alias of netmask)",
    isRaw: true,
  },
  wildcard: {
    run: ipWildcard,
    description: "Wildcard (inverse) mask for a CIDR block",
    isRaw: true,
  },
  firsthost: {
    run: ipFirstHost,
    description: "First usable host address in a CIDR block",
    isRaw: true,
  },
  lasthost: {
    run: ipLastHost,
    description: "Last usable host address in a CIDR block",
    isRaw: true,
  },
  hosts: {
    run: ipHosts,
    description: "Number of usable hosts in a CIDR block",
    isRaw: true,
  },
  addresses: {
    run: ipAddresses,
    description: "Total number of addresses in a CIDR block",
    isRaw: true,
  },
  prefix: {
    run: ipPrefixLen,
    description: "Prefix length of a CIDR block or a subnet mask",
    isRaw: true,
  },
  version: {
    run: ipVersion,
    description: "IP version of an address (4 or 6)",
    isRaw: true,
  },
  contains: {
    run: ipContains,
    description:
      "Whether a subnet contains an address: contains(net/prefix, ip)",
    isRaw: true,
  },
  isprivate: {
    run: ipIsPrivate,
    description:
      "Whether an IP is in a private (RFC 1918 / unique-local) range",
    isRaw: true,
  },
  ispublic: {
    run: ipIsPublic,
    description: "Whether an IP is a global unicast (public) address",
    isRaw: true,
  },
  isloopback: {
    run: ipIsLoopback,
    description: "Whether an IP is a loopback address",
    isRaw: true,
  },
  ismulticast: {
    run: ipIsMulticast,
    description: "Whether an IP is a multicast address",
    isRaw: true,
  },
  ipv4: {
    run: ipFromNumberV4,
    description:
      "Convert a 32-bit integer to an IPv4 address: ipv4(3232235777)",
    isRaw: true,
  },
  ipv6: {
    run: ipFromNumberV6,
    description: "Convert an integer to an IPv6 address",
    isRaw: true,
  },

  // ---- Number theory ----------------------------------------------------
  // All raw: each returns a non-number result token (BooleanToken /
  // FractionToken / ListToken). They take a single pre-solved numeric
  // argument, ignoring any unit. See ./arithmetic_functions.ts for the math.
  isprime: {
    run: isPrimeFn,
    description: "Whether a number is prime (e.g. isprime(7))",
    isRaw: true,
  },
  fraction: {
    run: fractionFn,
    description: "Reduce a decimal to a fraction (e.g. fraction(0.75) → 3/4)",
    isRaw: true,
  },
  "mixed fraction": {
    run: mixedFractionFn,
    description:
      "Reduce a decimal to a mixed number (e.g. mixed fraction(2.5) → 2 1/2)",
    isRaw: true,
  },
  factors: {
    run: factorsFn,
    description: "All divisors of a positive integer (e.g. factors(12))",
    isRaw: true,
  },

  // ---- Probability ------------------------------------------------------
  // All raw: they read the argument *tokens* so P() can honour a `%` flag and
  // so results can be tagged `.probability = true`. A probability is a plain
  // dimensionless NumberToken in [0,1]; the AND/OR/NOT operations are the
  // `&` / `|` / `~` operators (see makeBitwiseFunc in operator_types.ts), which
  // overload onto the probability tag. These functions cover everything that
  // isn't a binary operator. Independence is assumed for combinations.
  p: {
    run: probabilityFn,
    description:
      "Define a probability: P(0.1) → 0.1 (accepts a percent: P(10%) → 0.1)",
    isRaw: true,
  },
  probability: {
    run: probabilityFn,
    description: "Define a probability (alias of P)",
    isRaw: true,
  },
  conditional: {
    run: conditionalFn,
    description:
      "Conditional probability P(A|B) = P(A and B) / P(B): conditional(pAandB, pB)",
    isRaw: true,
  },
  bayes: {
    run: bayesFn,
    description:
      "Bayes' theorem posterior P(H|E): bayes(prior, likelihood, likelihoodGivenNot)",
    isRaw: true,
  },
  odds: {
    run: oddsFn,
    description: "Odds for a probability: odds(p) = p / (1 - p)",
    isRaw: true,
  },
  "probability from odds": {
    run: probabilityFromOddsFn,
    description: "Probability implied by odds o: o / (1 + o)",
    isRaw: true,
  },
  binomial: {
    run: binomialFn,
    description:
      "Binomial probability of k successes in n trials: binomial(n, k, p) = C(n,k)·p^k·(1-p)^(n-k)",
    isRaw: true,
  },
  "expected value": {
    run: expectedValueFn,
    description:
      "Expected value of value/probability pairs: expected value(v1, p1, v2, p2, …)",
    isRaw: true,
  },

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

// ---- IP address helpers -------------------------------------------------

function ipArg(args: TokenType[]): IpToken {
  const a = args[0];
  if (!(a instanceof IpToken)) throw new UserError(7310);
  return a;
}

// Subnet operations need a CIDR prefix; a bare address (no `/n`) can't define a
// network/broadcast/host range.
function requirePrefix(token: IpToken): number {
  if (token.prefix === null) throw new UserError(7311);
  return token.prefix;
}

function ipCount(n: bigint): NumberToken {
  return tokenFactory(n.toString(), TokenBaseType.DECIMAL) as NumberToken;
}

function ipRangeIs(args: TokenType[], wanted: string[]): BooleanToken {
  const a = ipArg(args);
  return new BooleanToken(wanted.includes(ip.rangeOf(a.address, a.version)));
}

// ---- IP address functions -----------------------------------------------

function ipNetwork(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  // Keep the prefix so the result round-trips as a subnet (10.0.5.0/24).
  return a.withAddress(ip.networkAddress(a.address, p, a.version), p);
}

function ipBroadcast(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.broadcastAddress(a.address, p, a.version), null);
}

function ipNetmask(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.maskFromPrefix(p, a.version), null);
}

function ipWildcard(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.wildcardMask(p, a.version), null);
}

function ipFirstHost(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.networkAddress(a.address, p, a.version) + 1n, null);
}

function ipLastHost(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.broadcastAddress(a.address, p, a.version) - 1n, null);
}

function ipHosts(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): NumberToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  const total = ip.addressCount(p, a.version);
  // IPv4 reserves network + broadcast; IPv6 has no broadcast.
  const usable = a.version === 4 && total > 2n ? total - 2n : total;
  setIsExplicit(true);
  return ipCount(usable);
}

function ipAddresses(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): NumberToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  setIsExplicit(true);
  return ipCount(ip.addressCount(p, a.version));
}

function ipPrefixLen(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): NumberToken {
  const a = ipArg(args);
  // From an explicit CIDR prefix, else derive it from a subnet-mask address.
  const p =
    a.prefix !== null ? a.prefix : ip.prefixFromMask(a.address, a.version);
  setIsExplicit(true);
  return ipCount(BigInt(p));
}

function ipVersion(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): NumberToken {
  const a = ipArg(args);
  setIsExplicit(true);
  return ipCount(BigInt(a.version));
}

function ipContains(args: TokenType[]): BooleanToken {
  const subnet = args[0];
  const target = args[1];
  if (!(subnet instanceof IpToken) || !(target instanceof IpToken))
    throw new UserError(7312);
  if (subnet.version !== target.version) return new BooleanToken(false);
  const p = subnet.prefix ?? Number(ip.bitWidth(subnet.version));
  const net = ip.networkAddress(subnet.address, p, subnet.version);
  const broadcast = ip.broadcastAddress(subnet.address, p, subnet.version);
  return new BooleanToken(target.address >= net && target.address <= broadcast);
}

function ipIsPrivate(args: TokenType[]): BooleanToken {
  return ipRangeIs(args, ["private", "uniqueLocal"]);
}

function ipIsPublic(args: TokenType[]): BooleanToken {
  return ipRangeIs(args, ["unicast"]);
}

function ipIsLoopback(args: TokenType[]): BooleanToken {
  return ipRangeIs(args, ["loopback"]);
}

function ipIsMulticast(args: TokenType[]): BooleanToken {
  return ipRangeIs(args, ["multicast"]);
}

// Integer → IP address. Reads the literal's digits exactly (so 128-bit IPv6
// values survive — a JS number can't hold them); falls back to the numeric
// value for non-decimal literals (e.g. ipv4(0xc0a80101)).
function ipFromNumber(args: TokenType[], version: 4 | 6): IpToken {
  const t = args[0];
  if (t instanceof IpToken) return t;
  if (!(t instanceof NumberToken)) throw new UserError(7313);
  const raw = t.value.replaceAll(",", "");
  const address = /^-?\d+$/.test(raw)
    ? BigInt(raw)
    : BigInt(Math.trunc(t.toNumber()));
  if (address < 0n || address > ip.maxAddress(version))
    throw new UserError(7314);
  const str = address.toString();
  return new IpToken(str, str, version, address, null);
}

function ipFromNumberV4(args: TokenType[]): IpToken {
  return ipFromNumber(args, 4);
}

function ipFromNumberV6(args: TokenType[]): IpToken {
  return ipFromNumber(args, 6);
}

// ---- Number theory ------------------------------------------------------

// Read the single numeric argument, ignoring any unit. Wrong arity or a
// non-number argument is a user error.
function singleNumber(args: TokenType[], code: number): number {
  if (args.length !== 1) throw new UserError(code);
  const a = args[0];
  if (!(a instanceof NumberToken)) throw new UserError(code);
  return a.toNumber();
}

function isPrimeFn(args: TokenType[]): BooleanToken {
  return new BooleanToken(isPrime(singleNumber(args, 7801)));
}

function fractionFn(args: TokenType[]): FractionToken {
  const { numerator, denominator } = decimalToFraction(
    singleNumber(args, 7802),
  );
  return new FractionToken(numerator, denominator, false);
}

function mixedFractionFn(args: TokenType[]): FractionToken {
  const { numerator, denominator } = decimalToFraction(
    singleNumber(args, 7802),
  );
  return new FractionToken(numerator, denominator, true);
}

function factorsFn(args: TokenType[]): ListToken {
  return new ListToken(divisors(singleNumber(args, 7803)));
}

// ---- Probability --------------------------------------------------------

// Validate argument count and surface the args as NumberTokens. Each
// probability argument is pre-solved in its own sub-ParseTree, so a `%` literal
// already carries the divided-by-100 value (10% → 0.1).
function probArgs(args: TokenType[], n: number, code: number): NumberToken[] {
  if (args.length !== n) throw new UserError(code);
  for (const a of args)
    if (!(a instanceof NumberToken)) throw new UserError(code);
  return args as NumberToken[];
}

// A probability must lie in [0,1].
function assertProb(value: number, code: number): number {
  if (!Number.isFinite(value) || value < 0 || value > 1)
    throw new UserError(code);
  return value;
}

// Build a NumberToken tagged as a probability so `&`/`|`/`~` overload onto it
// and so chained operations keep their probability semantics.
function probToken(value: number): NumberToken {
  const result = plain(value);
  result.probability = true;
  return result;
}

function probabilityFn(args: TokenType[]): NumberToken {
  const [x] = probArgs(args, 1, 7901);
  return probToken(assertProb(x.toNumber(), 7901));
}

function conditionalFn(args: TokenType[]): NumberToken {
  const [joint, given] = probArgs(args, 2, 7902);
  const pB = assertProb(given.toNumber(), 7902);
  if (pB === 0) throw new UserError(7902);
  const pAB = assertProb(joint.toNumber(), 7902);
  return probToken(assertProb(pAB / pB, 7902));
}

function bayesFn(args: TokenType[]): NumberToken {
  const [priorT, likelihoodT, likelihoodNotT] = probArgs(args, 3, 7903);
  const prior = assertProb(priorT.toNumber(), 7903);
  const likelihood = assertProb(likelihoodT.toNumber(), 7903);
  const likelihoodNot = assertProb(likelihoodNotT.toNumber(), 7903);
  const evidence = prior * likelihood + (1 - prior) * likelihoodNot;
  if (evidence === 0) throw new UserError(7903);
  return probToken((prior * likelihood) / evidence);
}

function oddsFn(args: TokenType[]): NumberToken {
  const [p] = probArgs(args, 1, 7904);
  const value = assertProb(p.toNumber(), 7904);
  if (value === 1) throw new UserError(7904);
  // A ratio, not itself a probability — left untagged.
  return plain(value / (1 - value));
}

function probabilityFromOddsFn(args: TokenType[]): NumberToken {
  const [o] = probArgs(args, 1, 7906);
  const odds = o.toNumber();
  if (!Number.isFinite(odds) || odds < 0) throw new UserError(7906);
  return probToken(odds / (1 + odds));
}

function binomialFn(args: TokenType[]): NumberToken {
  const [nT, kT, pT] = probArgs(args, 3, 7907);
  const n = nT.toNumber();
  const k = kT.toNumber();
  const p = assertProb(pT.toNumber(), 7907);
  if (!Number.isInteger(n) || !Number.isInteger(k) || n < 0 || k < 0 || k > n)
    throw new UserError(7907);
  return probToken(combination(n, k) * p ** k * (1 - p) ** (n - k));
}

function expectedValueFn(args: TokenType[]): NumberToken {
  if (args.length < 2 || args.length % 2 !== 0) throw new UserError(7908);
  for (const a of args)
    if (!(a instanceof NumberToken)) throw new UserError(7908);
  const pairs = args as NumberToken[];
  let total = 0;
  for (let i = 0; i < pairs.length; i += 2) {
    const value = pairs[i].toNumber();
    const prob = assertProb(pairs[i + 1].toNumber(), 7908);
    total += value * prob;
  }
  // A weighted sum of outcome values — a number, not a probability.
  return plain(total);
}

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

export default Functions;
