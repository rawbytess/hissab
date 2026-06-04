export const visualization = `
## Visualization (draw / plot)

\`draw(...)\` (alias \`plot(...)\`) turns an expression or value into a graph. In the
app each \`draw\` renders a chart below the editor it was typed in; the chart
updates as you edit. \`draw\` does not return a number — its result is a plot, so it
can't be fed into further arithmetic or converted with \`to <unit>\`.

What you can draw:

- **Curves** — a single-variable expression in \`x\` (or \`y\`/\`z\`) is sampled and
  plotted as \`y = f(x)\`. Pass several expressions to overlay them on one chart.
- **Complex numbers** — a complex value is drawn as a point/vector on the Argand
  plane (real axis × imaginary axis).
- **Coordinate points** — \`point(...)\` / \`polar(...)\` etc. are plotted as
  points/vectors in the plane.

\`\`\`
draw(x^2)               → 📈 x^2
draw(x^2 - 4)           → 📈 x^2 - 4
draw(sin(x), cos(x))    → 📈 sin(x), cos(x)
draw(x^2, 2x + 1)       → 📈 x^2, 2x + 1
plot(2x + 1)            → 📈 2x + 1
draw(3 + 4i)            → 📈 3 + 4i
draw(point(1, 2), point(3, 4)) → 📈 point(1, 2), point(3, 4)
\`\`\`

### Examples

User: graph x squared
Expression: \`draw(x^2)\` → 📈 x^2

User: plot sine and cosine together
Expression: \`draw(sin(x), cos(x))\` → 📈 sin(x), cos(x)

User: show 3 + 4i on the complex plane
Expression: \`draw(3 + 4i)\` → 📈 3 + 4i

### Notes

- The label after 📈 just echoes what is being drawn; the actual chart is rendered
  by the app, not encoded in the text result.
- Curves are functions of **one** symbol. Each argument is plotted against its own
  single variable; mixing symbolic curves and numeric points in one \`draw\` is not
  supported.
- Lines whose result is naturally graphable (a single-variable expression, a
  complex number, a coordinate point, or a derivative/integral) also offer an
  inline 📈 affordance in the app to plot them without writing \`draw\`.
`;

export default visualization;
