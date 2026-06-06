export const geometry = `
## Geometry

Area, perimeter/circumference, surface area and volume of common shapes, plus
the slope of a line — written as functions with comma-separated arguments:
\`circle area(5)\`, \`rectangle area(3, 4)\`, \`sphere volume(2)\`.

### Argument conventions

- **Plain number in, plain number out** — \`circle area(5)\` → 78.5398.
- **Length units carry through.** If the side lengths share a length unit, the
  result is dimensioned: an area comes back as \`unit^2\`, a volume as \`unit^3\`,
  a perimeter/circumference as the length unit itself.
  → \`circle area(5 meter)\` → 78.5398 meter^2
  → \`cube volume(3 feet)\` → 27 feet^3
  → \`circle circumference(5 meter)\` → 31.4159 meter
- Use a spelled-out length unit (\`meter\`, \`cm\`, \`km\`, \`feet\`, \`inch\`) — the
  bare letter \`m\` means *million*, not metre, so \`circle area(5 m)\` treats the
  radius as 5,000,000.
- Mixed length units (e.g. \`rectangle area(3 meter, 4 feet)\`) fall back to a
  plain number; give both sides the same unit to keep the dimension.

### 2-D shapes — area & perimeter

- Circle: \`circle area(radius)\` = π·r²; \`circle circumference(radius)\` =
  2·π·r (alias \`circle perimeter\`)
- Square: \`square area(side)\` = side²; \`square perimeter(side)\` = 4·side
- Rectangle: \`rectangle area(width, height)\`; \`rectangle perimeter(width, height)\`
- Triangle: \`triangle area(base, height)\` = ½·base·height, **or** Heron's
  formula from three side lengths \`triangle area(a, b, c)\`
  → \`triangle area(6, 8)\` → 24 ; \`triangle area(3, 4, 5)\` → 6
- Trapezoid: \`trapezoid area(a, b, height)\` = ½·(a+b)·height
- Parallelogram: \`parallelogram area(base, height)\`
- Ellipse: \`ellipse area(a, b)\` = π·a·b (semi-axes a and b)

### 3-D shapes — surface area & volume

- Sphere: \`sphere volume(r)\` = 4/3·π·r³; \`sphere surface area(r)\` = 4·π·r²
  (alias \`sphere area\`)
- Cube: \`cube volume(side)\` = side³; \`cube surface area(side)\` = 6·side²
- Cylinder: \`cylinder volume(r, height)\` = π·r²·h;
  \`cylinder surface area(r, height)\` = 2·π·r·(r+h)
- Cone: \`cone volume(r, height)\` = 1/3·π·r²·h;
  \`cone surface area(r, height)\` = π·r·(r+√(r²+h²))
- Rectangular prism: \`rectangular prism volume(length, width, height)\`
  (alias \`box volume\`)
- Pyramid (rectangular base): \`pyramid volume(length, width, height)\` =
  1/3·l·w·h

### Lines

- Slope between two points: \`slope(x1, y1, x2, y2)\` = (y2−y1)/(x2−x1)
  → \`slope(0, 0, 2, 4)\` → 2. A vertical line (x1 = x2) has no finite slope and
  errors.

### Examples

User: what's the area of a circle with radius 5 m?
Expression: \`circle area(5 meter)\` → 78.5398 meter^2

User: how much water fits in a cylindrical tank 2 m across the radius, 5 m tall?
Expression: \`cylinder volume(2 meter, 5 meter)\` → 62.8319 meter^3

User: area of a 3-4-5 triangle?
Expression: \`triangle area(3, 4, 5)\` → 6

### Common mistakes

Incorrect: \`circle area(5 m)\` expecting 5 metres
Result: a huge number — \`m\` is the million multiplier, so the radius is read as
5,000,000.
Correct: \`circle area(5 meter)\` → 78.5398 meter^2

Incorrect: \`area(5)\` or \`volume(2, 3, 4)\`
Result: errors — there is no bare \`area\`/\`volume\` function.
Correct: name the shape — \`circle area(5)\`, \`box volume(2, 3, 4)\`.

### Notes

- \`triangle area\` accepts **either** two arguments (base, height) **or** three
  (the side lengths, via Heron's formula).
- Surface-area names: a sphere/cube/cylinder/cone uses \`<shape> surface area\`;
  \`sphere area\` is a convenience alias for \`sphere surface area\`.
`;

export default geometry;
