import {
  doLex,
  doParse,
  ReportError,
  TokenBaseType,
  tokenFactory,
  TokenType,
  Variables,
} from "engine";
import { EditorState } from "@codemirror/state";
import { getAIResult } from "@/queries/useAIPromptQuery.tsx";

export interface Results {
  result: string;
  error: boolean;
  errorMessage: ReportError | null;
  stale: boolean;
  lineNumber: number;
  ai?: {
    expressions: string[];
  };
}

async function calculateTotal(index: number, variables: Variables) {
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

function calculatePrev(index: number, variables: Variables) {
  for (let i = index; i > 1; i--) {
    if (variables[`line${i - 1}`]) {
      variables[`prev${index}`] = variables[`line${i - 1}`];
      break;
    }
  }
}

export async function getResult(
  state: EditorState,
  storePage: (content: string) => void,
  oldResults: Results[],
  isPro: boolean,
) {
  const data = state.doc.toString();
  const currentLine = state.doc.lineAt(state.selection.main.head).number;
  const variables: Variables = {};
  const results: Results[] = [];
  const lines = data.split("\n");
  storePage(data);
  let ln = "";

  for (const [index, line] of lines.entries()) {
    try {
      if (line.trim().startsWith("ai ")) {
        const aiPrompt = line.trim().substring(2).trim();
        if (index === currentLine - 1) {
          results.push({
            result: oldResults[index].result || "",
            stale: true,
            lineNumber: index,
            error: false,
            errorMessage: null,
          });
          continue;
        }
        const aiResult = await getAIResult(aiPrompt);
        const localVariables: Variables = {};
        if (aiResult) {
          if (aiResult.AIResponse.expressions.length === 1) {
            const exp = aiResult.AIResponse.expressions[0];
            await calculateTotal(index + 1, variables);
            calculatePrev(index + 1, variables);
            const tokens = doLex(exp, variables, index + 1);
            const { result, resultToken } = await doParse(tokens, isPro);
            results.push({
              result: result,
              stale: false,
              lineNumber: index,
              error: false,
              errorMessage: null,
            });
            variables[`line${index + 1}`] = resultToken;
            variables[`l${index + 1}`] = resultToken;
          } else if (aiResult.AIResponse.expressions.length > 1) {
            const exps: string[] = [];
            for (const [
              ind,
              exp,
            ] of aiResult.AIResponse.expressions.entries()) {
              await calculateTotal(ind + 1, localVariables);
              calculatePrev(ind + 1, localVariables);
              const tokens = doLex(exp, localVariables, ind + 1);
              const { result, resultToken, meta } = await doParse(
                tokens,
                isPro,
              );
              if (meta.variableName)
                localVariables[meta.variableName] = resultToken;
              localVariables[`line${ind + 1}`] = resultToken;
              localVariables[`l${ind + 1}`] = resultToken;
              exps.push(`${exp}: ${result}`);
            }

            results.push({
              result: exps.join("\n"),
              stale: false,
              lineNumber: index,
              error: false,
              errorMessage: null,
            });
          }
          continue;
        }
      }
      [ln] = line.split("//");
      ln = ln.trim();
      await calculateTotal(index + 1, variables);
      calculatePrev(index + 1, variables);
      const tokens = doLex(ln, variables, index + 1);
      const { result, meta, resultToken } = await doParse(tokens, isPro);
      results.push({
        result,
        stale: false,
        lineNumber: index,
        error: false,
        errorMessage: null,
      });
      if (meta.variableName) variables[meta.variableName] = resultToken;
      variables[`line${index + 1}`] = resultToken;
      variables[`l${index + 1}`] = resultToken;
    } catch (e: any) {
      if (oldResults && oldResults[index] && ln.length)
        results.push({
          result: oldResults[index].result,
          error: true,
          errorMessage: e,
          stale: true,
          lineNumber: index,
        });
      else
        results.push({
          result: "",
          stale: true,
          lineNumber: index,
          error: true,
          errorMessage: e,
        });
    }
  }
  return results;
}
