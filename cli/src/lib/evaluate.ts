import {
  doLex,
  doParse,
  type TokenType,
  type Variables,
} from "@rawbytes/hissab";
import {
  calculatePrev,
  calculateTotal,
} from "../../../lib/calculateExpressions.ts";

export interface EvalOutcome {
  result: string;
  variableName: string;
  resultToken: TokenType;
}

export async function evaluateLine(
  expr: string,
  variables: Variables,
  lineNumber = 0,
): Promise<EvalOutcome> {
  if (lineNumber > 0) {
    await calculateTotal(lineNumber, variables);
    calculatePrev(lineNumber, variables);
  }
  const tokens = doLex(expr, variables, lineNumber);
  const { result, resultToken, meta } = await doParse(tokens);
  if (meta.variableName) {
    variables[meta.variableName] = resultToken;
  }
  if (lineNumber > 0) {
    variables[`line${lineNumber}`] = resultToken;
    variables[`l${lineNumber}`] = resultToken;
  }
  return { result, variableName: meta.variableName, resultToken };
}
