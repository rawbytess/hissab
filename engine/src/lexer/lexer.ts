import { FreshState, LexerStateTypes } from "./lexer_states";
import { Tokens } from "./lexer_tokens";
import { Variables } from "../tokens/tokens";

function lexer(line: string, variables: Variables, lineNumber: number) {
  const NUMBERS = "0123456789";
  const STRING_BEGIN = "abcdefghijklmnopqrstuvwxyz_ABCDEFGHIJKLMNOPQRSTUVWXYZ";
  const SYMBOLS = "!%^&*()-+=~{}[]|/<>,:.#'\"";
  const CURRENCY = "лв₺₴₪₦č£₾ł₽元₹¥$₱৳₩₫฿₿ɱŁΞ€";
  const tokens = new Tokens(variables, lineNumber);

  let currentState: LexerStateTypes = FreshState;

  for (const char of line) {
    if (NUMBERS.includes(char)) {
      currentState = currentState.handleNumber(tokens, char);
    } else if (STRING_BEGIN.includes(char)) {
      currentState = currentState.handleString(tokens, char);
    } else if (SYMBOLS.includes(char)) {
      currentState = currentState.handleSymbol(tokens, char);
    } else if (/\s/.test(char)) {
      currentState = currentState.handleWhiteSpace(tokens, char);
    } else if (CURRENCY.includes(char)) continue;
    else {
      currentState = currentState.handleUndefined(tokens, char);
    }
  }
  tokens.flushToken();
  return tokens.tokens;
}

export default lexer;
