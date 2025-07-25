import type { Range, StateEffectType } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
} from "@codemirror/view";
import { doLex, doParse, type Variables } from "engine";
import { aicache } from "@/lib/cache.ts";
import { ResultWidget } from "@/lib/editor/resultWidget.ts";
import { getAIResult } from "@/queries/useAIPromptQuery.tsx";
import {
  calculatePrev,
  calculateTotal,
} from "../../../../lib/calculateExpressions.ts";
import { CustomError } from "../../../../lib/errors.ts";
import {
  type AIRequest,
  inLineDefaultModel,
} from "../../../../lib/types/AITypes.ts";
import type { ProductNames } from "../../../../lib/types/userMetadata.ts";

export interface Results {
  result: string;
  error: boolean;
  loading: boolean;
  errorMessage: CustomError | null;
  stale: boolean;
  lineNumber: number;
  ai?: {
    expressions: string[];
  };
}

export async function getResult(
  view: EditorView,
  resultStateEffect: StateEffectType<{ decorations: DecorationSet }>,
  storePage: (content: string) => void,
  oldResults: Results[],
  isPro: boolean,
  isAuthenticated: boolean,
  isPremium: ProductNames | null,
) {
  const state = view.state;
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
        if (!isPro) {
          results.push({
            result: "AI features are only available in Pro version.",
            stale: false,
            loading: false,
            lineNumber: index,
            error: true,
            errorMessage: new CustomError(
              "NotSubscribed",
              "AI features are only available in Pro version.",
              "Upgrade to Pro to use AI features.",
            ),
          });
          continue;
        }
        const aiPrompt = line.trim().substring(2).trim();
        if (index === currentLine - 1) {
          results.push({
            result:
              oldResults[index]?.result ||
              aicache.get(aiPrompt)?.naturalAnswer ||
              "",
            ai:
              oldResults[index]?.ai || aicache.get(aiPrompt)
                ? {
                    // @ts-expect-error ???
                    expressions: aicache
                      .get(aiPrompt)
                      .expressions.map((x) => x.expression),
                  }
                : undefined,
            stale: !aicache.has(aiPrompt),
            loading: false,
            lineNumber: index,
            error: oldResults[index]?.error || false,
            errorMessage: oldResults[index]?.errorMessage || null,
          });
          continue;
        }
        const req: AIRequest = {
          inline: true,
          lineNumber: currentLine,
          prompt: aiPrompt,
          fallback: true,
          explain: false,
          model: "small",
          expressions: lines.map((x, i) => ({
            expression: `Line${i + 1}: ${x}`,
            result:
              oldResults[i] && oldResults[i].error
                ? ""
                : oldResults[i]?.result || "",
          })),
        };
        const aires = aicache.get(aiPrompt);
        if (aires) {
          results.push({
            result: aires.naturalAnswer,
            stale: false,
            loading: false,
            lineNumber: index,
            error: !!aires.error,
            errorMessage: aires.error
              ? new CustomError("Unknown", aires.error, aires.error)
              : null,
            ai: {
              expressions: aires.expressions.map((x) => x.expression),
            },
          });
          continue;
        }
        getAIResult(req, isAuthenticated, isPremium)
          .then((res) => {
            oldResults[index] = results[index];
            results[index] = {
              result: res.naturalAnswer,
              stale: false,
              loading: false,
              lineNumber: index,
              error: false,
              errorMessage: null,
              ai: {
                expressions: res.expressions.map((x) => x.expression),
              },
            };
          })
          .catch((e) => {
            results[index] = {
              result: oldResults[index]?.result || e.userMessage || "",
              stale: false,
              loading: false,
              lineNumber: index,
              error: true,
              errorMessage: e,
            };
          })
          .finally(() => {
            refreshResults(results, oldResults, view, resultStateEffect, isPro);
          });

        results.push({
          result: oldResults[index]?.result || "",
          stale: false,
          loading: true,
          lineNumber: index,
          error: false,
          errorMessage: null,
        });
        continue;
      }
      [ln] = line.split("//");
      ln = ln.trim();
      await calculateTotal(index + 1, variables);
      calculatePrev(index + 1, variables);
      const tokens = doLex(ln, variables, index + 1);
      const { result, meta, resultToken } = await doParse(tokens, true);
      results.push({
        result,
        stale: false,
        loading: false,
        lineNumber: index,
        error: false,
        errorMessage: null,
      });
      if (meta.variableName) variables[meta.variableName] = resultToken;
      variables[`line${index + 1}`] = resultToken;
      variables[`l${index + 1}`] = resultToken;
    } catch (e) {
      if (oldResults && ln.length)
        results.push({
          result: oldResults[index]?.result ?? "",
          error: true,
          loading: false,
          errorMessage: e as CustomError,
          stale: true,
          lineNumber: index,
        });
      else
        results.push({
          result: "",
          stale: true,
          loading: false,
          lineNumber: index,
          error: true,
          errorMessage: e as CustomError,
        });
    }
  }
  return results;
}

export async function refreshResults(
  results: Results[],
  oldResults: Results[],
  view: EditorView,
  resultStateEffect: StateEffectType<{ decorations: DecorationSet }>,
  isPro: boolean,
) {
  const resultWidgets: Range<Decoration>[] = [];

  results.forEach((res: Results, index: number) => {
    const deco = Decoration.widget({
      widget: new ResultWidget(res, isPro, view),
      side: 1,
      block: false,
    });
    const { to } = view.state.doc.line(index + 1);
    resultWidgets.push(deco.range(to));
  });
  const deco = Decoration.set(resultWidgets);

  view.dispatch({
    effects: [
      resultStateEffect.of({
        decorations: deco,
      }),
    ],
  });
}
