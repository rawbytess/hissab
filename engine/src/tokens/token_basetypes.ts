import type {
  BooleanToken,
  ColorToken,
  ComplexToken,
  ControllerToken,
  CoordTargetToken,
  DateToken,
  ExprToken,
  FunctionToken,
  IpToken,
  NumberToken,
  OperatorToken,
  PointToken,
  StringToken,
  SymbolToken,
  UndefinedToken,
  UnitToken,
  VariableNameToken,
  VariableToken,
} from "./tokens";

enum TokenBaseType {
  UNDEFINED,
  BINARY = 2,
  OCTAL = 8,
  DECIMAL = 10,
  HEX = 16,
  STRING,
  SYMBOL,
  DATE,
  TIME,
  VARIABLENAME,
  COLOR,
  IP,
  BOOLEAN,
}

export type TokenType =
  | NumberToken
  | OperatorToken
  | ControllerToken
  | UnitToken
  | FunctionToken
  | StringToken
  | DateToken
  | VariableToken
  | ColorToken
  | IpToken
  | BooleanToken
  | ComplexToken
  | SymbolToken
  | ExprToken
  | PointToken
  | CoordTargetToken
  | VariableNameToken
  | UndefinedToken;

export default TokenBaseType;
