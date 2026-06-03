// Public surface of the symbolic subsystem. The seam between *representation*
// (the Expr AST + bridge + renderer, all shipped) and *computation* (simplify +
// complex arithmetic shipped; solve/calculus to come) lives here.

export { differentiate, evaluate, integrate, subst } from "./calculus";
export {
  type Cx,
  cx,
  cxAdd,
  cxDiv,
  cxMul,
  cxPow,
  cxString,
  cxSub,
} from "./complex";
export * from "./expr";
export { parseTreeToExpr } from "./from_tree";
export { exprToLatex } from "./latex";
export { simplify } from "./polynomial";
export { exprToString, render } from "./render";
