import type { PlotSeries } from "@rawbytes/hissab";

// The editor → notebook channel.
//
// An *artifact* is structured information extracted from an editor's content on
// each change that is rendered as a sibling component *below* the editor rather
// than inline. The editor (the result ViewPlugin) computes artifacts per line
// and dispatches them as a single CustomEvent on `view.dom`; the cell's React
// host (ExpressionsCell) listens and renders the matching components. Because
// each editor instance owns its own DOM container and listener, artifacts are
// inherently scoped to the editor they came from.
//
// This mirrors the existing TOKEN_INTERACT_EVENT pattern (tokenDecorations.ts)
// and is the reusable base for future "pull something out of the editor and show
// it in the notebook" features — add a new `kind` to CellArtifact and a matching
// branch in the host; nothing else about the plumbing changes.

// A graph to render below the editor. `source` distinguishes an explicit
// `draw(...)` call (rendered expanded) from a graph we inferred from a graphable
// result (rendered as a collapsed 📈 affordance the user can expand).
export interface PlotArtifact {
  kind: "plot";
  // Stable within a cell across edits to *other* lines, so a graph isn't
  // remounted while the user types elsewhere.
  id: string;
  lineNumber: number;
  source: "explicit" | "suggested";
  series: PlotSeries[];
}

export type CellArtifact = PlotArtifact;

// Curve graphs route through the engine's symbolic draw() path; complex/point
// graphs route through the numeric path, and the two can't be mixed in one
// draw() call (v1). So a graph's "domain" decides which other lines may be
// overlaid onto it.
export type PlotDomain = "curve" | "numeric";

export function plotDomain(series: PlotSeries[]): PlotDomain {
  return series.every((s) => s.type === "curve") ? "curve" : "numeric";
}

// A line whose result can be overlaid onto an explicit graph, offered as a
// quick-pick in the graph's "＋ overlay" panel. `ref` is the line reference
// spliced into the draw() call (e.g. "l3"); `label` is the readable series.
export interface OverlayCandidate {
  ref: string;
  label: string;
}

export const CELL_ARTIFACTS_EVENT = "hissab-cell-artifacts";

export interface ArtifactsDetail {
  artifacts: CellArtifact[];
}

// Lines whose result can be overlaid onto `target`: graphable *value* lines
// (suggested artifacts) above the target — references only resolve to earlier
// lines — and of the same domain, since a draw() can't mix curves with
// complex/point series (v1).
export function overlayCandidatesFor(
  target: CellArtifact,
  all: CellArtifact[],
): OverlayCandidate[] {
  const domain = plotDomain(target.series);
  return all
    .filter(
      (a) =>
        a.source === "suggested" &&
        a.lineNumber < target.lineNumber &&
        plotDomain(a.series) === domain,
    )
    .map((a) => ({
      ref: `l${a.lineNumber + 1}`,
      label: a.series.map((s) => s.label).join(", "),
    }));
}

// Splice `exprText` in as the final argument of the draw()/plot() call on
// `lineText`, preserving any trailing `// comment`. Insertion happens before
// the expression's last `)` — the call's closing paren even when an argument is
// itself a call, e.g. `draw(point(1,2))`.
export function appendDrawArg(lineText: string, exprText: string): string {
  const commentIdx = lineText.indexOf("//");
  const exprPart = commentIdx === -1 ? lineText : lineText.slice(0, commentIdx);
  const comment = commentIdx === -1 ? "" : lineText.slice(commentIdx);
  const close = exprPart.lastIndexOf(")");
  if (close === -1) return lineText;
  return `${exprPart.slice(0, close)}, ${exprText}${exprPart.slice(close)}${comment}`;
}
