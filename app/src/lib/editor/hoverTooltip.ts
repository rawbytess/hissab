// Hover tooltips that name the token under the cursor.
//
// Reuses the same lexer-derived spans as `tokenDecorations.ts`, so hovering
// `miles` shows "miles → length unit", `avg` shows "avg → function", etc. This
// is discoverability help: it tells you how Hissab *understood* a token.

import { hoverTooltip } from "@codemirror/view";
import { UnitTypes } from "@rawbytes/hissab";
import { type LexSpan, lexSpans } from "@/lib/editor/tokenDecorations.ts";

const KIND_LABEL: Record<string, string> = {
  numberToken: "number",
  dateToken: "date / time",
  colorToken: "colour",
  ipToken: "IP address",
  booleanToken: "boolean",
  functionToken: "function",
  operatorToken: "operator",
  symbolToken: "symbol (free variable)",
  complexToken: "complex number",
  pointToken: "point",
  fractionToken: "fraction",
  variableToken: "variable",
  VariableNameToken: "variable (definition)",
};

// Numeric `UnitTypes` enum value → a human label. POSTFIX covers SI prefixes and
// word multipliers (`kilo`, `million`), so call it a prefix/multiplier.
function unitTypeLabel(type: unknown): string {
  if (typeof type !== "number") return "unit";
  if (type === UnitTypes.POSTFIX) return "prefix / multiplier";
  if (type === UnitTypes.CITY) return "timezone";
  if (type === UnitTypes.CURRENCY) return "currency";
  const name = UnitTypes[type];
  if (!name) return "unit";
  return `${name.toLowerCase().replace(/_/g, " ")} unit`;
}

function describe(span: LexSpan): string | null {
  if (span.kind === "unitToken") {
    const type = (span.token as { unitdata?: { type?: unknown } }).unitdata
      ?.type;
    return `${span.text} → ${unitTypeLabel(type)}`;
  }
  const label = KIND_LABEL[span.kind];
  if (!label) return null;
  return `${span.text} → ${label}`;
}

export const hissabHoverTooltip = hoverTooltip((view, pos) => {
  const line = view.state.doc.lineAt(pos);
  const commentIdx = line.text.indexOf("//");
  const code = commentIdx === -1 ? line.text : line.text.slice(0, commentIdx);
  if (!code.trim()) return null;

  const spans = lexSpans(code, line.from);
  const span = spans.find((s) => pos >= s.from && pos <= s.to);
  if (!span) return null;

  const text = describe(span);
  if (!text) return null;

  return {
    pos: span.from,
    end: span.to,
    above: true,
    create() {
      const dom = document.createElement("div");
      dom.className = "cm-hover-type";
      dom.textContent = text;
      return { dom };
    },
  };
});
