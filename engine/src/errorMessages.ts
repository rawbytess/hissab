// Human-readable messages for the most common, user-facing `UserError` codes.
// Codes are thrown across the engine via `throw new UserError(<code>)`. This
// map turns the ones a user (or an LLM driving Hissab) is likely to hit into
// actionable text so failures can be understood and repaired. Unmapped codes
// fall back to a generic message in `exceptions.ts` — only add an entry here
// once the throw site's exact meaning is confirmed, since a wrong message is
// worse than the generic one.
export const userErrorMessages: Record<number, string> = {
  // Input / top level (index.ts)
  101: "The expression is empty.",
  102: "There is nothing to evaluate in this expression.",
  103: "This expression contains text Hissab doesn't recognize (an unknown word, a misspelled unit, or an unsupported function). Check the spelling — unrecognized words are not ignored.",
  6235: "This expression did not resolve to a value. Check that it forms a complete calculation.",

  // Units & conversion (units_processor.ts, pro.ts)
  1908: "Unrecognized unit in the value being converted. Check the spelling — and note `m` means million, so spell out `meter`.",
  7649: "Unrecognized target unit after `to`. Check the unit spelling.",
  2334: "These units measure different things, so they can't be converted into one another (e.g. length to weight).",
  3907: "These quantities have incompatible units for this operation.",

  // Implicit addition / compound quantities (parser_states.ts)
  223: "Numbers written next to each other are only combined when a unit is involved (e.g. `5 feet 10 inch`). Put an operator like `+` between plain numbers.",

  // Compound units (parser_states.ts)
  3908: "Only kelvin and rankine temperature units may appear inside compound units (celsius and fahrenheit cannot — their conversion is affine).",
  3909: "Currency units cannot appear inside compound units.",

  // Permutation / combination (arithmetic_functions.ts)
  6743: "In a permutation, n must be greater than or equal to r.",
  7453: "In a combination, n must be greater than or equal to r.",

  // Set / aggregate functions (function.ts)
  5209: "`lcm` needs at least two numbers.",
  5309: "`gcd` needs at least two numbers.",
  6341: "This function needs at least one value.",

  // Statistics (function.ts) — each needs at least one number
  5318: "`harmonic mean` needs at least one number.",
  5319: "`geometric mean` needs at least one number.",
  5329: "`standard deviation` needs at least one number.",
  5339: "`variance` needs at least one number.",
  5349: "`median` needs at least one number.",
  5359: "`range` needs at least one number.",

  // Single-argument arithmetic (function.ts)
  12343: "`abs` takes a single value.",

  // Color (function.ts, tokens.ts)
  63434: "Wrong number of color components (`rgb` takes 3-4, `hsl` takes 3).",
  976: "Invalid color values.",
  9877: "Invalid color.",

  // Trigonometry (operator_types.ts)
  123: "This trigonometric function received an invalid argument.",
  126: "Inverse trigonometric functions take a plain number with no unit.",
  127: "The argument to `asin`/`acos` must be between -1 and 1.",
  321: "Trigonometric functions expect an angle (degree or radian).",
  4312: "The value is outside the valid domain for this inverse hyperbolic function.",

  // Logarithm (operator_types.ts)
  6892: "Logarithm is undefined for negative numbers.",

  // Arithmetic on non-numeric operands (operator_types.ts, tokens.ts)
  8651: "This operation expects numeric values.",
};

export default userErrorMessages;
