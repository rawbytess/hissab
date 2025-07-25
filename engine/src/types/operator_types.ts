import chroma from "chroma-js";
import * as arith from "../arithmetic_functions";
import { UnhandledError, UserError } from "../exceptions";
import TokenBaseType, { type TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import {
  ColorToken,
  DateToken,
  type expressionUnit,
  NumberToken,
  UnitToken,
} from "../tokens/tokens";
import ProcessConversions from "../units_processor";
import UnitTypes from "./unit_enum";

type operatorType = {
  [op: string]: {
    precedence: number;
    operands: string[];
    func: any;
    isRaw: boolean;
    needsPro: boolean;
    description: string;
  };
};

const Operators: operatorType = {
  "~": {
    precedence: 1,
    operands: ["postnumber"],
    func: async ([_, n1]: NumberToken[] | ColorToken[]) => {
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
      throw new UserError(5729);
    },
    isRaw: true,
    needsPro: false,
    description: "Boolean Not operator",
  },
  comb: {
    precedence: 1,
    operands: ["prenumber", "postnumber"],
    func: arith.combination,
    isRaw: false,
    needsPro: false,
    description: "Combinations operator",
  },
  perm: {
    precedence: 1,
    operands: ["prenumber", "postnumber"],
    func: arith.permutation,
    isRaw: false,
    needsPro: false,
    description: "Permutations operator",
  },
  "!": {
    precedence: 2,
    operands: ["prenumber"],
    func: arith.factorial,
    isRaw: false,
    needsPro: false,
    description: "Factorial operator",
  },
  "%": {
    precedence: 3,
    operands: ["prenumber"],
    func: async ([n1]: NumberToken[]) =>
      tokenFactory(
        (n1.toNumber() / 100).toString(),
        n1.numbertype,
        [],
        {},
        true,
      ),
    isRaw: true,
    needsPro: false,
    description: "Percentage operator",
  },
  "^": {
    precedence: 4,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 ** n2,
    isRaw: false,
    needsPro: false,
    description: "Power operator",
  },
  "**": {
    precedence: 4,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 ** n2,
    isRaw: false,
    needsPro: false,
    description: "Power operator",
  },
  "/": {
    precedence: 5,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 / n2,
    isRaw: false,
    needsPro: false,
    description: "Divide operator",
  },
  mod: {
    precedence: 5,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 % n2,
    isRaw: false,
    needsPro: false,
    description: "Modules operator",
  },
  "*": {
    precedence: 5,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 * n2,
    isRaw: false,
    needsPro: false,
    description: "Multiplication operator",
  },
  "+": {
    precedence: 6,
    operands: ["prenumber", "postnumber"],
    func: async (
      params: TokenType[],
      expUnit: expressionUnit,
      a: any,
      b: any,
      isPro: boolean,
    ) => {
      const [n1, n2] = params;
      if (
        n1 instanceof NumberToken ||
        n1 instanceof DateToken ||
        n1 instanceof ColorToken
      )
        return n1.add(n2, expUnit, isPro);
      throw new UserError(8651);
    },
    isRaw: true,
    needsPro: false,
    description: "Addition operator",
  },
  "-": {
    precedence: 6,
    operands: ["prenumber", "postnumber"],
    func: async (
      params: TokenType[],
      expUnit: expressionUnit,
      a: any,
      b: any,
      isPro: boolean,
    ) => {
      const [n1, n2] = params;
      if (
        n1 instanceof NumberToken ||
        n1 instanceof DateToken ||
        n1 instanceof ColorToken ||
        n1 instanceof UnitToken
      )
        return n1.subtract(n2, expUnit, isPro);
      throw new UserError(1907);
    },
    isRaw: true,
    needsPro: false,
    description: "Subtraction operator",
  },
  "of what is": {
    precedence: 7,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n2 / n1,
    isRaw: false,
    needsPro: false,
    description: "Find the percent of x in relation to y",
  },
  off: {
    precedence: 7,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n2 - n2 * n1,
    isRaw: false,
    needsPro: false,
    description: "Subtract percentage from a value",
  },
  "&": {
    precedence: 19,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 & n2,
    isRaw: false,
    needsPro: false,
    description: "Boolean And operator",
  },
  "|": {
    precedence: 20,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 | n2,
    isRaw: false,
    needsPro: false,
    description: "Boolean Not operator",
  },
  xor: {
    precedence: 21,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 ^ n2,
    isRaw: false,
    needsPro: false,
    description: "Boolean XOR operator",
  },
  ">>": {
    precedence: 21,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 >> n2,
    isRaw: false,
    needsPro: false,
    description: "Boolean Right Shift operator",
  },
  "<<": {
    precedence: 21,
    operands: ["prenumber", "postnumber"],
    func: (n1: number, n2: number): number => n1 << n2,
    isRaw: false,
    needsPro: false,
    description: "Boolean Left Shift operator",
  },
  on: {
    precedence: 22,
    operands: ["prestring", "postnumber"],
    func: async (params: TokenType[], toUnit: expressionUnit) => {
      if (!(params[0] instanceof UnitToken)) throw new UnhandledError(0);
      if (params[0].unitdata.type !== UnitTypes.CURRENCY)
        throw new UnhandledError(0);
      if (!(params[1] instanceof DateToken)) throw new UnhandledError(0);
      // eslint-disable-next-line prefer-destructuring
      params[0].date = params[1];
      return params[0];
    },
    isRaw: true,
    needsPro: true,
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
      isPro: boolean,
    ) => {
      if (
        (params[0] instanceof NumberToken ||
          params[0] instanceof DateToken ||
          params[0] instanceof ColorToken) &&
        params[1] instanceof UnitToken
      ) {
        if (params[0] instanceof NumberToken && params.length > 2) {
          const convertTo: string[] = [];
          for (let i = 1; i < params.length; i++) {
            if (!(params[i] instanceof UnitToken)) throw new UserError(2333);
            if (params[0].unit?.value === params[i].value) {
              // @ts-ignore
              convertTo.push(params[i].prefix ? params[i].prefix.value : "_");
            } else convertTo.push(params[i].value);
          }
          setConvertTo(convertTo);
          return params[0];
        }
        setIsExplicit(true);
        return new ProcessConversions(params[0]).to(params[1]).convert(isPro);
      }
      throw new UnhandledError(0);
    },
    isRaw: true,
    needsPro: false,
    description: "to operator, used for units and other conversions",
  },
  /* fraction: {
    precedence: 24,
    operands: ["postnumber"],
    func: async (
      [variableName, result]: [TokenType, TokenType],
      expUnit: expressionUnit
    ) => {
      result.variableName = variableName.value;
      if (expUnit && result instanceof NumberToken) result.unit = expUnit;
      return result;
    },
    isRaw: false,
    needsPro: true,
    description: "Calculate simplified fraction value",
  }, */
  "=": {
    precedence: 50,
    operands: ["prestring", "postnumber"],
    func: async (
      [variableName, result]: [TokenType, TokenType],
      expUnit: expressionUnit,
    ) => {
      result.variableName = variableName.value;
      // if (expUnit && result instanceof NumberToken) result.unit = expUnit;
      return result;
    },
    isRaw: true,
    needsPro: false,
    description: "Assign expression results to variable name",
  },

  tan: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await trigonometry(params, Math.tan, false);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Tangent Function",
  },
  cos: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await trigonometry(params, Math.cos, false);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Cosine Function",
  },
  sin: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await trigonometry(params, Math.sin, false);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Sine Function",
  },
  sec: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await trigonometry(params, Math.cos, true);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Secant Function",
  },
  csc: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await trigonometry(params, Math.sin, true);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Cosecant Function",
  },
  cot: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await trigonometry(params, Math.tan, true);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Cotangent Function",
  },
  atan: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await arcTrigonometry(params, Math.atan, false);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Arc Tangent Function",
  },
  acos: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await arcTrigonometry(params, Math.acos, false, true);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Arc Cosine Function",
  },
  asin: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await arcTrigonometry(params, Math.asin, false, true);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Arc Sine Function",
  },
  asec: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await arcTrigonometry(params, Math.acos, true);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Arc Secant Function",
  },
  acsc: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await arcTrigonometry(params, Math.asin, true);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Arc Cosecant Function",
  },
  acot: {
    precedence: 3,
    operands: ["postnumber"],
    func: async (params: TokenType[]) => {
      const val = await arcTrigonometry(params, Math.atan, true);
      return val;
    },
    isRaw: true,
    needsPro: true,
    description: "Trigonometric Arc Cotangent Function",
  },
  tanh: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => Math.tanh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Hyperbolic Tangent Function",
  },
  cosh: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => Math.cosh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Hyperbolic Cosine Function",
  },
  sinh: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => Math.sinh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Hyperbolic Sine Function",
  },
  sech: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => 1 / Math.cosh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Hyperbolic Secant Function",
  },
  csch: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => 1 / Math.sinh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Hyperbolic Cosecant Function",
  },
  coth: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => 1 / Math.tanh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Hyperbolic Cotangent Function",
  },
  atanh: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => {
      if (val < -1 || val > 1) throw new UserError(4312);
      return Math.atanh(val);
    },
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Inverse Hyperbolic Tangent Function",
  },
  acosh: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => {
      if (val < 1) throw new UserError(4312);
      return Math.acosh(val);
    },
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Inverse Hyperbolic Cosine Function",
  },
  asinh: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => Math.asinh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Inverse Hyperbolic Sine Function",
  },
  asech: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => 1 / Math.acosh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Inverse Hyperbolic Secant Function",
  },
  acsch: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => 1 / Math.asinh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Inverse Hyperbolic Cosecant Function",
  },
  acoth: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => 1 / Math.atanh(val),
    isRaw: false,
    needsPro: true,
    description: "Trigonometric Inverse Hyperbolic Cotangent Function",
  },

  loge: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => {
      if (val < 0) throw new UserError(6892);
      return Math.log(val);
    },
    isRaw: false,
    needsPro: true,
    description: "Log function with base e",
  },
  log2: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => {
      if (val < 0) throw new UserError(6892);
      return Math.log2(val);
    },
    isRaw: false,
    needsPro: true,
    description: "Log function with base 2",
  },
  log10: {
    precedence: 3,
    operands: ["postnumber"],
    func: (val: number) => {
      if (val < 0) throw new UserError(6892);
      return Math.log10(val);
    },
    isRaw: false,
    needsPro: true,
    description: "Log function with base 10",
  },
  // log: { precedence: 1, operands: ["postnumber"], func: () => {} },
};
type ControllerType = {
  [controller: string]: string;
};
const Controllers: ControllerType = {
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
    .convert(true)) as NumberToken;
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
    .convert(true)) as NumberToken;
  return degreeToken;
}

function getRadFromDegrees(degrees: number) {
  return (degrees * Math.PI) / 180;
}

export { Operators, Controllers };
