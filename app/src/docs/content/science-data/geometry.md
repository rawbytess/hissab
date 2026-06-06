# Geometry

Area, perimeter/circumference, surface area and volume of common shapes, plus
the slope of a line — all written as functions with comma-separated arguments.

```hissab
circle area(5)
triangle area(3, 4, 5)
cube volume(3)
slope(0, 0, 2, 4)
```

## Length units

A bare number returns a plain number. If the side lengths share a length unit,
the result is dimensioned: an area comes back as `unit^2`, a volume as `unit^3`,
and a perimeter/circumference as the length unit itself.

```hissab
circle area(5 meter)
cube volume(3 meter)
circle circumference(5 meter)
```

## 2-D shapes — area and perimeter

| Function | Formula | Example |
| ------------------------------- | ------------------------------ | --------------------------------- |
| `circle area(r)` | π·r² | `circle area(5)` |
| `circle circumference(r)` | 2·π·r (alias `circle perimeter`) | `circle circumference(5 meter)` |
| `square area(side)` | side² | `square area(4)` |
| `square perimeter(side)` | 4·side | `square perimeter(4 km)` |
| `rectangle area(w, h)` | width × height | `rectangle area(3 meter, 4 meter)` |
| `rectangle perimeter(w, h)` | 2·(w + h) | `rectangle perimeter(3 meter, 4 meter)` |
| `triangle area(base, height)` | ½·base·height | `triangle area(6, 8)` |
| `triangle area(a, b, c)` | Heron's formula from three sides | `triangle area(3, 4, 5)` |
| `trapezoid area(a, b, height)` | ½·(a + b)·height | `trapezoid area(4, 6, 3)` |
| `parallelogram area(base, height)` | base × height | `parallelogram area(5, 3)` |
| `ellipse area(a, b)` | π·a·b (semi-axes) | `ellipse area(3, 2)` |

```hissab
triangle area(6, 8)
triangle area(3, 4, 5)
trapezoid area(4, 6, 3)
ellipse area(3, 2)
```

## 3-D shapes — surface area and volume

| Function | Formula | Example |
| ------------------------------------- | ------------------------------ | --------------------------------- |
| `sphere volume(r)` | 4/3·π·r³ | `sphere volume(3)` |
| `sphere surface area(r)` | 4·π·r² (alias `sphere area`) | `sphere surface area(3)` |
| `cube volume(side)` | side³ | `cube volume(3)` |
| `cube surface area(side)` | 6·side² | `cube surface area(3)` |
| `cylinder volume(r, h)` | π·r²·h | `cylinder volume(2 meter, 5 meter)` |
| `cylinder surface area(r, h)` | 2·π·r·(r + h) | `cylinder surface area(2, 5)` |
| `cone volume(r, h)` | 1/3·π·r²·h | `cone volume(2, 6)` |
| `cone surface area(r, h)` | π·r·(r + √(r² + h²)) | `cone surface area(3, 4)` |
| `rectangular prism volume(l, w, h)` | l·w·h (alias `box volume`) | `box volume(2, 3, 4)` |
| `pyramid volume(l, w, h)` | 1/3·l·w·h | `pyramid volume(3, 3, 9)` |

```hissab
sphere volume(3 feet)
cube volume(3 meter)
cylinder volume(2 meter, 5 meter)
cone volume(2, 6)
box volume(2, 3, 4)
```

## Line slope

`slope(x1, y1, x2, y2)` returns (y2 − y1) / (x2 − x1).

```hissab
slope(0, 0, 2, 4)
slope(2, 3, 6, 11)
```

## Common mistakes

:::caution

- **`circle area(5 m)`** treats the radius as 5,000,000 — a bare `m` means
  *million*, not metre. Use a spelled-out length unit: `circle area(5 meter)`.
- **`area(5)`** or **`volume(2, 3, 4)`** error — there is no bare `area` or
  `volume` function. Name the shape: `circle area(5)`, `box volume(2, 3, 4)`.
- **Mixed length units** such as `rectangle area(3 meter, 4 feet)` fall back to a
  plain number. Give both sides the same unit to keep the dimension.
- A **vertical line** like `slope(2, 1, 2, 5)` has no finite slope and errors.

:::

:::note

`triangle area` accepts **either** two arguments (base, height) **or** three
(the side lengths, via Heron's formula).

:::
