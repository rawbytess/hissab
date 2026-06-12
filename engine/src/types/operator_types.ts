import chroma from "chroma-js";
import * as arith from "../arithmetic_functions";
import { UnhandledError, UserError } from "../exceptions";
import {
  inverse as matInverse,
  mul as matMul,
  pow as matPow,
  scale as matScale,
} from "../matrix";
import { type Cx, cxDiv, cxMul, cxPow } from "../symbolic/complex";
import { composeUnits } from "../tokens/compound";
import TokenBaseType, { type TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import {
  ColorToken,
  ComplexToken,
  CoordTargetToken,
  convertPointToken,
  DateToken,
  type expressionUnit,
  IpToken,
  MatrixToken,
  NumberToken,
  PointToken,
  UnitToken,
} from "../tokens/tokens";
import ProcessConversions from "../units_processor";
import UnitTypes from "./unit_enum";

// ---------------------------------------------------------------------------
// Operator definition types
//
// The two calling conventions are a discriminated union on `isRaw`, so a
// definition cannot declare one convention and implement the other — the
// solver (parsetree.ts) narrows on `def.isRaw` and the compiler checks both
// call shapes.
// ---------------------------------------------------------------------------

export type OperandSlot = "prenumber" | "postnumber" | "prestring" | "postunit";
export type Associativity = "left" | "right";
export type SetIsExplicit = (isExplicit: boolean) => void;
export type SetConvertTo = (convertTo: string[]) => void;

// Raw funcs receive the operator's token children (children[0] = left, which
// may be absent for prefix/postfix ops; children[1] = right) plus the ambient
// unit context. The nullable return mirrors tokenFactory's signature; the
// solver guards against null before grafting.
export type RawOpFunc = (
  children: TokenType[],
  exprUnit: expressionUnit,
  setIsExplicit: SetIsExplicit,
  setConvertTo: SetConvertTo,
) => TokenType | null | Promise<TokenType | null>;

// Non-raw funcs are pure number → number; the solver unwraps the operand
// values and re-wraps the result with the ambient unit.
export type NumericOpFunc = (...values: number[]) => number;

interface OperatorDefBase {
  precedence: number;
  operands: OperandSlot[];
  // Equal-precedence stacking. "left" (the default) keeps the earlier operator
  // tighter (`2-3-4` = `(2-3)-4`); "right" nests the incoming operator under
  // it. Enforced in CompleteState.handleOperator's precedence walk.
  associativity?: Associativity;
  description: string;
}

export type OperatorDef =
  | (OperatorDefBase & { isRaw: true; func: RawOpFunc })
  | (OperatorDefBase & { isRaw: false; func: NumericOpFunc });

const Operators: Record<string, OperatorDef> = {
  "~": {
    precedence: 1,
    operands: ["postnumber"],
    func: async ([_, n1]: TokenType[]) => {
      // ~P(a) → complement 1 - a, kept tagged so it can feed further prob ops.
      if (n1 instanceof NumberToken && n1.probability) {
        const x = n1.toNumber();
        if (x < 0 || x > 1) throw new UserError(7905);
        const result = tokenFactory(
          (1 - x).toString(),
          n1.numbertype,
        ) as NumberToken;
        result.probability = true;
        return result;
      }
      if (n1 instanceof NumberToken)
        return tokenFactory((~n1.toNumber()).toString(), n1.numbertype);

      if (n1 instanceof ColorToken) {
        const [red, green, blue] = chroma(n1.color).rgb();
        const color = chroma([255 - red, 255 - green, 255 - blue]);
        const colorToken = tokenFactory(
          color.hex(),
          TokenBaseType.COLOR,
        ) as ColorToken;
        colorToken.unit = n1.unit;
        return colorToken;
      }
      // ~mask → wildcard mask. withAddress folds the BigInt NOT back into the
      // family width (32/128), so ~255.255.255.0 → 0.0.0.255.
      if (n1 instanceof IpToken) return n1.withAddress(~n1.address);
      throw new UserError(5729);
    },
    isRaw: true,
    description: "Boolean Not operator",
  },
  comb: {
    precedence: 1,
    operands: ["prenumber", "postnumber"],
    func: arith.combination,
    isRaw: false,
    description: "Combinations operator",
  },
  perm: {
    precedence: 1,
    operands: ["prenumber", "postnumber"],
    func: arith.permutation,
    isRaw: false,
    description: "Permutations operator",
  },
  "!": {
    precedence: 2,
    operands: ["prenumber"],
    func: arith.factorial,
    isRaw: false,
    description: "Factorial operator",
  },
  "%": {
    precedence: 3,
    operands: ["prenumber"],
    func: async ([n1]: TokenType[]) => {
      if (!(n1 instanceof NumberToken)) throw new UserError(8651);
      return tokenFactory(
        (n1.toNumber() / 100).toString(),
        n1.numbertype,
        [],
        {},
        true,
      );
    },
    isRaw: true,
    description: "Percentage operator",
  },
  "^": {
    precedence: 4,
    operands: ["prenumber", "postnumber"],
    // Exponentiation is right-associative by mathematical convention (and in
    // Python, Excel, …): 2^3^2 = 2^(3^2) = 512, not (2^3)^2 = 64.
    associativity: "right",
    func: makePowFunc(),
    isRaw: true,
    description: "Power operator",
  },
  "**": {
    precedence: 4,
    operands: ["prenumber", "postnumber"],
    associativity: "right",
    func: makePowFunc(),
    isRaw: true,
    description: "Power operator",
  },
  "/": {
    precedence: 5,
    operands: ["prenumber", "postnumber"],
    func: makeMulDivFunc(-1),
    isRaw: true,
    description: "Divide operator",
  },
  mod: {
    precedence: 5,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 % n2,
    isRaw: false,
    description: "Modules operator",
  },
  "*": {
    precedence: 5,
    operands: ["prenumber", "postnumber"],
    func: makeMulDivFunc(+1),
    isRaw: true,
    description: "Multiplication operator",
  },
  "+": {
    precedence: 6,
    operands: ["prenumber", "postnumber"],
    func: async (params: TokenType[], expUnit: expressionUnit) => {
      const [n1, n2] = params;
      if (canAdd(n1)) return n1.add(n2, expUnit);
      throw new UserError(8651);
    },
    isRaw: true,
    description: "Addition operator",
  },
  "-": {
    precedence: 6,
    operands: ["prenumber", "postnumber"],
    func: async (params: TokenType[], expUnit: expressionUnit) => {
      const [n1, n2] = params;
      if (canSubtract(n1)) return n1.subtract(n2, expUnit);
      throw new UserError(1907);
    },
    isRaw: true,
    description: "Subtraction operator",
  },
  "of what is": {
    precedence: 7,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n2 / n1,
    isRaw: false,
    description: "Find the percent of x in relation to y",
  },
  off: {
    precedence: 7,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n2 - n2 * n1,
    isRaw: false,
    description: "Subtract percentage from a value",
  },
  "&": {
    precedence: 19,
    operands: ["prenumber", "postnumber"],
    func: makeBitwiseFunc("&"),
    isRaw: true,
    description:
      "Bitwise AND operator (ip & mask → network address, or numbers)",
  },
  "|": {
    precedence: 20,
    operands: ["prenumber", "postnumber"],
    func: makeBitwiseFunc("|"),
    isRaw: true,
    description: "Bitwise OR operator (ip | wildcard → broadcast, or numbers)",
  },
  xor: {
    precedence: 21,
    operands: ["prenumber", "postnumber"],
    func: makeBitwiseFunc("xor"),
    isRaw: true,
    description: "Bitwise XOR operator (ip or numbers)",
  },
  ">>": {
    precedence: 21,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 >> n2,
    isRaw: false,
    description: "Boolean Right Shift operator",
  },
  "<<": {
    precedence: 21,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 << n2,
    isRaw: false,
    description: "Boolean Left Shift operator",
  },
  on: {
    precedence: 22,
    operands: ["prestring", "postnumber"],
    func: async (params: TokenType[], toUnit: expressionUnit) => {
      if (!(params[0] instanceof UnitToken)) throw new UnhandledError(9010);
      if (params[0].unitdata.type !== UnitTypes.CURRENCY)
        throw new UnhandledError(9011);
      if (!(params[1] instanceof DateToken)) throw new UnhandledError(9012);
      // eslint-disable-next-line prefer-destructuring
      params[0].date = params[1];
      return params[0];
    },
    isRaw: true,
    description:
      "on Operator, used to specify date for operations like currency conversion",
  },
  to: {
    precedence: 23,
    operands: ["prenumber", "postunit"],
    func: async (
      params: TokenType[],
      toUnit: expressionUnit,
      setIsExplicit: (isExplicit: boolean) => void,
      setConvertTo: (convertTo: string[]) => void,
    ) => {
      // Coordinate-system conversion: `point(3,4) to polar`, `… to distance`,
      // `5 to vector`. The target is a CoordTargetToken stashed by NeedUnitState.
      if (params[1] instanceof CoordTargetToken) {
        setIsExplicit(true);
        return convertPointToken(params[0], params[1].target);
      }
      if (
        (params[0] instanceof NumberToken ||
          params[0] instanceof DateToken ||
          params[0] instanceof ColorToken ||
          params[0] instanceof IpToken) &&
        params[1] instanceof UnitToken
      ) {
        if (params[0] instanceof NumberToken && params.length > 2) {
          const convertTo: string[] = [];
          for (let i = 1; i < params.length; i++) {
            const target = params[i];
            if (!(target instanceof UnitToken)) throw new UserError(2333);
            if (params[0].unit?.value === target.value) {
              convertTo.push(target.prefix ? target.prefix.value : "_");
            } else convertTo.push(target.value);
          }
          setConvertTo(convertTo);
          return params[0];
        }
        setIsExplicit(true);
        return new ProcessConversions(params[0]).to(params[1]).convert();
      }
      throw new UnhandledError(9013);
    },
    isRaw: true,
    description: "to operator, used for units and other conversions",
  },
  "=": {
    precedence: 50,
    operands: ["prestring", "postnumber"],
    func: async ([variableName, result]: TokenType[]) => {
      result.variableName = variableName.value;
      return result;
    },
    isRaw: true,
    description: "Assign expression results to variable name",
  },
};

// Register trig (tan/sin/cos/sec/csc/cot) — base fn + optional reciprocal.
const TRIG: Array<
  [name: string, fn: (x: number) => number, invert: boolean, label: string]
> = [
  ["tan", Math.tan, false, "Tangent"],
  ["cos", Math.cos, false, "Cosine"],
  ["sin", Math.sin, false, "Sine"],
  ["sec", Math.cos, true, "Secant"],
  ["csc", Math.sin, true, "Cosecant"],
  ["cot", Math.tan, true, "Cotangent"],
];
for (const [name, fn, invert, label] of TRIG) {
  Operators[name] = {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => trigonometry(params, fn, invert),
    isRaw: true,
    description: `Trigonometric ${label} Function`,
  };
}

// Inverse trig (atan/acos/asin/asec/acsc/acot) — domain-restricted variants
// for arc-cos/arc-sin pass lessThanOne=true.
const ARC_TRIG: Array<
  [
    name: string,
    fn: (x: number) => number,
    invert: boolean,
    lessThanOne: boolean,
    label: string,
  ]
> = [
  ["atan", Math.atan, false, false, "Arc Tangent"],
  ["acos", Math.acos, false, true, "Arc Cosine"],
  ["asin", Math.asin, false, true, "Arc Sine"],
  ["asec", Math.acos, true, false, "Arc Secant"],
  ["acsc", Math.asin, true, false, "Arc Cosecant"],
  ["acot", Math.atan, true, false, "Arc Cotangent"],
];
for (const [name, fn, invert, lessThanOne, label] of ARC_TRIG) {
  Operators[name] = {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) =>
      arcTrigonometry(params, fn, invert, lessThanOne),
    isRaw: true,
    description: `Trigonometric ${label} Function`,
  };
}

