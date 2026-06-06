// Hover tooltips that name the token under the cursor.
//
// Reuses the same lexer-derived spans as `tokenDecorations.ts`, so hovering
// `miles` shows "miles → length unit", `avg` shows "avg → function", etc. This
// is discoverability help: it tells you how Hissab *understood* a token.
//
// For the entropy-drawing functions (`random`, `uuid`) it does double duty: the
// seed that pins their value is hidden in the editor (see tokenDecorations.ts),
// so hovering the function name is where you *see* the seed and re-roll it.

import { hoverTooltip } from "@codemirror/view";
import { UnitTypes } from "@rawbytes/hissab";
import { freshSeed, IMPURE_FUNCTIONS } from "@/lib/editor/seedUtil.ts";
import { type LexSpan, lexSpans } from "@/lib/editor/tokenDecorations.ts";

const KIND_LABEL: Record<string, string> = {
  numberToken: "number",
  dateToken: "date / time",
  colorToken: "colour",
  ipToken: "IP address",
  booleanToken: "boolean",
  functionToken: "function",
  textToken: "text",
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

// Find the hidden `@seed` arg belonging to the impure call whose function token
// is at `fnIndex` (scanning to the matching close paren). Null if not seeded yet.
function findCallSeed(spans: LexSpan[], fnIndex: number): LexSpan | null {
  const open = spans[fnIndex + 1];
  if (!open || open.kind !== "controllerToken" || open.text !== "(")
    return null;
  let depth = 1;
  for (let j = fnIndex + 2; j < spans.length; j++) {
    const s = spans[j];
    if (s.kind === "controllerToken" && s.text === "(") depth += 1;
    else if (s.kind === "controllerToken" && s.text === ")") {
      depth -= 1;
      if (depth === 0) return null;
    } else if (depth === 1 && s.kind === "seedToken") return s;
  }
  return null;
}

export const hissabHoverTooltip = hoverTooltip((view, pos) => {
  const line = view.state.doc.lineAt(pos);
  const commentIdx = line.text.indexOf("//");
  const code = commentIdx === -1 ? line.text : line.text.slice(0, commentIdx);
  if (!code.trim()) return null;

  const spans = lexSpans(code, line.from);
  const idx = spans.findIndex((s) => pos >= s.from && pos <= s.to);
  if (idx === -1) return null;
  const span = spans[idx];

  // Impure call: reveal the hidden seed and host the re-roll on the tooltip.
  if (span.kind === "functionToken" && IMPURE_FUNCTIONS.has(span.text)) {
    const seed = findCallSeed(spans, idx);
    return {
      pos: span.from,
      end: span.to,
      above: true,
      create() {
        const dom = document.createElement("div");
        dom.className = "cm-hover-type cm-seed-hover";
        const label = document.createElement("span");
        label.textContent = seed
          ? `${span.text} → function · seed ${seed.text.replace(/^@/, "")}`
          : `${span.text} → function`;
        dom.appendChild(label);
        if (seed) {
          const btn = document.createElement("button");
          btn.type = "button";
          btn.className = "cm-seed-reroll";
          btn.textContent = "🎲 re-roll";
          btn.setAttribute("title", "Generate a new value");
          // mousedown would blur the editor and close the tooltip before the
          // click lands; suppress it and act on click.
          btn.addEventListener("mousedown", (e) => e.preventDefault());
          btn.addEventListener("click", (e) => {
            e.preventDefault();
            e.stopPropagation();
            view.dispatch({
              changes: {
                from: seed.from,
                to: seed.to,
                insert: `@${freshSeed()}`,
              },
            });
          });
          dom.appendChild(btn);
        }
        return { dom };
      },
    };
  }

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
