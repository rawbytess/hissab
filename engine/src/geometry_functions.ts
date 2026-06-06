import { UserError } from "./exceptions";

// Pure shape geometry — no tokens, no units. Each function takes plain numbers
// and returns a plain number. The unit-aware wrappers in function.ts decide how
// to surface a result (area/volume units) from the argument tokens.

// ---- Areas --------------------------------------------------------------

export function circleArea(r: number): number {
  return Math.PI * r * r;
}

export function circleCircumference(r: number): number {
  return 2 * Math.PI * r;
}

export function squareArea(side: number): number {
  return side * side;
}

export function squarePerimeter(side: number): number {
  return 4 * side;
}

export function rectangleArea(width: number, height: number): number {
  return width * height;
}

export function rectanglePerimeter(width: number, height: number): number {
  return 2 * (width + height);
}

export function triangleArea(base: number, height: number): number {
  return 0.5 * base * height;
}

// Area of a triangle from its three side lengths (Heron's formula). The sides
// must satisfy the triangle inequality.
export function heronArea(a: number, b: number, c: number): number {
  const s = (a + b + c) / 2;
  const area2 = s * (s - a) * (s - b) * (s - c);
  if (area2 <= 0) throw new UserError(9610);
  return Math.sqrt(area2);
}

export function trapezoidArea(a: number, b: number, height: number): number {
  return 0.5 * (a + b) * height;
}

export function parallelogramArea(base: number, height: number): number {
  return base * height;
}

export function ellipseArea(a: number, b: number): number {
  return Math.PI * a * b;
}

// ---- Surface areas & volumes -------------------------------------------

export function sphereVolume(r: number): number {
  return (4 / 3) * Math.PI * r ** 3;
}

export function sphereSurfaceArea(r: number): number {
  return 4 * Math.PI * r * r;
}

export function cubeVolume(side: number): number {
  return side ** 3;
}

export function cubeSurfaceArea(side: number): number {
  return 6 * side * side;
}

export function cylinderVolume(r: number, height: number): number {
  return Math.PI * r * r * height;
}

export function cylinderSurfaceArea(r: number, height: number): number {
  return 2 * Math.PI * r * (r + height);
}

export function coneVolume(r: number, height: number): number {
  return (1 / 3) * Math.PI * r * r * height;
}

export function coneSurfaceArea(r: number, height: number): number {
  // Base + lateral surface; slant height l = √(r² + h²).
  return Math.PI * r * (r + Math.sqrt(r * r + height * height));
}

export function boxVolume(
  length: number,
  width: number,
  height: number,
): number {
  return length * width * height;
}

export function pyramidVolume(
  length: number,
  width: number,
  height: number,
): number {
  return (1 / 3) * length * width * height;
}

// ---- Lines --------------------------------------------------------------

// Slope of the line through (x1, y1) and (x2, y2). A vertical line has no
// (finite) slope.
export function lineSlope(
  x1: number,
  y1: number,
  x2: number,
  y2: number,
): number {
  if (x2 === x1) throw new UserError(9620);
  return (y2 - y1) / (x2 - x1);
}
