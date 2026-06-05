// Public surface of the matrix subsystem. Pure math over `number[][]`; the
// `MatrixToken` (tokens.ts) wraps these and the operator / function layers call
// into them.

export type { Spectrum } from "./eigen";
export { eigenvalues, eigenvectors } from "./eigen";
export { formatMatrix, formatNum } from "./format";
export type { Mat } from "./ops";
export {
  add,
  adjugate,
  clean,
  cofactor,
  colCount,
  determinant,
  diagFromValues,
  diagOf,
  frobeniusNorm,
  hadamard,
  identity,
  inverse,
  isSquare,
  isSymmetric,
  linsolve,
  minor,
  minorMatrix,
  mul,
  ones,
  pow,
  rank,
  rowCount,
  rref,
  sameShape,
  scalarOp,
  scale,
  sub,
  trace,
  transpose,
  zeros,
} from "./ops";