// Hyperbolic & inverse hyperbolic. Reciprocals are `1 / fn(x)`. atanh and
// acosh have domain checks (their reciprocals csch/asech do *not* — those
// pass through NaN for out-of-domain like the originals).
type HypEntry = {
  fn: (x: number) => number;
  invert: boolean;
  guard?: (x: number) => void;
  label: string;
};
const guardAtanh = (x: number) => {
  if (x < -1 || x > 1) throw new UserError(4312);
};
const guardAcosh = (x: number) => {
  if (x < 1) throw new UserError(4312);
};
const HYP: Record<string, HypEntry> = {
  tanh: { fn: Math.tanh, invert: false, label: "Hyperbolic Tangent" },
  cosh: { fn: Math.cosh, invert: false, label: "Hyperbolic Cosine" },
  sinh: { fn: Math.sinh, invert: false, label: "Hyperbolic Sine" },
  sech: { fn: Math.cosh, invert: true, label: "Hyperbolic Secant" },
  csch: { fn: Math.sinh, invert: true, label: "Hyperbolic Cosecant" },
  coth: { fn: Math.tanh, invert: true, label: "Hyperbolic Cotangent" },
  atanh: {
    fn: Math.atanh,
    invert: false,
    guard: guardAtanh,
    label: "Inverse Hyperbolic Tangent",
  },
  acosh: {
    fn: Math.acosh,
    invert: false,
    guard: guardAcosh,
    label: "Inverse Hyperbolic Cosine",
  },
  asinh: { fn: Math.asinh, invert: false, label: "Inverse Hyperbolic Sine" },
  asech: { fn: Math.acosh, invert: true, label: "Inverse Hyperbolic Secant" },
  acsch: { fn: Math.asinh, invert: true, label: "Inverse Hyperbolic Cosecant" },
  acoth: {
    fn: Math.atanh,
    invert: true,
    label: "Inverse Hyperbolic Cotangent",
  },
};
for (const [name, { fn, invert, guard, label }] of Object.entries(HYP)) {
  Operators[name] = {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => {
      guard?.(val);
      return invert ? 1 / fn(val) : fn(val);
    },
    isRaw: false,
    description: `Trigonometric ${label} Function`,
  };
}

