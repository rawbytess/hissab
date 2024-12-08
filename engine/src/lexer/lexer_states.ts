import { isMultiSymbol } from "../tokens/tokens";
import TokenBaseType from "../tokens/token_basetypes";
import { TokensType } from "./lexer_tokens";

export type LexerStateTypes =
  | typeof FreshState
  | typeof ZeroState
  | typeof BinaryState
  | typeof HexState
  | typeof DateState
  | typeof DecimalState
  | typeof OctalState
  | typeof TimeState
  | typeof StringState
  | typeof SymbolState
  | typeof ColorState
  | typeof UndefinedState;

class LexerStates {
  static handleZero(tokens: TokensType, char: string): LexerStateTypes {
    return LexerStates.handleNumber(tokens, char);
  }

  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.DECIMAL;
    return DecimalState;
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.STRING;
    return StringState;
  }

  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    tokens.flushToken();
    if (isMultiSymbol(char)) {
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.SYMBOL;
      return SymbolState;
    }
    if (char === "#") {
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.COLOR;
      return ColorState;
    }
    tokens.thetoken += char;
    tokens.flushToken(TokenBaseType.SYMBOL);
    return FreshState;
  }

  static handleWhiteSpace(tokens: TokensType, char: string): LexerStateTypes {
    tokens.flushToken();
    return FreshState;
  }

  static handleUndefined(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.UNDEFINED;
    return UndefinedState;
  }
}

class FreshState extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.DECIMAL;
    if (char === "0") {
      return ZeroState;
    }
    return DecimalState;
  }
}

class ColorState extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    if (tokens.thetoken.length > 9) {
      tokens.tokentype = TokenBaseType.UNDEFINED;
      return UndefinedState;
    }

    tokens.tokentype = TokenBaseType.COLOR;
    return ColorState;
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    if ("ABCDEF".includes(char.toUpperCase()) && tokens.thetoken.length < 9) {
      tokens.tokentype = TokenBaseType.COLOR;
      return ColorState;
    }
    tokens.tokentype = TokenBaseType.UNDEFINED;
    return UndefinedState;
  }
}

class ZeroState extends LexerStates {
  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    if (char.toUpperCase() === "B") {
      tokens.tokentype = TokenBaseType.UNDEFINED;
      return BinaryState;
    }
    if (char.toUpperCase() === "O") {
      tokens.tokentype = TokenBaseType.UNDEFINED;
      return OctalState;
    }
    if (char.toUpperCase() === "X") {
      tokens.tokentype = TokenBaseType.UNDEFINED;
      return HexState;
    }
    tokens.flushToken();
    return StringState;
  }

  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    if (char === ".") {
      tokens.tokentype = TokenBaseType.UNDEFINED;
      return DecimalState;
    }
    return LexerStates.handleSymbol(tokens, char);
  }
}

class BinaryState extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    if ("01".includes(char)) {
      tokens.tokentype = TokenBaseType.BINARY;
      return BinaryState;
    }
    tokens.tokentype = TokenBaseType.UNDEFINED;
    return UndefinedState;
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.UNDEFINED;
    return UndefinedState;
  }
}

class OctalState extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    if ("01234567".includes(char)) {
      tokens.tokentype = TokenBaseType.OCTAL;
      return OctalState;
    }
    tokens.tokentype = TokenBaseType.UNDEFINED;
    return UndefinedState;
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.UNDEFINED;
    return UndefinedState;
  }
}

class HexState extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.HEX;
    return HexState;
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    if ("ABCDEF".includes(char.toUpperCase())) {
      tokens.tokentype = TokenBaseType.HEX;
      return HexState;
    }
    tokens.tokentype = TokenBaseType.UNDEFINED;
    return UndefinedState;
  }
}

class DecimalState extends LexerStates {
  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    tokens.flushToken();
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.STRING;
    return StringState;
  }

  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    if (char === "." && tokens.float === 0) {
      tokens.float += 1;
      tokens.thetoken += char;
      return DecimalState;
    }
    if (char === "." && tokens.float === 1) {
      tokens.float += 1;
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.DATE;
      return DateState;
    }
    if (char === "." && tokens.float > 1) {
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.UNDEFINED;
      return UndefinedState;
    }
    if (char === ":") {
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.TIME;
      return TimeState;
    }
    if (char === "'" || char === '"') {
      tokens.flushToken();
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.STRING;
      tokens.flushToken();
      return FreshState;
    }
    return LexerStates.handleSymbol(tokens, char);
  }
}

class DateState extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    return DateState;
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    return DecimalState.handleString(tokens, char);
  }
}

class TimeState extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    return TimeState;
  }

  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    if (char === ":") {
      tokens.thetoken += char;
      return TimeState;
    }
    return LexerStates.handleSymbol(tokens, char);
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    return DecimalState.handleString(tokens, char);
  }
}

class StringState extends LexerStates {
  static handleNumber(tokens: TokensType, char: string) {
    if (tokens.multiWord) {
      tokens.flushToken();
      return FreshState.handleNumber(tokens, char);
    }
    return StringState.handleString(tokens, char);
  }

  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    if (char === "=") {
      tokens.multiWord = false;
      tokens.flushToken(TokenBaseType.VARIABLENAME);
    } else tokens.flushToken();
    if (isMultiSymbol(char)) {
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.SYMBOL;
      return SymbolState;
    }
    tokens.thetoken += char;
    tokens.flushToken(TokenBaseType.SYMBOL);
    return FreshState;
  }

  static handleWhiteSpace(tokens: TokensType, char: string): LexerStateTypes {
    if (char === " " || char === "\t") {
      tokens.multiWord = true;
      tokens.thetoken += char;
      return StringState;
    }
    return LexerStates.handleUndefined(tokens, char);
  }
}

class SymbolState extends LexerStates {
  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    if (isMultiSymbol(tokens.thetoken + char)) {
      tokens.thetoken += char;
      return SymbolState;
    }
    return LexerStates.handleSymbol(tokens, char);
  }

  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.flushToken();
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.DECIMAL;
    return DecimalState;
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    tokens.flushToken();
    tokens.thetoken += char;
    tokens.tokentype = TokenBaseType.STRING;
    return StringState;
  }
}

class UndefinedState extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    return UndefinedState.handleUndefined(tokens, char);
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    return UndefinedState.handleUndefined(tokens, char);
  }
}

export {
  FreshState,
  ZeroState,
  UndefinedState,
  SymbolState,
  StringState,
  DecimalState,
  HexState,
  OctalState,
  BinaryState,
};
