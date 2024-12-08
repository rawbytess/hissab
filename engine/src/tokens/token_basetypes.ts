import {
  ColorToken,
  ControllerToken,
  DateToken,
  FunctionToken,
  NumberToken,
  OperatorToken,
  ResultToken,
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
  RESULT,
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
  | ResultToken
  | UndefinedToken;

export default TokenBaseType;
