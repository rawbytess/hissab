// Pure linear-algebra over plain `number[][]` (row-major). No tokens here — the
// `MatrixToken` wraps these. Mirrors the `symbolic/` split: small, dependency-free
// math that the token / operator / function layers call into. All inputs are
// assumed rectangular (the lexer's `buildMatrix` guarantees that); shape
// mismatches between operands still throw a `UserError`.

import { UserError } from "../exceptions";

export type Mat = number[][];

// Below this, a pivot / value is treated as zero (singular, rank, rref).
const EPS = 1e-12;

export function rowCount(m: Mat): number {
  return m.length;
}

export function colCount(m: Mat): number {
  return m.length === 0 ? 0 : m[0].length;
}

export function isSquare(m: Mat): boolean {
  return rowCount(m) === colCount(m) && rowCount(m) > 0;
}

export function sameShape(a: Mat, b: Mat): boolean {
  return rowCount(a) === rowCount(b) && colCount(a) === colCount(b);
}

function copy(m: Mat): Mat {
  return m.map((row) => row.slice());
}

// Snap floating noise from elimination back to clean values for display /
// downstream exactness (e.g. det of an integer matrix, M·inverse(M) = I).
export function clean(x: number): number {
  if (!Number.isFinite(x)) return x;
  if (Math.abs(x) < 1e-10) return 0;
  const r = Math.round(x);
  if (Math.abs(x - r) < 1e-9) return r;
  return x;
}

function cleanMat(m: Mat): Mat {
  return m.map((row) => row.map(clean));
}

export function identity(n: number): Mat {
  if (!Number.isInteger(n) || n < 1) throw new UserError(9119);
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : 0)),
  );
}

export function zeros(rows: number, cols: number): Mat {
  if (
    !Number.isInteger(rows) ||
    !Number.isInteger(cols) ||
    rows < 1 ||
    cols < 1
  )
    throw new UserError(9119);
  return Array.from({ length: rows }, () => new Array(cols).fill(0));
}

export function ones(rows: number, cols: number): Mat {
  if (
    !Number.isInteger(rows) ||
    !Number.isInteger(cols) ||
    rows < 1 ||
    cols < 1
  )
    throw new UserError(9119);
  return Array.from({ length: rows }, () => new Array(cols).fill(1));
}

// Build a square diagonal matrix from a list of values.
export function diagFromValues(values: number[]): Mat {
  const n = values.length;
  if (n < 1) throw new UserError(9119);
  const m = zeros(n, n);
  for (let i = 0; i < n; i++) m[i][i] = values[i];
  return m;
}

// Extract the leading diagonal as a column vector (n×1).
export function diagOf(m: Mat): Mat {
  const n = Math.min(rowCount(m), colCount(m));
  return Array.from({ length: n }, (_, i) => [m[i][i]]);
}

export function add(a: Mat, b: Mat): Mat {
  if (!sameShape(a, b)) throw new UserError(9110);
  return a.map((row, i) => row.map((v, j) => v + b[i][j]));
}

export function sub(a: Mat, b: Mat): Mat {
  if (!sameShape(a, b)) throw new UserError(9110);
  return a.map((row, i) => row.map((v, j) => v - b[i][j]));
}

// Broadcast a scalar over every entry (used by `M + scalar`, unary `-M`, `M * k`).
export function scalarOp(
  a: Mat,
  k: number,
  op: (x: number, k: number) => number,
): Mat {
  return a.map((row) => row.map((v) => op(v, k)));
}

export function scale(a: Mat, k: number): Mat {
  return a.map((row) => row.map((v) => v * k));
}

export function hadamard(a: Mat, b: Mat): Mat {
  if (!sameShape(a, b)) throw new UserError(9117);
  return a.map((row, i) => row.map((v, j) => v * b[i][j]));
}

export function mul(a: Mat, b: Mat): Mat {
  const ar = rowCount(a);
  const ac = colCount(a);
  const br = rowCount(b);
  const bc = colCount(b);
  if (ac !== br) throw new UserError(9111);
  const out = zeros(ar, bc);
  for (let i = 0; i < ar; i++) {
    for (let k = 0; k < ac; k++) {
      const aik = a[i][k];
      if (aik === 0) continue;
      for (let j = 0; j < bc; j++) out[i][j] += aik * b[k][j];
    }
  }
  return cleanMat(out);
}

export function transpose(a: Mat): Mat {
  const rows = rowCount(a);
  const cols = colCount(a);
  const out = zeros(cols || 1, rows || 1);
  for (let i = 0; i < rows; i++)
    for (let j = 0; j < cols; j++) out[j][i] = a[i][j];
  return out;
}

export function trace(a: Mat): number {
  if (!isSquare(a)) throw new UserError(9118);
  let s = 0;
  for (let i = 0; i < rowCount(a); i++) s += a[i][i];
  return clean(s);
}

