import { Units } from "./types/unit_types";
import UnitTypes from "./types/unit_enum";
import { UnhandledError, UserError } from "./exceptions";
import { NumberToken } from "./tokens/tokens";

function humanize(
  resultToken: NumberToken,
  convertTo: string[] | undefined,
): string {
  const { unit } = resultToken;
  if (!unit) return resultToken.getString();
  if (!unit.unitdata.convertTo && !convertTo) return resultToken.getString();
  if (convertTo?.length === 0) throw new UnhandledError(2234);
  let value = resultToken.toNumber();
  let answer = "";
  const convert2 = convertTo || unit.unitdata.convertTo || [];
  for (const [i, u] of convert2.entries()) {
    let factor = 0;
    let postUnit = "";

    if (Units[u].type === UnitTypes.POSTFIX) {
      if (unit.unitdata.type === UnitTypes.DATA)
        factor = Units[u].datafactor! / (unit?.prefix?.factor ?? 1);
      else factor = Units[u].factor! / (unit?.prefix?.factor ?? 1);
      postUnit = unit.value;
    } else {
      if (Units[u].type !== unit.unitdata.type) throw new UserError(2334);
      factor = Units[u].factors![unit.value];
    }
    const x = parseFloat((value / factor).toFixed(10));

    if (Math.abs(x) < 1) continue;
    if (isWhole(x)) {
      answer += `${x.toLocaleString(undefined, {
        maximumFractionDigits: 10,
        notation: Math.abs(x) > 1e15 ? "scientific" : "standard",
      })} ${u === "_" ? "" : u}${postUnit}`;
      break;
    }

    answer +=
      i === convert2.length - 1
        ? `${x.toLocaleString(undefined, {
            maximumFractionDigits: 4,
            notation: Math.abs(x) > 1e15 ? "scientific" : "standard",
          })} ${u === "_" ? "" : u}${postUnit}`
        : `${Math.floor(x).toLocaleString(undefined, {
            maximumFractionDigits: 4,
            notation: Math.abs(x) > 1e15 ? "scientific" : "standard",
          })} ${u === "_" ? "" : u}${postUnit} `;
    value %= factor;
  }
  return answer.trim();
}

function isWhole(n: number) {
  return n - Math.floor(n) === 0;
}
export { humanize };
