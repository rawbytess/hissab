import { doLex, doParse, type Variables } from "@rawbytes/hissab";
import { run } from "./errors";
import type { ExpWithResult } from "./types/AITypes";

export async function calculateTotal(index: number, variables: Variables) {
  // Sum by reference (`line1 + line2 + …`) instead of handing the stored
  // result tokens to the parser: references are copied on use, so aligning
  // units while summing can't rewrite an earlier line's result in place.
  const refs: string[] = [];
  for (let i = 1; i < index; i++) {
    if (variables[`line${i}`]) refs.push(`line${i}`);
  }
  if (refs.length === 0) return;
  try {
    const { resultToken } = await doParse(doLex(refs.join(" + "), variables));
    variables[`total${index}`] = resultToken;
  } catch {}
}

export function calculatePrev(index: number, variables: Variables) {
  for (let i = index; i > 1; i--) {
    if (variables[`line${i - 1}`]) {
      variables[`prev${index}`] = variables[`line${i - 1}`];
      break;
    }
  }
}

export async function calculateExpressions(
  expressions: string[],
): Promise<ExpWithResult[]> {
  const expWRes: ExpWithResult[] = [];
  const localVariables: Variables = {};

  for (const [ind, exp] of expressions.entries()) {
    await calculateTotal(ind + 1, localVariables);
    calculatePrev(ind + 1, localVariables);
    const tokens = doLex(exp, localVariables, ind + 1);
    const parseResult = await run(doParse(tokens));
    if (parseResult.failed) {
      const reason =
        parseResult.error instanceof Error
          ? parseResult.error.message
          : String(parseResult.error ?? "");
      expWRes.push({
        expression: exp,
        result: "",
        error: true,
        errorMessage: reason || undefined,
      });
      continue;
    }
    const { result, resultToken, meta } = parseResult.data;
    if (meta.variableName) localVariables[meta.variableName] = resultToken;
    localVariables[`line${ind + 1}`] = resultToken;
    localVariables[`l${ind + 1}`] = resultToken;
    expWRes.push({ expression: exp, result: result });
  }
  return expWRes;
}
