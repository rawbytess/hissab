import type { Range, StateEffectType } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
} from "@codemirror/view";
import {
  doLex,
  doParse,
  type ExprToken,
  exprToLatex,
  type Variables,
} from "@rawbytes/hissab";
import { ResultWidget } from "@/lib/editor/resultWidget.ts";
import {
  calculatePrev,
  calculateTotal,
} from "../../../../lib/calculateExpressions.ts";
import type { CustomError } from "../../../../lib/errors.ts";

export interface Results {
  result: string;
  error: boolean;
  loading: boolean;
  errorMessage: CustomError | null;
  stale: boolean;
  lineNumber: number;
  // LaTeX for symbolic results (an ExprToken); rendered with KaTeX in the result
  // widget. Undefined for numeric/unit/date/color results, which stay as text.
  latex?: string;
}

export async function getResult(
  view: EditorView,
  storePage: (content: string) => void,
  oldResults: Results[],
) {
  const state = view.state;
  const data = state.doc.toString();
  const variables: Variables = {};
  const results: Results[] = [];
  const lines = data.split("\n");
  storePage(data);
  let ln = "";
  for (const [index, line] of lines.entries()) {
    try {
      [ln] = line.split("//");
      ln = ln.trim();
      await calculateTotal(index + 1, variables);
      calculatePrev(index + 1, variables);
      const tokens = doLex(ln, variables, index + 1);
      const { result, meta, resultToken } = await doParse(tokens);
      results.push({
        result,
        stale: false,
        loading: false,
        lineNumber: index,
        error: false,
        errorMessage: null,
        latex:
          resultToken?.kind === "exprToken"
            ? exprToLatex((resultToken as ExprToken).expr)
            : undefined,
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
          latex: oldResults[index]?.latex,
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
) {
  const resultWidgets: Range<Decoration>[] = [];

  results.forEach((res: Results, index: number) => {
    const deco = Decoration.widget({
      widget: new ResultWidget(res, view),
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
