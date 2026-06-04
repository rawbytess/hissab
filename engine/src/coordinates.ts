// Pure coordinate-system math + the converter registry. This module is the
// single source of truth for point/vector geometry: it knows nothing about
// tokens (no imports from tokens.ts), so it can be shared by the PointToken
// class, the `to` operator and the coordinate functions without import cycles.
//
// Conventions:
//   - Cartesian is the hub: every cross-system conversion goes through it.
//   - Angles are in DEGREES (consistent with the rest of Hissab's trig).
//   - Spherical uses the physics convention (ρ, θ=inclination from +z, φ=azimuth).
//   - Minkowski is (t, x, y, …) with signature (−,+,+,…) and c = 1.
import { UserError } from "./exceptions";

export type CoordSystem =
  | "cartesian"
  | "polar"
  | "cylindrical"
  | "spherical"
  | "minkowski";

// Keywords that double as constructor functions AND `to`-conversion targets.
// `vector`/`point` are aliases of cartesian; `distance` collapses a point to its
// scalar magnitude.
export const COORD_CONVERTERS = new Set<string>([
  "cartesian",
  "polar",
  "cylindrical",
  "spherical",
  "minkowski",
  "vector",
  "point",
  "distance",
]);

export function isCoordConverter(name: string): boolean {
  return COORD_CONVERTERS.has(name);
}

// Resolve a converter keyword to either a coordinate system or the scalar
// "distance" collapse. `vector`/`point` are cartesian aliases.
export function resolveTarget(name: string): CoordSystem | "distance" {
  if (name === "vector" || name === "point") return "cartesian";
  if (name === "distance") return "distance";
  return name as CoordSystem;
}

const DEG = Math.PI / 180;
export function degToRad(d: number): number {
  return d * DEG;
}
export function radToDeg(r: number): number {
  return r / DEG;
}

// Coordinate indices that are angles (degrees) for a given system.
export function angularAxes(system: CoordSystem): Set<number> {
  switch (system) {
    case "polar":
      return new Set([1]); // (r, θ)
    case "cylindrical":
      return new Set([1]); // (r, θ, z)
    case "spherical":
      return new Set([1, 2]); // (ρ, θ, φ)
    default:
      return new Set(); // cartesian, minkowski
  }
}

// Allowed argument counts per system. Cartesian is any dimension ≥ 1; Minkowski
// is a time coordinate plus 1–3 spatial ones.
export function expectedArity(system: CoordSystem): {
  min: number;
  max: number;
} {
  switch (system) {
    case "polar":
      return { min: 2, max: 2 };
    case "cylindrical":
      return { min: 3, max: 3 };
    case "spherical":
      return { min: 3, max: 3 };
    case "minkowski":
      return { min: 2, max: 4 };
    default:
      return { min: 1, max: Number.POSITIVE_INFINITY }; // cartesian
  }
}

// system coords → cartesian spatial coords.
export function toCartesian(coords: number[], system: CoordSystem): number[] {
  switch (system) {
    case "cartesian":
    case "minkowski":
      return coords.slice();
    case "polar": {
      const [r, thetaDeg] = coords;
      const t = degToRad(thetaDeg);
      return [r * Math.cos(t), r * Math.sin(t)];
    }
    case "cylindrical": {
      const [r, thetaDeg, z] = coords;
      const t = degToRad(thetaDeg);
      return [r * Math.cos(t), r * Math.sin(t), z];
    }
    case "spherical": {
      const [rho, thetaDeg, phiDeg] = coords;
      const th = degToRad(thetaDeg); // inclination from +z
      const ph = degToRad(phiDeg); // azimuth
      return [
        rho * Math.sin(th) * Math.cos(ph),
        rho * Math.sin(th) * Math.sin(ph),
        rho * Math.cos(th),
      ];
    }
  }
}

