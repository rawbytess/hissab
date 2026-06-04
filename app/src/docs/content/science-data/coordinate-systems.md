# Coordinate systems

Build points and vectors, do point arithmetic, convert between coordinate
systems, and compute distances, products, and angles.

```hissab
point(1, 2, 3)
point(3,4) to polar
distance(point(0,0,0), point(3,4,0))
cross(point(1,0,0), point(0,1,0))
```

## Constructors

- `point(x, y, z, …)` — a Cartesian point/vector of any dimension. `cartesian(…)`
  and `vector(…)` are aliases.
- `polar(r, θ)` — 2-D polar.
- `cylindrical(r, θ, z)` — 3-D cylindrical.
- `spherical(ρ, θ, φ)` — 3-D spherical (θ = inclination from +z, φ = azimuth).
- `minkowski(t, x, y, z)` — spacetime point, signature (−,+,+,+) with c = 1.

```hissab
point(1, 2, 3)
polar(5, 90)
cylindrical(2, 90, 5)
spherical(1, 90, 0)
minkowski(1, 2, 3, 4)
```

Angles default to **degrees** (like the trig functions). An explicit angle unit
is honoured:

```hissab
polar(5, 1.5708 radian) to cartesian
polar(5, 100 grad) to cartesian
```

## Arithmetic

Subtraction and addition are component-wise; multiplying or dividing by a scalar
scales the point.

```hissab
point(1,2,3) - point(4,5,6)
point(1,1) + point(2,3)
3 * point(1,2)
point(2,4) / 2
```

## Conversions

Convert with `to`. `to distance` collapses a point to its scalar length from the
origin; `<number> to vector` expands a scalar back into a point.

```hissab
point(3,4) to polar
polar(5, 90) to cartesian
point(1,2,2) to spherical
point(1,2,3) - point(4,5,6) to distance
5 to vector
```

The function-call form also converts when given a single point:

```hissab
polar(point(3,4))
cartesian(polar(5, 90))
```

## Operations

```hissab
distance(point(1,2,3), point(4,5,6))
magnitude(point(3,4))
midpoint(point(0,0), point(4,6))
dot(point(1,2,3), point(4,5,6))
cross(point(1,0,0), point(0,1,0))
angle(point(1,0), point(0,1))
normalize(point(3,4))
atan2(1, 1)
hypot(3, 4)
```

## Minkowski spacetime

`interval(p, q)` is the signed interval s² (negative = timelike, zero =
lightlike, positive = spacelike). `to distance` gives √|s²|.

```hissab
interval(minkowski(5,0,0,0), minkowski(0,3,0,0))
minkowski(5,3,0,0) to distance
```

## Common mistakes

:::caution

- `cross` needs two 3-D vectors — `cross(point(1,0), point(0,1))` errors.
- A 3-D point has no 2-D polar form; use `cylindrical` or `spherical` instead.
- A point combines only with another point: scale with `point(1,2) * 5` rather
  than `point(1,2) - 5`.
- `point` is now the coordinate constructor, so it is no longer a typography
  length unit — use `pica` or `inch` for typographic lengths.

:::
