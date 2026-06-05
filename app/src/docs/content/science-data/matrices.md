# Matrices

Build matrices of real numbers as literals, do matrix algebra, and call
linear-algebra functions like `determinant`, `inverse`, and `eigenvalues`.

```hissab
[1 2 3, 4 5 6]
[1 2, 3 4] * [5 6, 7 8]
determinant([1 2 3, 4 5 6, 7 8 10])
eigenvalues([2 1, 1 2])
```

## Literals

Wrap entries in square brackets. **Space separates columns; comma _or_ semicolon
separates rows.** Entries are plain numbers (negatives and decimals are fine).

```hissab
[1 2 3, 4 5 6, 7 8 9]
[1 2 3; 4 5 6]
[1.5 -2, 3 4]
[5]
```

`[1 2 3]` is a row vector; `[1, 2, 3]` is a column vector. Results render in the
same inline form, so they round-trip as input.

## Arithmetic

Addition and subtraction are element-wise; `*` is matrix multiplication; a scalar
scales every entry. `A / B` is `A · inverse(B)`, and `A ^ n` is repeated
multiplication (`^0` = identity, `^-1` = inverse).

```hissab
[1 2, 3 4] + [10 20, 30 40]
[1 2, 3 4] * [5 6, 7 8]
3 * [1 2, 3 4]
[2 4, 6 8] / 2
[1 2, 3 4] ^ 2
[4 7, 2 6] ^ -1
-[1 2, 3 4]
```

A scalar combined with `+` or `-` is **broadcast** over every entry:

```hissab
[1 2, 3 4] + 10
10 - [1 2, 3 4]
```

## Functions

```hissab
transpose([1 2 3, 4 5 6])
determinant([1 2, 3 4])
inverse([4 7, 2 6])
adjugate([1 2, 3 4])
trace([1 2, 3 4])
rank([1 2, 2 4])
rref([1 2 3, 4 5 6, 7 8 9])
minor([1 2 3, 4 5 6, 7 8 10], 1, 1)
cofactor([1 2 3, 4 5 6, 7 8 10], 1, 2)
```

Build and inspect matrices:

```hissab
identity(3)
zeros(2, 3)
ones(2, 2)
diag(1, 2, 3)
diag([1 2 3, 4 5 6, 7 8 9])
size([1 2 3, 4 5 6])
rows([1 2 3, 4 5 6])
cols([1 2 3, 4 5 6])
hadamard([1 2, 3 4], [10 20, 30 40])
```

Solve, measure, and decompose:

```hissab
linsolve([2 1, 1 3], [5, 10])
norm([3 4])
eigenvalues([2 1, 1 2])
eigenvectors([2 0, 0 3])
```

Eigenvalues come back as a column vector (sorted by descending real part). When
a matrix has complex eigenvalues they are returned as `[real imag]` rows;
`eigenvectors` supports real spectra only.

## Common mistakes

:::caution

- Rows must all have the same number of columns — `[1 2, 3 4]`, not `[1 2, 3]`.
- Matrix entries must be plain numbers, not expressions — write `[0.5 3, 4 5]`,
  not `[1/2 3, 4 5]`.
- Juxtaposition is not implicit multiplication — use `5 * [1 2, 3 4]`, not
  `5[1 2, 3 4]`.
- Inner dimensions must match for `*` — `[1 2, 3 4] * [1 2 3]` errors; multiply by
  a conformable matrix such as `[1 2, 3 4] * [1, 2]`.

:::
