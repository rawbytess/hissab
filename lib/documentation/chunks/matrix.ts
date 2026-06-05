export const matrix = `
## Matrices

Work with matrices of real numbers: build them as literals, do matrix algebra
(add, multiply, power, inverse), and call linear-algebra functions
(determinant, rank, rref, eigenvalues, …).

### Literals

Wrap entries in square brackets. **Space separates columns; comma _or_ semicolon
separates rows.**

- \`[1 2 3, 4 5 6, 7 8 9]\` — a 3×3 matrix.
- \`[1 2 3; 4 5 6]\` — same as \`[1 2 3, 4 5 6]\` (MATLAB-style \`;\` rows).
- \`[1 2 3]\` — a 1×3 row vector. \`[1, 2, 3]\` — a 3×1 column vector.
- \`[5]\` — a 1×1 matrix.

Entries are plain numbers (negatives and decimals allowed: \`[1.5 -2, 3 4]\`).
Per-cell expressions like \`1/2\` are **not** supported — compute the value first.
Results render in the same inline form, so they round-trip as input.

### Arithmetic

- \`A + B\`, \`A - B\` → element-wise (the matrices must be the same size).
- \`A * B\` → matrix multiplication (columns of A must equal rows of B).
- \`scalar * A\`, \`A * scalar\`, \`A / scalar\` → scale every entry.
- \`A / B\` → \`A · inverse(B)\`.
- \`A ^ n\` (integer n) → repeated multiplication; \`A ^ 0\` = identity,
  \`A ^ -1\` = \`inverse(A)\`.
- \`-A\` → negate every entry.
- \`A + scalar\`, \`scalar - A\`, … → the scalar is **broadcast** over every entry
  (\`[1 2, 3 4] + 10\` → \`[11 12, 13 14]\`).

### Functions

- \`transpose(A)\` — swap rows and columns.
- \`determinant(A)\` / \`det(A)\` — determinant of a square matrix.
- \`inverse(A)\` / \`inv(A)\` — inverse of an invertible square matrix.
- \`adjugate(A)\` / \`adj(A)\` — classical adjoint.
- \`trace(A)\` — sum of the diagonal.
- \`rank(A)\` — rank.
- \`rref(A)\` — reduced row-echelon form.
- \`minor(A, i, j)\`, \`cofactor(A, i, j)\` — the (i, j) minor / cofactor (1-indexed).
- \`identity(n)\` / \`eye(n)\` — n×n identity. \`zeros(n)\`/\`zeros(r, c)\`,
  \`ones(n)\`/\`ones(r, c)\` — constant matrices.
- \`diag(1, 2, 3)\` — build a diagonal matrix; \`diag(A)\` — extract A's diagonal.
- \`size(A)\` / \`shape(A)\` — \`[rows cols]\`. \`rows(A)\`, \`cols(A)\` — counts.
- \`hadamard(A, B)\` — element-wise (Hadamard) product.
- \`linsolve(A, b)\` — solve \`A·x = b\` for a column vector \`b\`.
- \`norm(A)\` / \`magnitude(A)\` — Frobenius norm.
- \`eigenvalues(A)\` / \`eigvals(A)\` — eigenvalues (approximate), as a column
  vector. If complex eigenvalues appear, they are returned as \`[real imag]\` rows.
- \`eigenvectors(A)\` / \`eigvecs(A)\` — eigenvectors as the columns of a matrix
  (real spectra only).

### Examples

User: multiply two matrices
Expression: \`[1 2, 3 4] * [5 6, 7 8]\` → [19 22, 43 50]

User: invert a 2×2 matrix
Expression: \`inverse([4 7, 2 6])\` → [0.6 -0.7, -0.2 0.4]

User: determinant of a 3×3 matrix
Expression: \`determinant([1 2 3, 4 5 6, 7 8 10])\` → -3

User: solve the system 2x + y = 5, x + 3y = 10
Expression: \`linsolve([2 1, 1 3], [5, 10])\` → [1, 3]

User: eigenvalues of a symmetric matrix
Expression: \`eigenvalues([2 1, 1 2])\` → [3, 1]

### Common mistakes

Incorrect: \`[1 2, 3]\`
Result: errors — rows must all have the same number of columns.
Correct: \`[1 2, 3 4]\`.

Incorrect: \`[1/2 3, 4 5]\`
Result: errors — matrix entries must be plain numbers, not expressions.
Correct: compute the value first (\`[0.5 3, 4 5]\`).

Incorrect: \`5[1 2, 3 4]\`
Result: errors — juxtaposition is not implicit multiplication for matrices.
Correct: \`5 * [1 2, 3 4]\`.

Incorrect: \`[1 2, 3 4] * [1 2 3]\`
Result: errors — inner dimensions must match (2 columns vs 1 row).
Correct: multiply by a conformable matrix, e.g. \`[1 2, 3 4] * [1, 2]\`.
`;

export default matrix;
