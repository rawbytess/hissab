import type { Range, StateEffectType } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  type EditorView,
} from "@codemirror/view";
import {
  ComplexToken,
  doLex,
  doParse,
  ExprToken,
  exprToLatex,
  freeSymbols,
  PlotToken,
  PointToken,
  type TokenType,
  type Variables,
} from "@rawbytes/hissab";
import type { CellArtifact } from "@/lib/editor/cellArtifacts.ts";
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
  // The result token's `kind` (e.g. "booleanToken", "pointToken"), so the result
  // widget can give structured results badge/chip styling.
  kind?: string;
}

export async function getResult(
  view: EditorView,
  storePage: (content: string) => void,
  oldResults: Results[],
): Promise<{ results: Results[]; artifacts: CellArtifact[] }> {
  const state = view.state;
  const data = state.doc.toString();
  const variables: Variables = {};
  const results: Results[] = [];
  const artifacts: CellArtifact[] = [];
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
        kind: resultToken?.kind,
        latex:
          resultToken?.kind === "exprToken"
            ? exprToLatex((resultToken as ExprToken).expr)
            : undefined,
      });
      const artifact = toPlotArtifact(resultToken, result, index);
      if (artifact) artifacts.push(artifact);
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
  return { results, artifacts };
}

// Map a line's result token to a graph artifact, or null when it isn't
// graphable. `draw(...)` yields a PlotToken → an *explicit* graph. Results that
// are naturally graphable (a single-variable expression, a complex number, a
// coordinate point) yield a *suggested* graph the user can expand via the 📈
// affordance. The label uses the line's formatted result string.
function toPlotArtifact(
  token: TokenType | undefined,
  result: string,
  lineNumber: number,
): CellArtifact | null {
  const id = `plot:${lineNumber}`;
  if (token instanceof PlotToken)
    return {
      kind: "plot",
      id,
      lineNumber,
      source: "explicit",
      series: token.series,
    };
  if (token instanceof ExprToken) {
    const vars = freeSymbols(token.expr);
    if (vars.length !== 1) return null; // 0 vars = constant, >1 = surface (not v1)
    return {
      kind: "plot",
      id,
      lineNumber,
      source: "suggested",
      series: [
        { type: "curve", expr: token.expr, variable: vars[0], label: result },
      ],
    };
  }
  if (token instanceof ComplexToken)
    return {
      kind: "plot",
      id,
      lineNumber,
      source: "suggested",
      series: [{ type: "complex", re: token.re, im: token.im, label: result }],
    };
  if (token instanceof PointToken)
    return {
      kind: "plot",
      id,
      lineNumber,
      source: "suggested",
      series: [{ type: "point", coords: token.cartesian(), label: result }],
    };
  return null;
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