const LOGS: Array<[name: string, fn: (x: number) => number, base: string]> = [
  ["loge", Math.log, "e"],
  ["log2", Math.log2, "2"],
  ["log10", Math.log10, "10"],
];
for (const [name, fn, base] of LOGS) {
  Operators[name] = {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => {
      if (val < 0) throw new UserError(6892);
      return fn(val);
    },
    isRaw: false,
    description: `Log function with base ${base}`,
  };
}
// Flow-control token kinds. A literal union (not bare string) so every
// comparison site (`basetype === "BRAC_START"`) is typo-checked, and adding a
// bracket form means extending this union — the compiler then walks you to
// every dispatch site that must decide how to handle it.
export type ControllerKind = "BRAC_START" | "BRAC_END" | "COMMA";

const Controllers: Record<string, ControllerKind> = {
  "(": "BRAC_START",
  ")": "BRAC_END",
  ",": "COMMA",
};

async function trigonometry(
  params: TokenType[],
  func: typeof Math.tan | typeof Math.sin | typeof Math.cos,
  invert: boolean,
) {
  if (params.length > 2) throw new UserError(123);
  const param = params[1];
  if (!(param instanceof NumberToken)) throw new UserError(123);
  if (!param.unit || param.unit.value === "degree") {
    return tokenFactory(
      invert
        ? (1 / func(getRadFromDegrees(param.toNumber()))).toString()
        : func(getRadFromDegrees(param.toNumber())).toString(),
      TokenBaseType.DECIMAL,
    );
  }

  if (param.unit.value === "radian") {
    return tokenFactory(
      invert
        ? (1 / func(param.toNumber())).toString()
        : func(param.toNumber()).toString(),
      TokenBaseType.DECIMAL,
    );
  }

  if (param.unit && param.unit.unitdata.type !== UnitTypes.ANGLE)
    throw new UserError(321);

  const radVal = (await new ProcessConversions(param)
    .to(tokenFactory("radian", TokenBaseType.STRING) as UnitToken)
    .convert()) as NumberToken;
  return tokenFactory(
    invert
      ? (1 / func(radVal.toNumber())).toString()
      : func(radVal.toNumber()).toString(),
    TokenBaseType.DECIMAL,
  );
}