export function determinant(a: Mat): number {
  if (!isSquare(a)) throw new UserError(9112);
  const n = rowCount(a);
  const m = copy(a);
  let det = 1;
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    if (Math.abs(m[pivot][col]) < EPS) return 0;
    if (pivot !== col) {
      [m[col], m[pivot]] = [m[pivot], m[col]];
      det = -det;
    }
    det *= m[col][col];
    for (let r = col + 1; r < n; r++) {
      const f = m[r][col] / m[col][col];
      for (let c = col; c < n; c++) m[r][c] -= f * m[col][c];
    }
  }
  return clean(det);
}

export function inverse(a: Mat): Mat {
  if (!isSquare(a)) throw new UserError(9113);
  const n = rowCount(a);
  const id = identity(n);
  const m = a.map((row, i) => [...row, ...id[i]]);
  for (let col = 0; col < n; col++) {
    let pivot = col;
    for (let r = col + 1; r < n; r++)
      if (Math.abs(m[r][col]) > Math.abs(m[pivot][col])) pivot = r;
    if (Math.abs(m[pivot][col]) < EPS) throw new UserError(9114);
    [m[col], m[pivot]] = [m[pivot], m[col]];
    const pv = m[col][col];
    for (let c = 0; c < 2 * n; c++) m[col][c] /= pv;
    for (let r = 0; r < n; r++) {
      if (r === col) continue;
      const f = m[r][col];
      if (f === 0) continue;
      for (let c = 0; c < 2 * n; c++) m[r][c] -= f * m[col][c];
    }
  }
  return cleanMat(m.map((row) => row.slice(n)));
}

// Submatrix with row `i` and column `j` removed (0-indexed).
export function minorMatrix(a: Mat, i: number, j: number): Mat {
  const rows = rowCount(a);
  const cols = colCount(a);
  if (i < 0 || i >= rows || j < 0 || j >= cols) throw new UserError(9121);
  const out: Mat = [];
  for (let r = 0; r < rows; r++) {
    if (r === i) continue;
    const row: number[] = [];
    for (let c = 0; c < cols; c++) {
      if (c === j) continue;
      row.push(a[r][c]);
    }
    out.push(row);
  }
  return out;
}

export function minor(a: Mat, i: number, j: number): number {
  if (!isSquare(a)) throw new UserError(9121);
  if (rowCount(a) === 1) throw new UserError(9121);
  return determinant(minorMatrix(a, i, j));
}

export function cofactor(a: Mat, i: number, j: number): number {
  return clean(((i + j) % 2 === 0 ? 1 : -1) * minor(a, i, j));
}

export function adjugate(a: Mat): Mat {
  if (!isSquare(a)) throw new UserError(9112);
  const n = rowCount(a);
  if (n === 1) return [[1]];
  const cof = zeros(n, n);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < n; j++) cof[i][j] = cofactor(a, i, j);
  return transpose(cof);
}

export function rref(a: Mat): Mat {
  const m = copy(a);
  const rows = rowCount(m);
  const cols = colCount(m);
  let lead = 0;
  for (let r = 0; r < rows; r++) {
    if (lead >= cols) break;
    let i = r;
    while (Math.abs(m[i][lead]) < EPS) {
      i++;
      if (i === rows) {
        i = r;
        lead++;
        if (lead === cols) return cleanMat(m);
      }
    }
    [m[i], m[r]] = [m[r], m[i]];
    const lv = m[r][lead];
    for (let c = 0; c < cols; c++) m[r][c] /= lv;
    for (let k = 0; k < rows; k++) {
      if (k === r) continue;
      const f = m[k][lead];
      if (f === 0) continue;
      for (let c = 0; c < cols; c++) m[k][c] -= f * m[r][c];
    }
    lead++;
  }
  return cleanMat(m);
}

export function rank(a: Mat): number {
  const reduced = rref(a);
  let r = 0;
  for (const row of reduced) if (row.some((v) => Math.abs(v) > EPS)) r++;
  return r;
}

export function pow(a: Mat, n: number): Mat {
  if (!Number.isInteger(n)) throw new UserError(9115);
  if (!isSquare(a)) throw new UserError(9116);
  if (n < 0) return pow(inverse(a), -n);
  const size = rowCount(a);
  let result = identity(size);
  let base = copy(a);
  let e = n;
  while (e > 0) {
    if (e & 1) result = mul(result, base);
    e >>= 1;
    if (e > 0) base = mul(base, base);
  }
  return cleanMat(result);
}

// Solve A·x = b for a square A and an n×1 column vector b.
export function linsolve(a: Mat, b: Mat): Mat {
  if (!isSquare(a)) throw new UserError(9113);
  if (rowCount(b) !== rowCount(a) || colCount(b) !== 1)
    throw new UserError(9120);
  return mul(inverse(a), b);
}

export function frobeniusNorm(a: Mat): number {
  let s = 0;
  for (const row of a) for (const v of row) s += v * v;
  return Math.sqrt(s);
}

export function isSymmetric(a: Mat): boolean {
  if (!isSquare(a)) return false;
  const n = rowCount(a);
  for (let i = 0; i < n; i++)
    for (let j = i + 1; j < n; j++)
      if (Math.abs(a[i][j] - a[j][i]) > 1e-9) return false;
  return true;
}
