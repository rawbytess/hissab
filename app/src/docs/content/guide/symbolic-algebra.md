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

## Common mistakes

:::caution

- **`xy`** is one unknown word, not `x*y`. Write `x*y` or `x y`.
- **Equation solving is not available yet.** Hissab can simplify and do
  calculus, but it does not solve equations for a variable.
- **`x = 5`** is still label assignment, not an algebra equation.
- Symbolic results cannot be converted with `to <unit>` or used in unit math.

:::
