import {
  doLex,
  doParse,
  TokenBaseType,
  type TokenType,
  tokenFactory,
  type Variables,
} from "@rawbytes/hissab";
import { run } from "./errors";
import type { ExpWithResult } from "./types/AITypes";

export async function calculateTotal(index: number, variables: Variables) {
  const tokens: TokenType[] = [];
  try {
    for (let i = 1; i < index; i++) {
      if (variables[`line${i}`]) {
        tokens.push(variables[`line${i}`]);
        tokens.push(tokenFactory("+", TokenBaseType.SYMBOL) as TokenType);
      }
    }
    tokens.pop();
    if (tokens.length === 0) return;
    const { resultToken } = await doParse(tokens);
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
