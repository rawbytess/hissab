import { UnhandledError, UserError } from "./exceptions";
import type { NumberToken } from "./tokens/tokens";
import UnitTypes from "./types/unit_enum";
import { linearFactor, Units } from "./types/unit_types";

function humanize(
  resultToken: NumberToken,
  convertTo: string[] | undefined,
): string {
  const { unit } = resultToken;
  if (!unit) return resultToken.getString();
  // Compound units don't have a meaningful `convertTo` family — emit the
  // unit's user-form / canonical-form string and let the user request an
  // explicit `to` for any further breakdown.
  if (unit.isCompound && !convertTo) return resultToken.getString();
  if (!unit.unitdata.convertTo && !convertTo) return resultToken.getString();
  if (convertTo?.length === 0) throw new UnhandledError(2234);
  let value = resultToken.toNumber();
  let answer = "";
  const targets = convertTo || unit.unitdata.convertTo || [];
  for (const [i, u] of targets.entries()) {
    const { factor, postUnit } = getFactor(u, unit);
    const x = parseFloat((value / factor).toFixed(10));

    if (Math.abs(x) < 1) continue;
    const isLast = i === targets.length - 1;
    if (isWhole(x)) {
      answer += formatComponent(x, u, postUnit, 10);
      break;
    }
    answer += isLast
      ? formatComponent(x, u, postUnit, 4)
      : `${formatComponent(Math.floor(x), u, postUnit, 4)} `;
    value %= factor;
  }
  return answer.trim();
}

function getFactor(
  targetUnit: string,
  unit: NonNullable<NumberToken["unit"]>,
): { factor: number; postUnit: string } {
  if (Units[targetUnit].type === UnitTypes.POSTFIX) {
    const isData = unit.unitdata.type === UnitTypes.DATA;
    const raw = isData
      ? Units[targetUnit].datafactor!
      : Units[targetUnit].factor!;
    return { factor: raw / (unit?.prefix?.factor ?? 1), postUnit: unit.value };
  }
  if (Units[targetUnit].type !== unit.unitdata.type) throw new UserError(2334);
  return { factor: linearFactor(targetUnit, unit.value), postUnit: "" };
}

function formatComponent(
  x: number,
  unit: string,
  postUnit: string,
  maxFractionDigits: number,
): string {
  const formatted = x.toLocaleString(undefined, {
    maximumFractionDigits: maxFractionDigits,
    notation: Math.abs(x) > 1e15 ? "scientific" : "standard",
  });
  return `${formatted} ${unit === "_" ? "" : unit}${postUnit}`;
}

function isWhole(n: number) {
  return n - Math.floor(n) === 0;
}

export { humanize };
