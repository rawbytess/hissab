import UnitTypes from "../types/unit_enum";
import {
  addDim,
  type DimensionVector,
  dimIsEmpty,
  scaleDim,
} from "../types/unit_types";
import { type UnitAtom, UnitToken } from "./tokens";

// Empty compound = dimensionless. Caller chooses how to surface that (drop the
// unit, multiply value by residual siFactor).
export function composeAtomsDim(atoms: UnitAtom[]): DimensionVector {
  let dim: DimensionVector = {};
  for (const atom of atoms) {
    dim = addDim(dim, scaleDim(atom.unit.dim, atom.exponent));
  }
  return dim;
}

export function composeAtomsSiFactor(atoms: UnitAtom[]): number {
  let f = 1;
  for (const atom of atoms) {
    f *= atom.unit.siFactor ** atom.exponent;
  }
  return f;
}

// Display form. Positive-exponent atoms joined by `*`, then `/`, then
// negative-exponent atoms (printed with their absolute exponent). Uses each
// atom's UnitToken.originalValue so user-written forms like `km` survive into
// the canonical string ("km*minute/hour").
export function formatCompound(atoms: UnitAtom[]): string {
  const positives = atoms.filter((a) => a.exponent > 0);
  const negatives = atoms.filter((a) => a.exponent < 0);
  const fmt = (a: UnitAtom) => {
    const e = Math.abs(a.exponent);
    const v = a.unit.originalValue || a.unit.value;
    return e === 1 ? v : `${v}^${e}`;
  };
  const pos = positives.map(fmt).join("*");
  if (negatives.length === 0) return pos || "1";
  const neg = negatives.map(fmt).join("*");
  return `${pos || "1"}/${neg}`;
}

// Collapse atoms by (canonical name + prefix value) — same-name same-prefix
// atoms sum their exponents, zero-exponent atoms drop. Different names with
// the same dim (km vs m, minute vs hour) do NOT collapse here; they remain as
// separate atoms in the display, and dimensional cancellation is tracked via
// composeAtomsDim.
export function mergeAtoms(atoms: UnitAtom[]): UnitAtom[] {
  const order: string[] = [];
  const byKey = new Map<string, UnitAtom>();
  for (const a of atoms) {
    const key = `${a.unit.value}|${a.unit.prefix?.value ?? ""}`;
    const existing = byKey.get(key);
    if (existing) {
      existing.exponent += a.exponent;
    } else {
      byKey.set(key, { unit: a.unit, exponent: a.exponent });
      order.push(key);
    }
  }
  const out: UnitAtom[] = [];
  for (const k of order) {
    const a = byKey.get(k)!;
    if (a.exponent !== 0) out.push(a);
  }
  return out;
}

export function atomsOf(unit: UnitToken): UnitAtom[] {
  if (unit.components && unit.components.length > 0) {
    return unit.components.map((a) => ({ unit: a.unit, exponent: a.exponent }));
  }
  return [{ unit, exponent: 1 }];
}

export function makeCompoundUnit(
  atoms: UnitAtom[],
  originalValue?: string,
): UnitToken {
  const u = new UnitToken(
    "__compound__",
    originalValue ?? formatCompound(atoms),
    { type: UnitTypes.COMPOUND, description: "Compound unit" },
  );
  u.components = atoms;
  u.dim = composeAtomsDim(atoms);
  u.siFactor = composeAtomsSiFactor(atoms);
  return u;
}

// Raise a unit to an integer power. exp=0 → null (dimensionless). exp=1 →
// return the unit as-is. Otherwise produce a compound with scaled atoms.
export function scaleUnit(
  unit: UnitToken | null | undefined,
  exp: number,
): UnitToken | null {
  if (!unit) return null;
  if (exp === 0) return null;
  if (exp === 1) return unit;
  const scaledAtoms = atomsOf(unit).map((a) => ({
    unit: a.unit,
    exponent: a.exponent * exp,
  }));
  const merged = mergeAtoms(scaledAtoms);
  if (merged.length === 0) return null;
  // Single atom with exponent 1 collapses back to the simple form for display.
  if (merged.length === 1 && merged[0].exponent === 1) return merged[0].unit;
  return makeCompoundUnit(merged);
}

// Multiplicative composition. sign=+1 → product, sign=-1 → quotient.
// Returns { unit, residualFactor }: when the composed dim is empty (every axis
// cancels), `unit` is null and `residualFactor` carries the dimensionless
// scalar that the caller must fold into the numeric value.
export function composeUnits(
  a: UnitToken | null | undefined,
  b: UnitToken | null | undefined,
  sign: 1 | -1,
): { unit: UnitToken | null; residualFactor: number } {
  if (!a && !b) return { unit: null, residualFactor: 1 };
  if (!a) {
    const u = sign === 1 ? b! : scaleUnit(b!, -1);
    return { unit: u, residualFactor: 1 };
  }
  if (!b) return { unit: a, residualFactor: 1 };

  const aAtoms = atomsOf(a);
  const bAtoms = atomsOf(b).map((at) => ({
    unit: at.unit,
    exponent: at.exponent * sign,
  }));
  const merged = mergeAtoms([...aAtoms, ...bAtoms]);
  const dim = composeAtomsDim(merged);

  if (dimIsEmpty(dim)) {
    // All dimensions cancel out. The atoms may still carry a non-trivial
    // residual scalar (e.g. km/m → 1000) which must hit the numeric value.
    const residual = composeAtomsSiFactor(merged);
    return { unit: null, residualFactor: residual };
  }

  if (merged.length === 0) return { unit: null, residualFactor: 1 };
  if (merged.length === 1 && merged[0].exponent === 1) {
    return { unit: merged[0].unit, residualFactor: 1 };
  }
  return { unit: makeCompoundUnit(merged), residualFactor: 1 };
}
