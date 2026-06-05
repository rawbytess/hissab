import { type Expr, evalExpr } from "@rawbytes/hissab";
import type { FunctionPlotDatum, FunctionPlotOptions } from "function-plot";
import functionPlotImport from "function-plot";
import { debounce } from "lodash-es";
import { LineChart, Plus } from "lucide-react";
import { useEffect, useMemo, useRef, useState } from "react";
import {
  type CellArtifact,
  type OverlayCandidate,
  plotDomain,
} from "@/lib/editor/cellArtifacts.ts";

// function-plot ships CommonJS (no ESM build); depending on the bundler's
// interop the callable is either the default import itself or nested under
// `.default`. Normalise so both dev (esbuild) and prod (rollup) resolve it.
const functionPlot: (options: FunctionPlotOptions) => unknown =
  typeof functionPlotImport === "function"
    ? functionPlotImport
    : (functionPlotImport as { default: (o: FunctionPlotOptions) => unknown })
        .default;

// Curves drawn from the engine's catalog of result colours. Index by series.
const PALETTE = [
  "#7aa2f7",
  "#bb9af7",
  "#7dcfff",
  "#9ece6a",
  "#e0af68",
  "#f7768e",
];

const CURVE_DOMAIN: [number, number] = [-10, 10];
const CURVE_SAMPLES = 600;
const PLOT_HEIGHT = 240;
// Treat anything beyond this as an asymptote/blow-up: break the polyline so we
// don't draw a near-vertical line across the chart, and ignore it for bounds.
const CLAMP = 1e6;

// Sample a curve into one or more polyline segments. A `null`/out-of-range
// sample (out-of-domain, ∞, or an asymptote) ends the current segment so the
// gap is preserved instead of being bridged.
function sampleCurve(
  expr: Expr,
  variable: string,
  [from, to]: [number, number],
  n: number,
): number[][][] {
  const segments: number[][][] = [];
  let current: number[][] = [];
  const step = (to - from) / n;
  for (let i = 0; i <= n; i++) {
    const x = from + i * step;
    const y = evalExpr(expr, { [variable]: x });
    if (y === null || Math.abs(y) > CLAMP) {
      if (current.length) {
        segments.push(current);
        current = [];
      }
    } else {
      current.push([x, y]);
    }
  }
  if (current.length) segments.push(current);
  return segments;
}

// Padded [min, max] of the finite values, or `fallback` when there are none.
function boundsOf(
  values: number[],
  fallback: [number, number],
): [number, number] {
  const finite = values.filter(
    (v) => Number.isFinite(v) && Math.abs(v) <= CLAMP,
  );
  if (finite.length === 0) return fallback;
  let lo = Math.min(...finite);
  let hi = Math.max(...finite);
  if (lo === hi) {
    lo -= 1;
    hi += 1;
  }
  const pad = (hi - lo) * 0.1;
  return [lo - pad, hi + pad];
}

// Translate the artifact's series into function-plot options. Curves are
// sampled here (the engine is the single source of truth for evaluation) and
// fed as precomputed polylines; complex numbers become vectors on the Argand
// plane; coordinate points become a scatter.
function buildOptions(
  target: HTMLElement,
  artifact: CellArtifact,
  width: number,
): FunctionPlotOptions {
  const data: FunctionPlotDatum[] = [];
  const xs: number[] = [];
  const ys: number[] = [];
  let hasCurve = false;

  artifact.series.forEach((series, i) => {
    const color = PALETTE[i % PALETTE.length];
    if (series.type === "curve") {
      hasCurve = true;
      for (const segment of sampleCurve(
        series.expr,
        series.variable,
        CURVE_DOMAIN,
        CURVE_SAMPLES,
      )) {
        data.push({
          fnType: "points",
          points: segment,
          graphType: "polyline",
          color,
        });
        for (const [, y] of segment) ys.push(y);
      }
    } else if (series.type === "complex") {
      data.push({
        fnType: "vector",
        vector: [series.re, series.im],
        offset: [0, 0],
        graphType: "polyline",
        color,
      });
      data.push({
        fnType: "points",
        points: [[series.re, series.im]],
        graphType: "scatter",
        color,
      });
      xs.push(series.re, 0);
      ys.push(series.im, 0);
    } else {
      const x = series.coords[0] ?? 0;
      const y = series.coords[1] ?? 0;
      data.push({
        fnType: "points",
        points: [[x, y]],
        graphType: "scatter",
        color,
      });
      xs.push(x, 0);
      ys.push(y, 0);
    }
  });

  // Curves keep their fixed sampling window on x; everything else fits the data.
  const xDomain = hasCurve ? CURVE_DOMAIN : boundsOf(xs, CURVE_DOMAIN);
  const yDomain = boundsOf(ys, CURVE_DOMAIN);

  return {
    target,
    width,
    height: PLOT_HEIGHT,
    grid: true,
    xAxis: { domain: xDomain },
    yAxis: { domain: yDomain },
    tip: { xLine: true, yLine: true },
    data,
  };
}

