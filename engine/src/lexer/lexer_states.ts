import TokenBaseType from "../tokens/token_basetypes";
import { isMultiSymbol } from "../tokens/tokens";
import type { TokensType } from "./lexer_tokens";

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
  | typeof Ip4State
  | typeof Ip6State
  | typeof ColonState
  | typeof UndefinedState;

// IP-address recognition helpers. Disambiguation from dates (`.`) and times
// (`:`) hinges on these: IPv4 is the *third* dot (dates have two), IPv6 is the
// `::`, the fourth `:` (times max out at h:m:s:ms = three), or a hex group.
function isHexChar(char: string): boolean {
  return /[0-9a-fA-F]/.test(char);
}
function isHexGroup(token: string): boolean {
  return /^[0-9a-fA-F]{1,4}$/.test(token);
}
function colonCount(token: string): number {
  let count = 0;
  for (const c of token) if (c === ":") count++;
  return count;
}

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

  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    // A leading `:` might begin a `::`-compressed IPv6 literal (`::1`, `::`).
    // Defer the decision to ColonState, which peeks at the next char.
    if (char === ":") {
      tokens.thetoken += char;
      return ColonState;
    }
    return LexerStates.handleSymbol(tokens, char);
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
      // Count this dot like DecimalState does, so the dot tally stays correct
      // for a leading-zero octet (`0.0.0.255`) — otherwise the third-dot IPv4
      // hand-off in DateState never fires and the run is misread as a date.
      tokens.float += 1;
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

  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    // DateState means two dots already (dd.mm.yyyy). A *third* dot can only be
    // an IPv4 address (a.b.c.d) — dates never have three. Hand off to Ip4State.
    if (char === ".") {
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.IP;
      return Ip4State;
    }
    return LexerStates.handleSymbol(tokens, char);
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
      // `::` (empty group) or a 4th colon (a time has at most three —
      // h:m:s:ms) is unambiguously IPv6, not a time.
      if (tokens.thetoken.endsWith(":") || colonCount(tokens.thetoken) >= 3) {
        tokens.thetoken += char;
        tokens.tokentype = TokenBaseType.IP;
        return Ip6State;
      }
      tokens.thetoken += char;
      return TimeState;
    }
    return LexerStates.handleSymbol(tokens, char);
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    // A hex letter starting a group right after a colon (`2001:` → `d`) means
    // IPv6. The `endsWith(":")` guard keeps a trailing meridian intact:
    // `3:30am` — the `a` follows `0`, not `:`, so it stays time + meridian.
    if (isHexChar(char) && tokens.thetoken.endsWith(":")) {
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.IP;
      return Ip6State;
    }
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
    // A bare hex group followed by `:` begins an IPv6 literal whose first group
    // is alphabetic (`fe80::1`, `db8::`, `face:b00c::`). The `^[0-9a-fA-F]{1,4}$`
    // guard keeps this from firing on ordinary words.
    if (char === ":" && !tokens.multiWord && isHexGroup(tokens.thetoken)) {
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.IP;
      return Ip6State;
    }
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

// Accumulates an IPv4 literal (and its optional `/<prefix>` CIDR suffix) after
// DateState detected the third dot. Validation happens in tokenFactory.buildIp;
// an invalid run becomes an UndefinedToken there.
class Ip4State extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    return Ip4State;
  }

  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    // `.` extends the dotted quad; `/` begins the CIDR prefix (only when
    // written without spaces — `a.b.c.d / n` stays division).
    if (char === "." || char === "/") {
      tokens.thetoken += char;
      return Ip4State;
    }
    return LexerStates.handleSymbol(tokens, char);
  }
}

// Accumulates an IPv6 literal: hextets, `:` separators, `::` compression, a
// `/<prefix>` CIDR suffix, and `.` for IPv4-mapped tails (`::ffff:1.2.3.4`).
class Ip6State extends LexerStates {
  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.thetoken += char;
    return Ip6State;
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    if (isHexChar(char)) {
      tokens.thetoken += char;
      return Ip6State;
    }
    return LexerStates.handleString(tokens, char);
  }

  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    if (char === ":" || char === "/" || char === ".") {
      tokens.thetoken += char;
      return Ip6State;
    }
    return LexerStates.handleSymbol(tokens, char);
  }
}

// Reached from FreshState on a leading `:`. A following `:` confirms a
// `::`-compressed IPv6 literal; anything else means the `:` was a stray symbol
// (emitted as-is, preserving the prior behaviour), and the char is reprocessed.
class ColonState extends LexerStates {
  static handleSymbol(tokens: TokensType, char: string): LexerStateTypes {
    if (char === ":") {
      tokens.thetoken += char;
      tokens.tokentype = TokenBaseType.IP;
      return Ip6State;
    }
    tokens.flushToken(TokenBaseType.SYMBOL);
    return LexerStates.handleSymbol(tokens, char);
  }

  static handleNumber(tokens: TokensType, char: string): LexerStateTypes {
    tokens.flushToken(TokenBaseType.SYMBOL);
    return FreshState.handleNumber(tokens, char);
  }

  static handleString(tokens: TokensType, char: string): LexerStateTypes {
    tokens.flushToken(TokenBaseType.SYMBOL);
    return FreshState.handleString(tokens, char);
  }

  static handleWhiteSpace(tokens: TokensType, _char: string): LexerStateTypes {
    tokens.flushToken(TokenBaseType.SYMBOL);
    return FreshState;
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
  BinaryState,
  DecimalState,
  FreshState,
  HexState,
  OctalState,
  StringState,
  SymbolState,
  UndefinedState,
  ZeroState,
};
