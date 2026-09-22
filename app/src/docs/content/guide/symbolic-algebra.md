# Symbolic algebra

Symbolic expressions use free variables instead of only numbers. When an
expression contains a symbol, Hissab keeps the result algebraic, collects like
terms, and returns a simplified expression.

```hissab
12 + 2x^2 - 4x^2 - 2
(x + 2)*(x + 3)
derivative(2x^2, x)
integrate(2x^2 + 3x + 10, x)
limit(sin(x)/x, x, 0)
solve(x^2 - 5x + 6, x)
```

## Symbols

The recognized free variables are `x`, `y`, and `z`. Other identifiers are
treated as unknown words and make the expression invalid.

```hissab
3x - 10y + 13z
x*y + 2x
```

Implicit multiplication works between a number and a symbol, so `2x` means
`2*x`. Use an explicit operator between symbols: write `x*y` or `x y`, not
`xy`.

## Simplify and expand

A bare expression with symbols is simplified automatically. `simplify(...)` is
the explicit form.

```hissab
12 + 2x^2 - 4x^2 - 2
simplify(2x^2 - 4x^2)
(x + 1)*(x + 2)
(x + 1)*(x + 1)
```

Hissab returns canonical polynomial output ordered by descending degree.

## Derivatives

Use `derivative(expr, variable)`. `diff` is an alias.

```hissab
derivative(2x^2, x)
diff(sin(x), x)
derivative(x^2*y, x)
```

With more than one symbol, the variable argument chooses the partial derivative.

## Integrals

Use `integrate(expr, variable)`. `integral` is an alias. Definite integrals add
lower and upper bounds.

```hissab
integrate(2x^2 + 3x + 10, x)
integral(2x^2 + 3x + 10, x)
integrate(2x^2 + 3x + 10, x, 0, 50)
```

The constant of integration is omitted for indefinite integrals.

## Limits

Use `limit(expr, variable, point)`.

```hissab
limit(4x^2 - 3x + 10, x, 0)
limit(sin(x)/x, x, 0)
```

When a derivative, integral, or limit has no closed form, Hissab may return a
numeric estimate for limits and definite integrals. An indefinite integral with
no elementary antiderivative is left in integral form.

`sqrt(x)` is treated as `x^(1/2)`, so the power rules apply to it.

```hissab
derivative(sqrt(x), x)
integrate(sqrt(x), x)
```

## Solving equations

`solve(expr, x)` finds the values of `x` where `expr = 0`. Write an equation
directly (`solve(x^2 = 4, x)`) or as two sides (`solve(x^2, 4, x)`). You can leave
out the variable when there is only one.

- **Polynomials** get every root — exact where they are rational, and complex
  roots in `a + bi` form.
- **Linear equations with other variables** are solved symbolically.
- **Anything else in one variable** gets a numeric search for real roots. Trig
  inside `solve` (and calculus) uses **radians**.

```hissab
solve(x^2 - 5x + 6, x)
solve(3x + 4 = 19, x)
solve(x^2, 4, x)
solve(x^3 - 6x^2 + 11x - 6, x)
solve(x^2 + 1, x)
solve(2x + 3y - 8, x)
solve(2^x - 10, x)
```

The answer (`x = 2, x = 3`) is a list, so `solve(...)` must be the whole line.

## Common mistakes

:::caution

- **`xy`** is one unknown word, not `x*y`. Write `x*y` or `x y`.
- **`solve(2x + 3y = 8, x)`** is invalid — a letter right before `=` reads as a
  label assignment. Write `solve(2x + 3y, 8, x)` or `solve(2x + 3y - 8, x)`.
- **`solve(x^2 - 4, x) + 1`** is invalid — a `solve` answer is a list of values,
  not a number.
- **`x = 5`** is still label assignment, not an algebra equation.
- Symbolic results cannot be converted with `to <unit>` or used in unit math.

:::
