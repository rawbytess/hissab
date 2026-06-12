// biome-ignore-all assist/source/organizeImports: ./tokens/compound must be
// imported after the unit_types/token_factory/plurals modules below; alphabetical
// sorting would pull it earlier and break the engine's module-init order
// (plurals.ts reads Units before unit_types finishes). Keep compound's import last.
import chroma from "chroma-js";
import {
  combination,
  decimalToFraction,
  divisors,
  isPrime,
} from "../arithmetic_functions";
import {
  angleBetween,
  angularAxes,
  type CoordSystem,
  cross,
  dot,
  euclidean,
  expectedArity,
  magnitude,
  midpoint,
  minkowskiInterval,
  normalize,
  radToDeg,
} from "../coordinates";
import { UserError } from "../exceptions";
import * as ip from "../ip";
import * as mat from "../matrix";
import { hashText, type HashName } from "../hash";
import { mulberry32, nanoidId, seededUuidV4, seededUuidV7 } from "../random";
import TokenBaseType, { type TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import {
  BooleanToken,
  ColorToken,
  ComplexToken,
  convertPointToken,
  type expressionUnit,
  FractionToken,
  IpToken,
  ListToken,
  MatrixToken,
  NumberToken,
  type PlotSeries,
  PlotToken,
  PointToken,
  SeedToken,
  TextToken,
  type UnitToken,
} from "../tokens/tokens";
import UnitTypes from "../types/unit_enum";
import ProcessConversions from "../units_processor";

// New calculator domains, kept as a separate trailing import group (the blank
// line above stops the import organizer from folding them into the block above
// and re-sorting them). The engine graph has a unit_types ↔ token_factory ↔
// plurals load-order cycle; pulling ./tokens/compound in *after* the modules
// above ensures `Units` is defined before plurals.ts reads it. geometry/health
// otherwise depend only on ./exceptions.
import {
  boxVolume,
  circleArea,
  circleCircumference,
  coneSurfaceArea,
  coneVolume,
  cubeSurfaceArea,
  cubeVolume,
  cylinderSurfaceArea,
  cylinderVolume,
  ellipseArea,
  heronArea,
  lineSlope,
  parallelogramArea,
  pyramidVolume,
  rectangleArea,
  rectanglePerimeter,
  sphereSurfaceArea,
  sphereVolume,
  squareArea,
  squarePerimeter,
  trapezoidArea,
  triangleArea,
} from "../geometry_functions";
import {
  bmi,
  bmrFemale,
  bmrMale,
  bodyFatFemale,
  bodyFatMale,
  caloriesBurned,
  devineFemale,
  devineMale,
  maxHeartRate,
  waterIntakeLiters,
} from "../health_functions";
import { scaleUnit } from "../tokens/compound";
import type { FunctionDef } from "./types";
import { money, need, pct, plain, type SetExplicit } from "./util";

export const matrixFunctions: Record<string, FunctionDef> = {
  // ---- Matrices ---------------------------------------------------------
  transpose: {
    run: transposeFn,
    description: "Transpose a matrix: transpose([1 2 3, 4 5 6])",
    isRaw: true,
  },
  determinant: {
    run: determinantFn,
    description: "Determinant of a square matrix: determinant([1 2, 3 4])",
    isRaw: true,
  },
  det: {
    run: determinantFn,
    description: "Determinant (alias of determinant)",
    isRaw: true,
  },
  inverse: {
    run: inverseFn,
    description: "Inverse of an invertible square matrix: inverse([4 7, 2 6])",
    isRaw: true,
  },
  inv: {
    run: inverseFn,
    description: "Inverse (alias of inverse)",
    isRaw: true,
  },
  adjugate: {
    run: adjugateFn,
    description: "Adjugate (classical adjoint) of a square matrix",
    isRaw: true,
  },
  adj: {
    run: adjugateFn,
    description: "Adjugate (alias of adjugate)",
    isRaw: true,
  },
  trace: {
    run: traceFn,
    description: "Sum of the diagonal of a square matrix: trace([1 2, 3 4])",
    isRaw: true,
  },
  rank: {
    run: rankFn,
    description: "Rank of a matrix: rank([1 2, 2 4])",
    isRaw: true,
  },
  rref: {
    run: rrefFn,
    description: "Reduced row-echelon form of a matrix",
    isRaw: true,
  },
  minor: {
    run: minorFn,
    description: "Minor M_ij (1-indexed): minor([1 2 3, 4 5 6, 7 8 10], 1, 1)",
    isRaw: true,
  },
  cofactor: {
    run: cofactorFn,
    description: "Cofactor C_ij (1-indexed) of a square matrix",
    isRaw: true,
  },
  identity: {
    run: identityFn,
    description: "n×n identity matrix: identity(3)",
    isRaw: true,
  },
  eye: {
    run: identityFn,
    description: "Identity matrix (alias of identity)",
    isRaw: true,
  },
  zeros: {
    run: zerosFn,
    description: "Zero matrix: zeros(2) or zeros(2, 3)",
    isRaw: true,
  },
  ones: {
    run: onesFn,
    description: "All-ones matrix: ones(2) or ones(2, 3)",
    isRaw: true,
  },
  diag: {
    run: diagFn,
    description:
      "Diagonal: diag(1, 2, 3) builds a diagonal matrix; diag(M) extracts the diagonal",
    isRaw: true,
  },
  size: {
    run: sizeFn,
    description: "Dimensions of a matrix as [rows cols]: size([1 2 3, 4 5 6])",
    isRaw: true,
  },
  shape: {
    run: sizeFn,
    description: "Dimensions of a matrix (alias of size)",
    isRaw: true,
  },
  rows: {
    run: rowsFn,
    description: "Number of rows in a matrix",
    isRaw: true,
  },
  cols: {
    run: colsFn,
    description: "Number of columns in a matrix",
    isRaw: true,
  },
  columns: {
    run: colsFn,
    description: "Number of columns (alias of cols)",
    isRaw: true,
  },
  hadamard: {
    run: hadamardFn,
    description: "Element-wise (Hadamard) product of two same-size matrices",
    isRaw: true,
  },
  linsolve: {
    run: linsolveFn,
    description:
      "Solve A·x = b for a column vector b: linsolve([2 1, 1 3], [5, 10])",
    isRaw: true,
  },
  eigenvalues: {
    run: eigenvaluesFn,
    description:
      "Eigenvalues (approximate) as a column vector; complex pairs as [real imag] rows",
    isRaw: true,
  },
  eigvals: {
    run: eigenvaluesFn,
    description: "Eigenvalues (alias of eigenvalues)",
    isRaw: true,
  },
  eigenvectors: {
    run: eigenvectorsFn,
    description: "Eigenvectors as matrix columns (real spectra only)",
    isRaw: true,
  },
  eigvecs: {
    run: eigenvectorsFn,
    description: "Eigenvectors (alias of eigenvectors)",
    isRaw: true,
  },
};

// ---- Matrix functions -------------------------------------------------------

function matArg(args: TokenType[], code: number): MatrixToken {
  if (args.length !== 1 || !(args[0] instanceof MatrixToken))
    throw new UserError(code);
  return args[0];
}

function intArg(t: TokenType | undefined, code: number): number {
  if (!(t instanceof NumberToken)) throw new UserError(code);
  const n = t.toNumber();
  if (!Number.isInteger(n)) throw new UserError(code);
  return n;
}

function transposeFn(args: TokenType[]): MatrixToken {
  return new MatrixToken(mat.transpose(matArg(args, 9140).data));
}

function determinantFn(args: TokenType[]): NumberToken {
  return plain(mat.determinant(matArg(args, 9141).data));
}

function inverseFn(args: TokenType[]): MatrixToken {
  return new MatrixToken(mat.inverse(matArg(args, 9142).data));
}

function adjugateFn(args: TokenType[]): MatrixToken {
  return new MatrixToken(mat.adjugate(matArg(args, 9143).data));
}

function traceFn(args: TokenType[]): NumberToken {
  return plain(mat.trace(matArg(args, 9144).data));
}

function rankFn(args: TokenType[]): NumberToken {
  return plain(mat.rank(matArg(args, 9145).data));
}

function rrefFn(args: TokenType[]): MatrixToken {
  return new MatrixToken(mat.rref(matArg(args, 9146).data));
}

// minor(M, i, j) / cofactor(M, i, j) — i, j are 1-indexed for the user.
function minorFn(args: TokenType[]): NumberToken {
  if (args.length !== 3 || !(args[0] instanceof MatrixToken))
    throw new UserError(9147);
  const i = intArg(args[1], 9147) - 1;
  const j = intArg(args[2], 9147) - 1;
  return plain(mat.minor(args[0].data, i, j));
}

function cofactorFn(args: TokenType[]): NumberToken {
  if (args.length !== 3 || !(args[0] instanceof MatrixToken))
    throw new UserError(9148);
  const i = intArg(args[1], 9148) - 1;
  const j = intArg(args[2], 9148) - 1;
  return plain(mat.cofactor(args[0].data, i, j));
}

function identityFn(args: TokenType[]): MatrixToken {
  if (args.length !== 1) throw new UserError(9149);
  return new MatrixToken(mat.identity(intArg(args[0], 9149)));
}

function zerosFn(args: TokenType[]): MatrixToken {
  if (args.length === 1) {
    const n = intArg(args[0], 9150);
    return new MatrixToken(mat.zeros(n, n));
  }
  if (args.length === 2)
    return new MatrixToken(
      mat.zeros(intArg(args[0], 9150), intArg(args[1], 9150)),
    );
  throw new UserError(9150);
}

function onesFn(args: TokenType[]): MatrixToken {
  if (args.length === 1) {
    const n = intArg(args[0], 9151);
    return new MatrixToken(mat.ones(n, n));
  }
  if (args.length === 2)
    return new MatrixToken(
      mat.ones(intArg(args[0], 9151), intArg(args[1], 9151)),
    );
  throw new UserError(9151);
}

// diag(M) extracts the diagonal of a matrix (column vector); diag(vector) or
// diag(a, b, c, …) builds a diagonal matrix.
function diagFn(args: TokenType[]): MatrixToken {
  if (args.length === 1 && args[0] instanceof MatrixToken) {
    const m = args[0];
    if (m.rows === 1 || m.cols === 1) {
      const vals = m.rows === 1 ? m.data[0] : m.data.map((r) => r[0]);
      return new MatrixToken(mat.diagFromValues(vals));
    }
    return new MatrixToken(mat.diagOf(m.data));
  }
  if (args.length === 0) throw new UserError(9152);
  const vals = args.map((a) => {
    if (!(a instanceof NumberToken)) throw new UserError(9152);
    return a.toNumber();
  });
  return new MatrixToken(mat.diagFromValues(vals));
}

function sizeFn(args: TokenType[]): MatrixToken {
  const m = matArg(args, 9153);
  return new MatrixToken([[m.rows, m.cols]]);
}

function rowsFn(args: TokenType[]): NumberToken {
  return plain(matArg(args, 9154).rows);
}

function colsFn(args: TokenType[]): NumberToken {
  return plain(matArg(args, 9155).cols);
}

function hadamardFn(args: TokenType[]): MatrixToken {
  if (
    args.length !== 2 ||
    !(args[0] instanceof MatrixToken) ||
    !(args[1] instanceof MatrixToken)
  )
    throw new UserError(9156);
  return new MatrixToken(mat.hadamard(args[0].data, args[1].data));
}

function linsolveFn(args: TokenType[]): MatrixToken {
  if (
    args.length !== 2 ||
    !(args[0] instanceof MatrixToken) ||
    !(args[1] instanceof MatrixToken)
  )
    throw new UserError(9157);
  return new MatrixToken(mat.linsolve(args[0].data, args[1].data));
}

function eigenvaluesFn(args: TokenType[]): MatrixToken {
  const m = matArg(args, 9158);
  const { re, im } = mat.eigenvalues(m.data);
  if (im.some((v) => Math.abs(v) > 1e-9))
    return new MatrixToken(re.map((r, i) => [r, im[i]]));
  return new MatrixToken(re.map((r) => [r]));
}

function eigenvectorsFn(args: TokenType[]): MatrixToken {
  return new MatrixToken(mat.eigenvectors(matArg(args, 9159).data));
}
