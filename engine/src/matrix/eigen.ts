// Eigenvalues / eigenvectors. Two paths:
//   • symmetric matrices  → cyclic Jacobi rotation (exact-ish, real spectrum,
//     orthonormal eigenvectors).
//   • general matrices    → Householder reduction to upper Hessenberg form +
//     the Francis double-shift QR algorithm (`hqr`, ported from Numerical
//     Recipes), which yields real and complex-conjugate eigenvalues.
//
// Results are approximate (iterative). Eigenvectors are returned only when every
// eigenvalue is real (symmetric always; general when no complex pair appears);
// complex eigenvectors throw `UserError(9124)`.

import { UserError } from "../exceptions";
import { clean, identity, isSquare, isSymmetric, type Mat, rref } from "./ops";

export type Spectrum = { re: number[]; im: number[] };

const EPS = 1e-12;

function copy(m: Mat): Mat {
  return m.map((r) => r.slice());
}

// Cyclic Jacobi for a symmetric matrix. Returns eigenvalues (diagonal) and the
// accumulated rotation matrix V (columns are eigenvectors).
function jacobi(input: Mat): { values: number[]; vectors: Mat } {
  const n = input.length;
  const a = copy(input);
  const v = identity(n);
  for (let sweep = 0; sweep < 100; sweep++) {
    let off = 0;
    for (let p = 0; p < n; p++)
      for (let q = p + 1; q < n; q++) off += a[p][q] * a[p][q];
    if (off < 1e-22) break;
    for (let p = 0; p < n - 1; p++) {
      for (let q = p + 1; q < n; q++) {
        if (Math.abs(a[p][q]) < 1e-18) continue;
        const phi = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]);
        const c = Math.cos(phi);
        const s = Math.sin(phi);
        // A ← Gᵀ A G  (G rotates the (p,q) plane).
        for (let i = 0; i < n; i++) {
          const aip = a[i][p];
          const aiq = a[i][q];
          a[i][p] = c * aip - s * aiq;
          a[i][q] = s * aip + c * aiq;
        }
        for (let j = 0; j < n; j++) {
          const apj = a[p][j];
          const aqj = a[q][j];
          a[p][j] = c * apj - s * aqj;
          a[q][j] = s * apj + c * aqj;
        }
        for (let i = 0; i < n; i++) {
          const vip = v[i][p];
          const viq = v[i][q];
          v[i][p] = c * vip - s * viq;
          v[i][q] = s * vip + c * viq;
        }
      }
    }
  }
  return { values: a.map((row, i) => row[i]), vectors: v };
}

// Householder reduction of a general matrix to upper Hessenberg form via
// similarity transforms (eigenvalue-preserving).
function hessenberg(input: Mat): Mat {
  const n = input.length;
  const a = copy(input);
  for (let m = 1; m < n - 1; m++) {
    let scale = 0;
    for (let i = m; i < n; i++) scale += Math.abs(a[i][m - 1]);
    if (scale === 0) continue;
    const u = new Array(n).fill(0);
    let h = 0;
    for (let i = m; i < n; i++) {
      u[i] = a[i][m - 1] / scale;
      h += u[i] * u[i];
    }
    let g = Math.sqrt(h);
    if (u[m] > 0) g = -g;
    h -= u[m] * g;
    u[m] -= g;
    // A ← (I − uuᵀ/h) A (I − uuᵀ/h)
    for (let i = 0; i < n; i++) {
      let s = 0;
      for (let j = m; j < n; j++) s += a[i][j] * u[j];
      s /= h;
      for (let j = m; j < n; j++) a[i][j] -= s * u[j];
    }
    for (let j = 0; j < n; j++) {
      let s = 0;
      for (let i = m; i < n; i++) s += u[i] * a[i][j];
      s /= h;
      for (let i = m; i < n; i++) a[i][j] -= s * u[i];
    }
    a[m][m - 1] = scale * g;
    for (let i = m + 1; i < n; i++) a[i][m - 1] = 0;
  }
  return a;
}