// A single graph rendered below the editor. Explicit `draw(...)` graphs open
// expanded; suggested graphs (inferred from a graphable result) start as a 📈
// toggle the user can expand. Explicit graphs also offer a "＋ overlay" control
// that splices another series into the backing `draw(...)` call.
export function GraphArtifact({
  artifact,
  candidates = [],
  onOverlay,
}: {
  artifact: CellArtifact;
  candidates?: OverlayCandidate[];
  onOverlay?: (exprText: string) => void;
}) {
  const [expanded, setExpanded] = useState(artifact.source === "explicit");
  const [overlayOpen, setOverlayOpen] = useState(false);
  const [draft, setDraft] = useState("");
  const hostRef = useRef<HTMLDivElement>(null);
  // Read the latest artifact through a ref so the render effect can depend on a
  // content key (specKey) instead of the artifact's identity — the artifact gets
  // a fresh object every keystroke even when nothing it plots actually moved.
  const artifactRef = useRef(artifact);
  artifactRef.current = artifact;
  const specKey = useMemo(
    () => JSON.stringify(artifact.series),
    [artifact.series],
  );
  const caption = artifact.series.map((s) => s.label).join(", ");

  // Overlay is offered on explicit graphs: pick an existing graphable line to
  // splice in, or (for curve graphs) type a fresh curve. A numeric graph with
  // no compatible lines above it has nothing to add, so the control is hidden.
  const isCurve = plotDomain(artifact.series) === "curve";
  const canOverlay =
    artifact.source === "explicit" &&
    !!onOverlay &&
    (candidates.length > 0 || isCurve);
  const commitOverlay = (exprText: string) => {
    const text = exprText.trim();
    if (!text) return;
    onOverlay?.(text);
    setDraft("");
    setOverlayOpen(false);
  };

  useEffect(() => {
    if (!expanded) return;
    const host = hostRef.current;
    if (!host) return;

    const render = () => {
      if (!hostRef.current) return;
      host.innerHTML = "";
      try {
        functionPlot(
          buildOptions(host, artifactRef.current, host.clientWidth || 600),
        );
      } catch (e) {
        console.error("functionPlot failed", e);
        host.innerHTML = `<div class="nb2-graph-empty">Couldn't render this graph.</div>`;
      }
    };

    render();
    const onResize = debounce(render, 150);
    const observer = new ResizeObserver(() => onResize());
    observer.observe(host);
    return () => {
      observer.disconnect();
      onResize.cancel();
      host.innerHTML = "";
    };
  }, [expanded, specKey]);

  return (
    <div className={`nb2-graph nb2-graph-${artifact.source}`}>
      {artifact.source === "suggested" && (
        <button
          type="button"
          className="nb2-graph-toggle"
          onClick={() => setExpanded((v) => !v)}
          title={expanded ? "Hide graph" : "Plot this"}
        >
          <LineChart size={12} />
          <span>{expanded ? "Hide graph" : `Plot ${caption}`}</span>
        </button>
      )}
      {expanded && canOverlay && (
        <div className="nb2-graph-overlay">
          <button
            type="button"
            className="nb2-graph-overlay-btn"
            onClick={() => setOverlayOpen((v) => !v)}
            title="Overlay another series on this graph"
          >
            <Plus size={12} />
            <span>overlay</span>
          </button>
          {overlayOpen && (
            <div className="nb2-graph-overlay-panel">
              {candidates.map((c) => (
                <button
                  key={c.ref}
                  type="button"
                  className="nb2-graph-chip"
                  onClick={() => commitOverlay(c.ref)}
                  title={`Add ${c.label} (${c.ref})`}
                >
                  {c.label}
                </button>
              ))}
              {isCurve && (
                <input
                  className="nb2-graph-overlay-input"
                  placeholder="add curve, e.g. sin(x)"
                  value={draft}
                  onChange={(e) => setDraft(e.target.value)}
                  onKeyDown={(e) => {
                    if (e.key === "Enter") commitOverlay(draft);
                    else if (e.key === "Escape") setOverlayOpen(false);
                  }}
                  // biome-ignore lint/a11y/noAutofocus: focus the field the user just opened
                  autoFocus
                />
              )}
            </div>
          )}
        </div>
      )}
      {expanded && <div ref={hostRef} className="nb2-graph-host" />}
    </div>
  );
}

export default GraphArtifact;
