import type {
  ColorToken,
  ControllerToken,
  DateToken,
  FunctionToken,
  NumberToken,
  OperatorToken,
  StringToken,
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
  | VariableNameToken
  | UndefinedToken;

export default TokenBaseType;
