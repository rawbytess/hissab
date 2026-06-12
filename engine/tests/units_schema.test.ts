// Initialize the engine module graph in its proven order before
// deep-importing table internals — entering unit_types.ts directly trips the
// Units/plurals init cycle (see functions/index.ts).
import "../src";

import { BASE_UNIT_BY_TYPE, Units, UnitTypes } from "../src/types/unit_types";

// Schema invariants for the Units table. The table is hand-maintained data;
// these checks catch the silent failure modes a typo'd entry produces at
// runtime (wrong conversions, dead display families, crashing temperature
// lambdas) at test time instead.

// `factor` is sometimes a rounded display value while `factors[BASE]` holds
// the precise ratio (baseSiFactor prefers the latter). Entries whose known
// drift exceeds the tolerance are documented here — shrink this list by
// reconciling the data, never grow it.
//
// ton: factor says US short ton (907,185 g) but factors.gram says metric
// tonne (1,000,000 g) — a real data inconsistency surfaced by this test;
// conversions use the pairwise factors, so resolving it changes golden
// outputs and needs a deliberate decision.
const FACTOR_DRIFT_ALLOWLIST = new Set<string>(["ton"]);
const FACTOR_DRIFT_TOLERANCE = 1e-3;

// Known-intentional plural/unit aliases: `cubic feet` is both a real unit
// key and declared as the plural of `cubic foot`.
const PLURAL_ALIAS_ALLOWLIST = new Set<string>(["cubic foot"]);

describe("Units table schema", () => {
  const entries = Object.entries(Units);

  test("display families resolve to real entries of the declared kind", () => {
    const problems: string[] = [];
    for (const [name, data] of entries) {
      if (!data.display) continue;
      for (const member of data.display.family) {
        if (data.display.kind === "prefixes") {
          const target = Units[member];
          if (!target || target.type !== UnitTypes.POSTFIX)
            problems.push(`${name}: prefix family member ${member}`);
        } else {
          const target = Units[member];
          if (!target || target.type !== data.type)
            problems.push(`${name}: unit family member ${member}`);
        }
      }
    }
    expect(problems).toStrictEqual([]);
  });

  test("every factors key is a real unit", () => {
    const problems: string[] = [];
    for (const [name, data] of entries) {
      for (const key of Object.keys(data.factors ?? {})) {
        if (!(key in Units)) problems.push(`${name}: factors[${key}]`);
      }
    }
    expect(problems).toStrictEqual([]);
  });

  test("every TEMPERATURE entry has all four scale lambdas", () => {
    const problems: string[] = [];
    for (const [name, data] of entries) {
      if (data.type !== UnitTypes.TEMPERATURE) continue;
      for (const scale of ["kelvin", "celsius", "fahrenheit", "rankine"]) {
        if (typeof data[scale as "kelvin"] !== "function")
          problems.push(`${name}: missing ${scale}()`);
      }
    }
    expect(problems).toStrictEqual([]);
  });

  test("factor agrees with factors[BASE] within tolerance (or is allowlisted)", () => {
    const problems: string[] = [];
    for (const [name, data] of entries) {
      // DURATION's `factor` is deliberately a different scale (occurrences
      // per year: yearly=1, monthly=12, …), not a unit→base ratio.
      if (data.type === UnitTypes.DURATION) continue;
      const base = BASE_UNIT_BY_TYPE[data.type];
      if (!base || !data.factors || data.factor === undefined) continue;
      const precise = data.factors[base];
      if (precise === undefined || precise === 0) continue;
      const drift = Math.abs(data.factor - precise) / Math.abs(precise);
      if (drift > FACTOR_DRIFT_TOLERANCE && !FACTOR_DRIFT_ALLOWLIST.has(name))
        problems.push(
          `${name}: factor=${data.factor} factors[${base}]=${precise}`,
        );
    }
    expect(problems).toStrictEqual([]);
  });

  test("plural values do not collide with other unit names", () => {
    const problems: string[] = [];
    for (const [name, data] of entries) {
      if (!data.plural) continue;
      if (
        data.plural in Units &&
        data.plural !== name &&
        !PLURAL_ALIAS_ALLOWLIST.has(name)
      )
        problems.push(`${name}: plural "${data.plural}" is also a unit`);
    }
    expect(problems).toStrictEqual([]);
  });
});
