import { ExpWithResult } from "./types/AITypes";
import {
  doLex,
  doParse,
  TokenBaseType,
  tokenFactory,
  TokenType,
  Variables,
} from "../engine";
import { run } from "./errors";

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
  isPro: boolean,
): Promise<ExpWithResult[]> {
  const expWRes: ExpWithResult[] = [];
  const localVariables: Variables = {};
  for (const [ind, exp] of expressions.entries()) {
    await calculateTotal(ind + 1, localVariables);
    calculatePrev(ind + 1, localVariables);
    const tokens = doLex(exp, localVariables, ind + 1);
    const parseResult = await run(doParse(tokens, isPro));
    if (parseResult.failed) {
      expWRes.push({
        expression: exp,
        result: "",
        error: true,
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
