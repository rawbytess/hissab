// Function definitions mirror OperatorDef: a discriminated union on `isRaw`
// so a definition cannot declare one calling convention and implement the
// other (the solver in parsetree.ts narrows on it). All imports here are
// type-only — erased at compile time, so this module adds no edges to the
// engine's init-order-sensitive runtime graph.
import type { TokenType } from "../tokens/token_basetypes";
import type { expressionUnit } from "../tokens/tokens";
import type { SetConvertTo, SetIsExplicit } from "../types/operator_types";

// Raw functions receive the call's token args plus the ambient unit context.
// The nullable return mirrors tokenFactory; the solver guards before grafting.
export type RawFn = (
  args: TokenType[],
  exprUnit: expressionUnit,
  setIsExplicit: SetIsExplicit,
  setConvertTo: SetConvertTo,
) => TokenType | null | Promise<TokenType | null>;

// Non-raw functions are pure number → number over the unwrapped arg values.
export type NumericFn = (...values: number[]) => number;

interface FunctionDefBase {
  description: string;
  // Entropy-drawing functions (`random`, `uuid`) whose output is NOT a pure
  // function of the written expression. Consumers read this flag (via the
  // exported `Functions` table) to manage stability — the app editor injects a
  // `@seed` arg so the value is reproducible across re-evaluation. Pure
  // functions omit it (defaults to falsy).
  impure?: boolean;
}

export type FunctionDef =
  | (FunctionDefBase & { isRaw: true; run: RawFn })
  | (FunctionDefBase & { isRaw: false; run: NumericFn });
