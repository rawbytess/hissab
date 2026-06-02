# Trigonometry

Trigonometric functions accept angles. **Bare numeric values are degrees by
default.**

## Functions

- **Basic** — `sin`, `cos`, `tan`
- **Reciprocal** — `sec`, `csc`, `cot`
- **Inverse** — `asin`, `acos`, `atan`, `asec`, `acsc`, `acot`
- **Hyperbolic** — `sinh`, `cosh`, `tanh`, `sech`, `csch`, `coth`
- **Inverse hyperbolic** — `asinh`, `acosh`, `atanh`, `asech`, `acsch`, `acoth`

```hissab
sin 30
cos 60
tan 45
sec 60
asin 0.5
atan 1
sinh 1
asinh 1
```

## Angle units

With no unit, Hissab assumes **degrees**. You can pass an explicit angle unit:
degree, grad, radian, arcminute, arcsecond, or turn.

```hissab
sin 1.5708 radian
cos 200 grad
sin 0.25 turn
```

:::note

Inverse functions return **degrees**.

:::

```hissab
atan 1
```

## Constants

`pi` and `e` are recognized numeric constants.

```hissab
2 * pi
e^2
```

## Common mistakes

:::caution

- **`sin 90`** means sine of 90 *degrees*. If you mean radians, include the
  unit: `sin 90 radian`.
- **`sin(pi / 2 radian)`** is invalid — use a plain numeric value with the unit,
  such as `sin 1.5708 radian`.
- **`acosh 0.5`** and **`atanh 2`** are out of domain.

:::

```hissab
sin 90 radian
sin 1.5708 radian
```
