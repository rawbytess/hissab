import {
  doLex,
  doParse,
  type TokenType,
  type Variables,
} from "@rawbytes/hissab";

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
  const tokens = doLex(expr, variables, lineNumber);
  const { result, resultToken, meta } = await doParse(tokens);
  if (meta.variableName) {
    variables[meta.variableName] = resultToken;
  }
  return { result, variableName: meta.variableName, resultToken };
}
