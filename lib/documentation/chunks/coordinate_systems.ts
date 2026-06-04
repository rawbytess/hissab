export const coordinate_systems = `
## Coordinate systems

Work with geometric points/vectors in several coordinate systems, do point
arithmetic, convert between systems, and compute distances, products and angles.

### Constructors

- \`point(x, y, z, …)\` — Cartesian point/vector of any dimension. \`cartesian(…)\`
  and \`vector(…)\` are aliases.
- \`polar(r, θ)\` — 2-D polar.
- \`cylindrical(r, θ, z)\` — 3-D cylindrical.
- \`spherical(ρ, θ, φ)\` — 3-D spherical, physics convention (θ = inclination from
  +z, φ = azimuth).
- \`minkowski(t, x, y, z)\` — spacetime point, signature (−,+,+,+) with c = 1.

Angles default to **degrees** (matching the trig functions). An explicit angle
unit is honoured: \`polar(5, 1.5708 radian)\`, \`polar(5, 100 grad)\`.

Results render with the system name and a \`°\` on angular axes, e.g.
\`polar(5, 53.1301°)\`.

### Arithmetic

- \`point - point\` → component-wise point (displacement from the origin):
  \`point(1,2,3) - point(4,5,6)\` → \`point(-3, -3, -3)\`.
- \`point + point\` → component-wise sum.
- \`scalar * point\`, \`point * scalar\`, \`point / scalar\` → scaled point.

Mixed-system operands are normalised to Cartesian first (Minkowski stays
Minkowski and only combines with another Minkowski point).

### Conversions (\`to\`)

- \`point(3,4) to polar\` → \`polar(5, 53.1301°)\`
- \`polar(5, 90) to cartesian\` → \`point(0, 5)\`
- \`point(1,2,2) to spherical\`, \`… to cylindrical\`, \`… to minkowski\`
- \`<point> to distance\` → scalar length from the origin.
- \`<number> to vector\` (or \`to point\`) → a 1-D point from the origin
  (\`5 to vector\` → \`point(5)\`).

The function-call form also converts when given a single point:
\`polar(point(3,4))\`, \`cartesian(polar(5,90))\`.

### Operations

- \`distance(a, b)\` — distance between two points.
- \`magnitude(v)\` / \`norm(v)\` — length from the origin.
- \`midpoint(a, b)\` — midpoint.
- \`dot(a, b)\` — dot product (scalar).
- \`cross(a, b)\` — cross product of two 3-D vectors (a vector).
- \`angle(a, b)\` — angle between two vectors, in degrees.
- \`normalize(v)\` — unit vector in the direction of \`v\`.
- \`interval(p, q)\` — signed Minkowski interval s² (negative = timelike,
  0 = lightlike, positive = spacelike).
- \`atan2(y, x)\` — two-argument arctangent (degrees). \`hypot(x, y, …)\` — √(x²+y²+…).

### Examples

User: distance between (1,2,3) and (4,5,6)
Expression: \`point(1,2,3) - point(4,5,6) to distance\` → 5.1962

User: convert the point (3, 4) to polar
Expression: \`point(3,4) to polar\` → polar(5, 53.1301°)

User: cross product of the x and y unit vectors
Expression: \`cross(point(1,0,0), point(0,1,0))\` → point(0, 0, 1)

User: spacetime interval between two events
Expression: \`interval(minkowski(5,0,0,0), minkowski(0,3,0,0))\` → -16 (timelike)

### Common mistakes

Incorrect: \`cross(point(1,0), point(0,1))\`
Result: errors — cross product needs two 3-D vectors.
Correct: \`cross(point(1,0,0), point(0,1,0))\` → point(0, 0, 1)

Incorrect: \`polar(point(1,2,3))\`
Result: errors — a 3-D point has no 2-D polar form.
Correct: use \`cylindrical\`/\`spherical\` for 3-D, \`polar\` only for 2-D.

Incorrect: \`point(1,2) - 5\`
Result: errors — a point combines only with another point.
Correct: scale instead (\`point(1,2) * 5\`) or subtract a point.

Note: \`point\` is the coordinate constructor, so it is no longer a typography
length unit — use \`pica\` or \`inch\` for typographic lengths.
`;

export default coordinate_systems;