const sign = (a: number, b: number): number =>
  b >= 0 ? Math.abs(a) : -Math.abs(a);

// Eigenvalues of an upper Hessenberg matrix (Francis double-shift QR).
// Ported to 0-indexing from Numerical Recipes' `hqr`.
function hqr(input: Mat): Spectrum {
  const a = copy(input);
  const n = a.length;
  const wr = new Array(n).fill(0);
  const wi = new Array(n).fill(0);

  let anorm = 0;
  for (let i = 0; i < n; i++)
    for (let j = Math.max(i - 1, 0); j < n; j++) anorm += Math.abs(a[i][j]);

  let nn = n - 1;
  let t = 0;
  while (nn >= 0) {
    let its = 0;
    let l = nn;
    do {
      for (l = nn; l >= 1; l--) {
        let s = Math.abs(a[l - 1][l - 1]) + Math.abs(a[l][l]);
        if (s === 0) s = anorm;
        if (Math.abs(a[l][l - 1]) + s === s) {
          a[l][l - 1] = 0;
          break;
        }
      }
      let x = a[nn][nn];
      if (l === nn) {
        wr[nn] = x + t;
        wi[nn] = 0;
        nn--;
      } else {
        let y = a[nn - 1][nn - 1];
        let w = a[nn][nn - 1] * a[nn - 1][nn];
        if (l === nn - 1) {
          const p = 0.5 * (y - x);
          const q = p * p + w;
          let z = Math.sqrt(Math.abs(q));
          x += t;
          if (q >= 0) {
            z = p + sign(z, p);
            wr[nn - 1] = wr[nn] = x + z;
            if (z !== 0) wr[nn] = x - w / z;
            wi[nn - 1] = wi[nn] = 0;
          } else {
            wr[nn - 1] = wr[nn] = x + p;
            wi[nn] = z;
            wi[nn - 1] = -z;
          }
          nn -= 2;
        } else {
          if (its === 50) throw new UserError(9123);
          if (its === 10 || its === 20 || its === 30 || its === 40) {
            t += x;
            for (let i = 0; i <= nn; i++) a[i][i] -= x;
            const s = Math.abs(a[nn][nn - 1]) + Math.abs(a[nn - 1][nn - 2]);
            y = x = 0.75 * s;
            w = -0.4375 * s * s;
          }
          its++;
          let m = l;
          let p = 0;
          let q = 0;
          let r = 0;
          for (m = nn - 2; m >= l; m--) {
            const z = a[m][m];
            r = x - z;
            const s2 = y - z;
            p = (r * s2 - w) / a[m + 1][m] + a[m][m + 1];
            q = a[m + 1][m + 1] - z - r - s2;
            r = a[m + 2][m + 1];
            const s = Math.abs(p) + Math.abs(q) + Math.abs(r);
            p /= s;
            q /= s;
            r /= s;
            if (m === l) break;
            const u = Math.abs(a[m][m - 1]) * (Math.abs(q) + Math.abs(r));
            const v =
              Math.abs(p) *
              (Math.abs(a[m - 1][m - 1]) +
                Math.abs(z) +
                Math.abs(a[m + 1][m + 1]));
            if (u + v === v) break;
          }
          for (let i = m + 2; i <= nn; i++) {
            a[i][i - 2] = 0;
            if (i !== m + 2) a[i][i - 3] = 0;
          }
          for (let k = m; k <= nn - 1; k++) {
            if (k !== m) {
              p = a[k][k - 1];
              q = a[k + 1][k - 1];
              r = 0;
              if (k !== nn - 1) r = a[k + 2][k - 1];
              x = Math.abs(p) + Math.abs(q) + Math.abs(r);
              if (x !== 0) {
                p /= x;
                q /= x;
                r /= x;
              }
            }
            const s = sign(Math.sqrt(p * p + q * q + r * r), p);
            if (s !== 0) {
              if (k === m) {
                if (l !== m) a[k][k - 1] = -a[k][k - 1];
              } else {
                a[k][k - 1] = -s * x;
              }
              p += s;
              const xx = p / s;
              const yy = q / s;
              const zz = r / s;
              q /= p;
              r /= p;
              for (let j = k; j <= nn; j++) {
                p = a[k][j] + q * a[k + 1][j];
                if (k !== nn - 1) {
                  p += r * a[k + 2][j];
                  a[k + 2][j] -= p * zz;
                }
                a[k + 1][j] -= p * yy;
                a[k][j] -= p * xx;
              }
              const mmin = nn < k + 3 ? nn : k + 3;
              for (let i = l; i <= mmin; i++) {
                p = xx * a[i][k] + yy * a[i][k + 1];
                if (k !== nn - 1) {
                  p += zz * a[i][k + 2];
                  a[i][k + 2] -= p * r;
                }
                a[i][k + 1] -= p * q;
                a[i][k] -= p;
              }
            }
          }
        }
      }
    } while (l < nn - 1);
  }
  return { re: wr.map(clean), im: wi.map(clean) };
}

