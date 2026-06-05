// Inline rendering of a matrix back to literal syntax (`[a b c, d e f]`) so a
// result round-trips as valid input and stays on one line (the app editor shows
// one result per line). Columns join with spaces, rows with `, `.

import type { Mat } from "./ops";

export function formatNum(x: number): string {
  if (!Number.isFinite(x)) return x > 0 ? "Infinity" : "-Infinity";
  if (Math.abs(x) < 1e-12) return "0";
  const rounded = Math.round(x);
  if (Math.abs(x - rounded) < 1e-9) return rounded.toString();
  // Trim to a sane precision and strip trailing zeros.
  const s = x.toPrecision(10);
  return Number.parseFloat(s).toString();
}

export function formatMatrix(data: Mat): string {
  return `[${data.map((row) => row.map(formatNum).join(" ")).join(", ")}]`;
}
