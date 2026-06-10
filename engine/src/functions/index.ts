// The engine's function table, aggregated from one module per calculator
// domain. Adding a function means editing (or adding) a domain module and, if
// new, spreading it here — name collisions across domains fail loudly at
// module init.
//
// Init-order caution (inherited from the original single-file function.ts):
// the engine has a unit_types ↔ token_factory ↔ plurals load-order cycle.
// token_factory must be the FIRST entry into that cluster — its own import
// sequence is the only one that initializes Units before plurals reads it.
// The side-effect import below guarantees that before any domain module pulls
// tokens.ts/unit_types.ts directly. Domain modules must never call
// tokenFactory or read Units at module top level — only inside function
// bodies.
import "../tokens/token_factory";

import { UnhandledError } from "../exceptions";
import { arithmeticFunctions } from "./arithmetic";
import { colorFunctions } from "./color";
import { coordinatesFunctions } from "./coordinates";
import { financeFunctions } from "./finance";
import { geometryFunctions } from "./geometry";
import { healthFunctions } from "./health";
import { ipFunctions } from "./ip";
import { matrixFunctions } from "./matrix";
import { probabilityFunctions } from "./probability";
import { randomFunctions } from "./random";
import { statisticsFunctions } from "./statistics";
import { symbolicFunctions } from "./symbolic";
import type { FunctionDef } from "./types";
import { visualizationFunctions } from "./visualization";

const domains: Record<string, FunctionDef>[] = [
  statisticsFunctions,
  arithmeticFunctions,
  colorFunctions,
  financeFunctions,
  geometryFunctions,
  healthFunctions,
  ipFunctions,
  probabilityFunctions,
  symbolicFunctions,
  coordinatesFunctions,
  matrixFunctions,
  visualizationFunctions,
  randomFunctions,
];

const Functions: Record<string, FunctionDef> = {};
for (const domain of domains) {
  for (const [name, def] of Object.entries(domain)) {
    // Two domains registering the same function name shadow each other
    // silently with a plain spread — fail loudly instead.
    if (name in Functions) throw new UnhandledError(9006);
    Functions[name] = def;
  }
}

export type { FunctionDef, NumericFn, RawFn } from "./types";
export default Functions;
