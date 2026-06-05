# Graphing

`draw(...)` (alias `plot(...)`) turns an expression or value into a graph. Each
`draw` renders a chart **below the editor** it was typed in, and the chart
updates as you edit. The result line itself shows a short 📈 label — the picture
is drawn underneath.

```hissab
draw(x^2)
draw(x^2 - 4)
plot(2x + 1)
```

## Curves

A single-variable expression in `x` (or `y`, `z`) is sampled and plotted as
`y = f(x)`. Pass several expressions to overlay them on one chart.

```hissab
draw(sin(x), cos(x))
draw(x^3 - x)
draw(x^2, 2x + 1)
```

## Complex numbers and points

A complex number is drawn as a vector on the Argand plane (real axis ×
imaginary axis). Coordinate points and vectors are plotted in the plane.

```hissab
draw(3 + 4i)
draw((1 + i)^3)
draw(point(1, 2), point(3, 4))
draw(polar(5, 45))
```

## Plot a result without `draw`

Lines whose result is naturally graphable — a single-variable expression, a
complex number, a coordinate point, or a derivative/integral — show an inline
📈 affordance you can expand into a chart without writing `draw`.

```hissab
x^2 - 4
3 + 4i
derivative(x^3, x)
point(2, 3)
```

## Add a series with **＋ overlay**

Every `draw(...)` chart has a **＋ overlay** control. Open it to type another
curve (e.g. `sin(x)`) or to pick a graphable line **above** it — the chosen line
is referenced (`l2`, `l3`, …) and spliced into the `draw(...)` call, so the two
plot together on one chart and stay linked as you edit. Because it only edits
the `draw` line, the combination is just text and persists with the notebook.

## Common mistakes

:::caution

- `draw(...)` produces a plot, not a number — you can't feed it into further
  arithmetic or convert it with `to <unit>`.
- Each curve is a function of a **single** variable. Mixing symbolic curves and
  numeric points in one `draw` is not supported.
- Angles in `polar(...)` default to degrees; write `polar(5, 45 degree)` (not
  `45 deg`) to be explicit.

:::