async function arcTrigonometry(
  params: TokenType[],
  func: typeof Math.atan | typeof Math.acos | typeof Math.asin,
  invert: boolean,
  lessThanOne = false,
) {
  if (params.length > 2) throw new UserError(123);
  const param = params[1];
  if (!(param instanceof NumberToken)) throw new UserError(123);
  if (param.unit) throw new UserError(126);
  if (lessThanOne && Math.abs(param.toNumber()) > 1) throw new UserError(127);

  const radToken = tokenFactory(
    invert
      ? (1 / func(param.toNumber())).toString()
      : func(param.toNumber()).toString(),
    TokenBaseType.DECIMAL,
  ) as NumberToken;

  radToken.unit = tokenFactory("radian", TokenBaseType.STRING) as UnitToken;
  const degreeToken = (await new ProcessConversions(radToken)
    .to(tokenFactory("degree", TokenBaseType.STRING) as UnitToken)
    .convert()) as NumberToken;
  return degreeToken;
}

function getRadFromDegrees(degrees: number) {
  return (degrees * Math.PI) / 180;
}

// Unit-aware multiplication / division. sign=+1 → `*`, sign=-1 → `/`.
// Composes operand units dimensionally; when the composition collapses to a
// dimensionless scalar (e.g., `5 km / 2 m`), the residual factor is folded
// into the numeric result and the result has no unit.
// A NumberToken or ComplexToken seen as a complex value (real → im 0).
function toCx(token: TokenType | undefined): Cx {
  if (token instanceof ComplexToken) return token.cx;
  if (token instanceof NumberToken) return { re: token.toNumber(), im: 0 };
  throw new UserError(8651);
}