// Sort eigenvalues (and a parallel index permutation) by descending real part,
// then descending imaginary part — deterministic output ordering.
function sortOrder(re: number[], im: number[]): number[] {
  return re.map((_, i) => i).sort((a, b) => re[b] - re[a] || im[b] - im[a]);
}

export function eigenvalues(a: Mat): Spectrum {
  if (!isSquare(a)) throw new UserError(9122);
  if (a.length === 1) return { re: [clean(a[0][0])], im: [0] };
  const { re, im } = isSymmetric(a)
    ? { re: jacobi(a).values.map(clean), im: a.map(() => 0) }
    : hqr(hessenberg(a));
  const order = sortOrder(re, im);
  return { re: order.map((i) => re[i]), im: order.map((i) => im[i]) };
}

// A unit null-space vector of a (near-singular) n×n matrix `m` — i.e. an
// eigenvector for the eigenvalue that made (A − λI) singular.
function nullVector(m: Mat): number[] {
  const n = m.length;
  const r = rref(m);
  const pivotOfRow: number[] = [];
  const pivotCols = new Set<number>();
  for (let i = 0; i < n; i++) {
    let lead = -1;
    for (let j = 0; j < n; j++) {
      if (Math.abs(r[i][j]) > 1e-9) {
        lead = j;
        break;
      }
    }
    pivotOfRow.push(lead);
    if (lead >= 0) pivotCols.add(lead);
  }
  let free = -1;
  for (let j = 0; j < n; j++)
    if (!pivotCols.has(j)) {
      free = j;
      break;
    }
  if (free === -1) free = n - 1;
  const x = new Array(n).fill(0);
  x[free] = 1;
  for (let i = 0; i < n; i++) {
    const lead = pivotOfRow[i];
    if (lead >= 0 && lead !== free) x[lead] = -r[i][free];
  }
  const norm = Math.sqrt(x.reduce((s, v) => s + v * v, 0)) || 1;
  return x.map((v) => clean(v / norm));
}

// Eigenvectors as the columns of the returned matrix, aligned with the sorted
// eigenvalues from `eigenvalues`. Real spectra only.
export function eigenvectors(a: Mat): Mat {
  if (!isSquare(a)) throw new UserError(9122);
  const n = a.length;
  if (n === 1) return [[1]];

  if (isSymmetric(a)) {
    const { values, vectors } = jacobi(a);
    const order = sortOrder(
      values.map(clean),
      values.map(() => 0),
    );
    // Reorder columns of `vectors` by `order`.
    return vectors.map((row) => order.map((c) => clean(row[c])));
  }

  const { re, im } = eigenvalues(a);
  if (im.some((v) => Math.abs(v) > EPS)) throw new UserError(9124);
  // Columns = null vector of (A − λI) per eigenvalue.
  const cols = re.map((lambda) => {
    const shifted = a.map((row, i) =>
      row.map((v, j) => (i === j ? v - lambda : v)),
    );
    return nullVector(shifted);
  });
  // Transpose column-vectors into an n×n matrix.
  return Array.from({ length: n }, (_, i) => cols.map((col) => col[i]));
}