// cartesian spatial coords → system coords (angles in degrees).
export function fromCartesian(cart: number[], system: CoordSystem): number[] {
  switch (system) {
    case "cartesian":
      return cart.slice();
    case "polar": {
      if (cart.length !== 2) throw new UserError(8210);
      const [x, y] = cart;
      return [Math.hypot(x, y), radToDeg(Math.atan2(y, x))];
    }
    case "cylindrical": {
      if (cart.length !== 3) throw new UserError(8211);
      const [x, y, z] = cart;
      return [Math.hypot(x, y), radToDeg(Math.atan2(y, x)), z];
    }
    case "spherical": {
      if (cart.length !== 3) throw new UserError(8212);
      const [x, y, z] = cart;
      const rho = Math.hypot(x, y, z);
      const theta = rho === 0 ? 0 : radToDeg(Math.acos(z / rho));
      const phi = radToDeg(Math.atan2(y, x));
      return [rho, theta, phi];
    }
    case "minkowski":
      throw new UserError(8213); // handled by convertCoords
  }
}

// Convert a point's coords from one system to another. Minkowski rules:
//   minkowski → spatial:  drop the time coordinate
//   spatial   → minkowski: prepend t = 0
export function convertCoords(
  coords: number[],
  from: CoordSystem,
  target: CoordSystem,
): number[] {
  if (from === target) return coords.slice();
  const cart =
    from === "minkowski" ? coords.slice(1) : toCartesian(coords, from);
  if (target === "minkowski") return [0, ...cart];
  if (target === "cartesian") return cart;
  return fromCartesian(cart, target);
}

// Pad two coord arrays to equal length and combine element-wise.
export function combine(
  a: number[],
  b: number[],
  f: (x: number, y: number) => number,
): number[] {
  const n = Math.max(a.length, b.length);
  const out: number[] = [];
  for (let i = 0; i < n; i++) out[i] = f(a[i] ?? 0, b[i] ?? 0);
  return out;
}

// Minkowski squared interval from the origin: −t² + Σ space².
export function minkowskiNorm2(coords: number[]): number {
  const [t, ...space] = coords;
  return -t * t + space.reduce((s, v) => s + v * v, 0);
}

// Signed spacetime interval s² between two events (sign ⇒ timelike < 0,
// lightlike = 0, spacelike > 0).
export function minkowskiInterval(a: number[], b: number[]): number {
  return minkowskiNorm2(combine(a, b, (x, y) => x - y));
}

// Distance of a point from the origin. Minkowski → √|s²|; everything else is
// the Euclidean length of its cartesian form.
export function magnitude(coords: number[], system: CoordSystem): number {
  if (system === "minkowski")
    return Math.sqrt(Math.abs(minkowskiNorm2(coords)));
  return Math.hypot(...toCartesian(coords, system));
}

export function euclidean(a: number[], b: number[]): number {
  return Math.hypot(...combine(a, b, (x, y) => x - y));
}

export function dot(a: number[], b: number[]): number {
  return combine(a, b, (x, y) => x * y).reduce((s, v) => s + v, 0);
}

export function cross(a: number[], b: number[]): number[] {
  if (a.length !== 3 || b.length !== 3) throw new UserError(8215);
  return [
    a[1] * b[2] - a[2] * b[1],
    a[2] * b[0] - a[0] * b[2],
    a[0] * b[1] - a[1] * b[0],
  ];
}

// Angle between two vectors, in degrees.
export function angleBetween(a: number[], b: number[]): number {
  const ma = Math.hypot(...a);
  const mb = Math.hypot(...b);
  if (ma === 0 || mb === 0) throw new UserError(8216);
  const c = Math.min(1, Math.max(-1, dot(a, b) / (ma * mb)));
  return radToDeg(Math.acos(c));
}

export function midpoint(a: number[], b: number[]): number[] {
  return combine(a, b, (x, y) => (x + y) / 2);
}

export function normalize(a: number[]): number[] {
  const m = Math.hypot(...a);
  if (m === 0) throw new UserError(8217);
  return a.map((v) => v / m);
}

// Round to 4 dp and trim; snap floating-point dust to 0.
export function formatNum(n: number): string {
  if (!Number.isFinite(n)) return n.toString();
  const r = Math.abs(n) < 5e-5 ? 0 : Number.parseFloat(n.toFixed(4));
  return (Object.is(r, -0) ? 0 : r).toString();
}

// Render a point: `point(…)` for cartesian, `<system>(…)` otherwise, with a `°`
// suffix on angular axes.
export function formatCoords(coords: number[], system: CoordSystem): string {
  const ang = angularAxes(system);
  const name = system === "cartesian" ? "point" : system;
  const parts = coords.map((c, i) => `${formatNum(c)}${ang.has(i) ? "°" : ""}`);
  return `${name}(${parts.join(", ")})`;
}
