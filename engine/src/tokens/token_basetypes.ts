import type {
  BooleanToken,
  ColorToken,
  ComplexToken,
  ControllerToken,
  DateToken,
  ExprToken,
  FunctionToken,
  IpToken,
  NumberToken,
  OperatorToken,
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
  | VariableNameToken
  | UndefinedToken;

export default TokenBaseType;
