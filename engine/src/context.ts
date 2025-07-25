import TokenBaseType from "./tokens/token_basetypes";
import type { UnitToken } from "./tokens/tokens";

interface contextIf {
  isPro: boolean;
  financeURL: string;

  expression: {
    unit: UnitToken | undefined;
    explicit: boolean;
    numberSystem:
      | TokenBaseType.HEX
      | TokenBaseType.DECIMAL
      | TokenBaseType.OCTAL
      | TokenBaseType.BINARY;
  };

  preferredUnits: {
    length: "metric" | "imperial" | undefined;
    weight: "metric" | "imperial" | undefined;
    currency: string | undefined;
  };
}

const context: contextIf = {
  isPro: false,
  financeURL: "http://localhost:3000/data/finance",
  expression: {
    unit: undefined,
    explicit: false,
    numberSystem: TokenBaseType.DECIMAL,
  },
  preferredUnits: {
    length: undefined,
    weight: undefined,
    currency: undefined,
  },
};

export default context;
