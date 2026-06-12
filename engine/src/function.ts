// Historical import path for the engine's function table. The implementation
// lives in ./functions/ (one module per calculator domain — statistics,
// finance, geometry, …; see ./functions/index.ts). This shim keeps every
// consumer (token_factory, index.ts, downstream workspaces) and the engine's
// module-init order unchanged.
import Functions from "./functions";

export type { FunctionDef, NumericFn, RawFn } from "./functions/types";
export default Functions;
