# Functions

Functions take their arguments **in parentheses, separated by commas**. Each
argument can itself be an expression.

```hissab
avg(99, 34, 65, 213, 45, 123)
max(10m, 30k, 7.7m)
gcd(12, 15, 18, 25)
```

## Math

| Function | Description | Example |
| ------------------- | ------------------------ | ------------------- |
| `abs(x)` | absolute value (one arg) | `abs(-234)` |
| `sum(...)` | add all arguments (unit-aware) | `sum(12, 23, 52)` |
| `avg(...)` / `mean(...)` | arithmetic mean | `avg(70, 80, 90)` |

```hissab
abs(-234)
sum(12, 23, 52, 65)
avg(70, 80, 90, 100)
```

## Statistics

| Function | Description | Example |
| ----------------------- | ----------------------------- | ------------------------------- |
| `median(...)` | middle value | `median(2, 4, 4, 6)` |
| `range(...)` | largest minus smallest | `range(2, 4, 10)` |
| `variance(...)` | population variance | `variance(2, 4, 4, 6)` |
| `standard deviation(...)` | population standard deviation | `standard deviation(2, 4, 4)` |
| `harmonic mean(...)` | harmonic mean | `harmonic mean(8, 12, 15)` |
| `geometric mean(...)` | geometric mean | `geometric mean(8, 12, 15)` |

:::note
Use the **full multi-word names**. Abbreviations like `stddev` or `geomean` are
not recognized.
:::

```hissab
median(2, 4, 4, 6, 8, 10, 10)
standard deviation(2, 4, 4, 6, 8, 10, 10)
geometric mean(8, 12, 15)
```

## Sets

| Function | Description | Example |
| ------------------ | ------------------------------ | ------------------------------ |
| `max(...)` `min(...)` | extremes (also compare units) | `min(12 meters, 12 miles)` |
| `lcm(...)` | least common multiple | `lcm(12, 15, 18, 25)` |
| `gcd(...)` | greatest common divisor | `gcd(12, 15, 18, 25)` |

```hissab
max(10m, 30k, 7.7m)
min(12 meters, 20 kms, 12 miles)
lcm(12, 15, 18, 25)
```

## Trigonometry and logarithms

These take the value **after the name**, and parentheses are optional. See
**Trigonometry** and **Logarithms** for details.

| Group | Names |
| ------------------- | --------------------------------------------- |
| Basic trig | `sin`, `cos`, `tan`, `sec`, `csc`, `cot` |
| Inverse | `asin`, `acos`, `atan`, `asec`, `acsc`, `acot` |
| Hyperbolic | `sinh`, `cosh`, `tanh`, `sech`, `csch`, `coth` |
| Inverse hyperbolic | `asinh`, `acosh`, `atanh`, `asech`, `acsch`, `acoth` |
| Logarithms | `log` / `loge` (natural), `log10`, `log2` |

```hissab
sin 30
log2 1024
log10 1000
```

## Color constructors

`rgb(...)` and `hsl(...)` build colors. See **Colors**.

```hissab
rgb(12, 124, 201)
hsl(60, 0.03703, 0.1058)
```

## Constants

`pi` and `e` can be used anywhere a number is expected.

```hissab
2 * pi
e ^ 2
```