function isComplexOperand(token: TokenType | undefined): boolean {
  return token instanceof ComplexToken;
}

function makeMulDivFunc(sign: 1 | -1) {
  return async (params: TokenType[]) => {
    const a = params[0];
    const b = params[1];
    // Point scaling: `point * scalar`, `scalar * point`, `point / scalar`.
    // `point * point` is undefined here (use dot()/cross()); `scalar / point`
    // has no meaning.
    if (a instanceof PointToken || b instanceof PointToken) {
      if (a instanceof PointToken && b instanceof NumberToken)
        return a.scale(sign === 1 ? b.toNumber() : 1 / b.toNumber());
      if (a instanceof NumberToken && b instanceof PointToken && sign === 1)
        return b.scale(a.toNumber());
      throw new UserError(8225);
    }
    // Matrix arithmetic. M*M → matrix multiply; M*scalar / scalar*M → scale;
    // M/scalar → scale by reciprocal; A/B → A·inverse(B); `scalar / M` is
    // undefined.
    if (a instanceof MatrixToken || b instanceof MatrixToken) {
      if (a instanceof MatrixToken && b instanceof MatrixToken)
        return new MatrixToken(
          sign === 1
            ? matMul(a.data, b.data)
            : matMul(a.data, matInverse(b.data)),
        );
      if (a instanceof MatrixToken && b instanceof NumberToken) {
        const k = b.toNumber();
        return new MatrixToken(matScale(a.data, sign === 1 ? k : 1 / k));
      }
      if (a instanceof NumberToken && b instanceof MatrixToken && sign === 1)
        return new MatrixToken(matScale(b.data, a.toNumber()));
      throw new UserError(9132);
    }
    // Complex multiplication / division (dimensionless; no unit composition).
    if (isComplexOperand(a) || isComplexOperand(b)) {
      const r = sign === 1 ? cxMul(toCx(a), toCx(b)) : cxDiv(toCx(a), toCx(b));
      return new ComplexToken(r.re, r.im);
    }
    if (!(a instanceof NumberToken) || !(b instanceof NumberToken))
      throw new UserError(8651);
    const aVal = a.toNumber();
    const bVal = b.toNumber();
    const numValue = sign === 1 ? aVal * bVal : aVal / bVal;
    const { unit, residualFactor } = composeUnits(a.unit, b.unit, sign);
    const value = numValue * residualFactor;
    const result = tokenFactory(value.toString(), a.numbertype) as NumberToken;
    if (unit) result.unit = unit;
    return result;
  };
}

