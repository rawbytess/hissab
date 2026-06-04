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

export const CELL_ARTIFACTS_EVENT = "hissab-cell-artifacts";

export interface ArtifactsDetail {
  artifacts: CellArtifact[];
}