// Raw power. Complex base/exponent goes through cxPow (exact for integer
// exponents, principal branch otherwise). Otherwise reproduces the original
// non-raw numeric behaviour: base ** exp, keeping the base's number base and
// the ambient unit (so `(5 m)^2 → 25 m`, `2^6 → 64`).
function makePowFunc() {
  return async (params: TokenType[], exprUnit: expressionUnit) => {
    const a = params[0];
    const b = params[1];
    // Matrix power: M^n for integer n (n>0 repeated multiply, 0 → identity,
    // n<0 → inverse). Exponent must be a plain integer; a matrix exponent is
    // undefined.
    if (a instanceof MatrixToken && b instanceof NumberToken)
      return new MatrixToken(matPow(a.data, b.toNumber()));
    if (a instanceof MatrixToken || b instanceof MatrixToken)
      throw new UserError(9133);
    if (isComplexOperand(a) || isComplexOperand(b)) {
      const r = cxPow(toCx(a), toCx(b));
      return new ComplexToken(r.re, r.im);
    }
    if (!(a instanceof NumberToken) || !(b instanceof NumberToken))
      throw new UserError(8651);
    const res = a.toNumber() ** b.toNumber();
    const result = tokenFactory(res.toString(), a.numbertype) as NumberToken;
    if (exprUnit) result.unit = exprUnit;
    return result;
  };
}

// Bitwise &/|/xor. When both operands are IPs (`ip & mask`), the op runs over
// the BigInt addresses and yields an IpToken (network/broadcast/…). Otherwise
// it reproduces the original 32-bit numeric behaviour, keeping the left
// operand's base (so `0x.. xor 0o..` stays hex) and the ambient unit.
function makeBitwiseFunc(op: "&" | "|" | "xor") {
  return async (params: TokenType[], exprUnit: expressionUnit) => {
    const [a, b] = params;
    if (a instanceof IpToken && b instanceof IpToken) {
      if (a.version !== b.version) throw new UserError(7304);
      const res =
        op === "&"
          ? a.address & b.address
          : op === "|"
            ? a.address | b.address
            : a.address ^ b.address;
      return a.withAddress(res, a.prefix ?? b.prefix);
    }
    // Probability overload: if either side is a tagged probability, treat both
    // as probabilities (independent events). `&` is intersection (a·b), `|` is
    // union (a+b-a·b), `xor` is symmetric difference (a+b-2a·b). The result is
    // kept tagged so `P(a) & P(b) & P(c)` chains. `5 & 3` (no P) stays bitwise.
    if (
      a instanceof NumberToken &&
      b instanceof NumberToken &&
      (a.probability || b.probability)
    ) {
      const x = a.toNumber();
      const y = b.toNumber();
      if (x < 0 || x > 1 || y < 0 || y > 1) throw new UserError(7905);
      const res =
        op === "&" ? x * y : op === "|" ? x + y - x * y : x + y - 2 * x * y;
      const result = tokenFactory(res.toString(), a.numbertype) as NumberToken;
      result.probability = true;
      return result;
    }
    if (a instanceof NumberToken && b instanceof NumberToken) {
      const x = a.toNumber();
      const y = b.toNumber();
      const res = op === "&" ? x & y : op === "|" ? x | y : x ^ y;
      const result = tokenFactory(res.toString(), a.numbertype) as NumberToken;
      if (exprUnit) result.unit = exprUnit;
      return result;
    }
    throw new UserError(7305);
  };
}

// Operand interface check for + and -. NumberToken/DateToken/ColorToken/IpToken
// all implement add; UnitToken adds subtract (city/city diff) but not add.
// Tokens that don't implement either fall through to the raise in the func.
type Addable = { add: (...args: any[]) => Promise<any> | any };
type Subtractable = { subtract: (...args: any[]) => Promise<any> | any };
function canAdd(t: TokenType | undefined): t is TokenType & Addable {
  return (
    t instanceof NumberToken ||
    t instanceof ComplexToken ||
    t instanceof DateToken ||
    t instanceof ColorToken ||
    t instanceof IpToken ||
    t instanceof MatrixToken ||
    t instanceof PointToken
  );
}
function canSubtract(t: TokenType | undefined): t is TokenType & Subtractable {
  return (
    t instanceof NumberToken ||
    t instanceof ComplexToken ||
    t instanceof DateToken ||
    t instanceof ColorToken ||
    t instanceof IpToken ||
    t instanceof MatrixToken ||
    t instanceof UnitToken ||
    t instanceof PointToken
  );
}

export { Controllers, Operators };
