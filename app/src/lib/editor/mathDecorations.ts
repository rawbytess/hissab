// Inline math rendering for the editor.
//
// Two tiers of CodeMirror decorations turn Hissab's textual math into something
// closer to how it reads on paper, without giving up editability:
//
//   Tier 1 (always on, edit in place): `^` / `**` powers become superscripts.
//   These are *mark* decorations — the real characters stay in the document, so
//   the caret walks them and editing is unaffected. (Single-token glyph swaps
//   like `*`→× and `pi`→π are kind-aware and live in `tokenDecorations.ts`.)
//
//   Tier 2 (reveal-on-cursor): `derivative()`/`diff()`, `integrate()`/`integral()`,
//   `limit()` render as full 2-D KaTeX widgets. The moment the caret enters that
//   line the widgets disappear and raw editable source is shown (the
//   Obsidian/Typora live-preview model). 2-D layout can't be edited in place, so
//   we swap back to text instead.
//
// The KaTeX path needs the engine's symbolic AST, and `doParse` is async, so
// LaTeX is produced off the render path, memoised, and a tiny effect nudges a
// rebuild when it resolves (mirroring how the result widget already works).

import { type Range, StateEffect } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { doLex, doParse, type ExprToken, exprToLatex } from "@rawbytes/hissab";
import katex from "katex";
import { LRUCache } from "lru-cache";
import "katex/dist/katex.min.css";

// Tier-2 constructs: a function name whose whole `name(...)` call we render as a
// single KaTeX block (when symbolic).
const TIER2_NAMES = "derivative|diff|integrate|integral|limit";
const TIER2_RE = new RegExp(`\\b(${TIER2_NAMES})\\s*\\(`, "g");

// Powers: `^` or `**` followed by an exponent.
const POWER_RE = /\*\*|\^/g;
const EXP_WORD_RE = /^[A-Za-z0-9_.]+/;

// substring → { latex: string | null }. `latex: null` means parsed but not
// symbolic / failed; a `.get()` of `undefined` means "not parsed yet". (LRUCache
// values must be non-nullable, hence the wrapper object.)
const latexCache = new LRUCache<string, { latex: string | null }>({ max: 500 });
const pending = new Set<string>();

// Nudges the plugin to rebuild once an async parse resolves.
const mathReadyEffect = StateEffect.define<null>();

async function parseToLatex(sub: string): Promise<string | null> {
  try {
    const { resultToken } = await doParse(doLex(sub, {}, 0));
    if (resultToken?.kind === "exprToken") {
      // Render the captured *input* notation (∫, d/dx) when present — the engine
      // now computes calculus, so `.expr` is the answer and `.source` is the
      // pre-evaluation form. The computed answer is shown by the result widget.
      const t = resultToken as ExprToken;
      return exprToLatex(t.source ?? t.expr);
    }
    return null;
  } catch {
    return null;
  }
}

interface Span {
  from: number;
  to: number;
}

const within = (i: number, spans: Span[]): boolean =>
  spans.some((s) => i >= s.from && i < s.to);

// Scan `code` for balanced `name(...)` Tier-2 calls. Offsets are relative to
// `code`. Nested calls are subsumed by the outer match (we skip past its close).
function findTier2Calls(code: string): Span[] {
  const out: Span[] = [];
  TIER2_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
  while ((m = TIER2_RE.exec(code))) {
    const start = m.index;
    let depth = 0;
    let end = -1;
    for (let i = m.index + m[0].length - 1; i < code.length; i++) {
      if (code[i] === "(") depth++;
      else if (code[i] === ")") {
        depth--;
        if (depth === 0) {
          end = i + 1;
          break;
        }
      }
    }
    if (end === -1) continue; // unbalanced — still being typed
    out.push({ from: start, to: end });
    TIER2_RE.lastIndex = end;
  }
  return out;
}

// Index of the `)` that closes the `(` at `open`, or -1 if unbalanced.
function matchParen(code: string, open: number): number {
  let depth = 0;
  for (let i = open; i < code.length; i++) {
    if (code[i] === "(") depth++;
    else if (code[i] === ")" && --depth === 0) return i;
  }
  return -1;
}

// Scan for power operators and the exponent that follows. Returns the operator
// span (the `^`/`**`) and the exponent span.
//
// A *parenthesised* exponent (`5^(3*1/2)`) is superscripted as a whole group —
// the parens are the natural way to put a multi-term expression "on top", and
// the engine needs them too (`5^3*1/2` is `(5^3)*1/2`). While the group is still
// being typed and the `)` isn't there yet, we keep it superscripted live up to a
// double space (the user's "break out") or end of line, so the styling doesn't
// vanish the moment a second character is typed. A *bare* exponent is the
// immediate atom (`x^2`, `2^n`).
function findPowers(code: string): Array<{ op: Span; exp: Span }> {
  const out: Array<{ op: Span; exp: Span }> = [];
  POWER_RE.lastIndex = 0;
  let m: RegExpExecArray | null;
  // biome-ignore lint/suspicious/noAssignInExpressions: standard regex exec loop
  while ((m = POWER_RE.exec(code))) {
    const opFrom = m.index;
    const opTo = m.index + m[0].length;
    if (opTo >= code.length) continue;
    let expTo: number;
    if (code[opTo] === "(") {
      const close = matchParen(code, opTo);
      if (close !== -1) {
        expTo = close + 1; // balanced group, parens included
      } else {
        // Unbalanced — still being typed. Superscript live until a double space
        // or end of line.
        const dbl = code.indexOf("  ", opTo);
        expTo = dbl === -1 ? code.length : dbl;
      }
    } else {
      const mm = EXP_WORD_RE.exec(code.slice(opTo));
      if (!mm) continue;
      expTo = opTo + mm[0].length;
    }
    if (expTo <= opTo) continue;
    out.push({
      op: { from: opFrom, to: opTo },
      exp: { from: opTo, to: expTo },
    });
    POWER_RE.lastIndex = expTo;
  }
  return out;
}

class KatexWidget extends WidgetType {
  constructor(
    readonly latex: string,
    readonly raw: string,
  ) {
    super();
  }
  eq(other: KatexWidget) {
    return other.latex === this.latex;
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-math-katex";
    try {
      span.innerHTML = katex.renderToString(this.latex, {
        throwOnError: false,
        displayMode: false,
      });
    } catch {
      span.textContent = this.raw;
    }
    span.setAttribute("aria-hidden", "true");
    return span;
  }
  ignoreEvent() {
    // Let clicks through so the editor moves the caret onto the line (revealing
    // the raw source for editing).
    return false;
  }
}

class MathDecorations {
  decorations: DecorationSet;
  atomic: DecorationSet;
  private destroyed = false;

  constructor(readonly view: EditorView) {
    const built = this.build(view);
    this.decorations = built.all;
    this.atomic = built.atomic;
  }

  update(update: ViewUpdate) {
    const ready = update.transactions.some((tr) =>
      tr.effects.some((e) => e.is(mathReadyEffect)),
    );
    if (
      update.docChanged ||
      update.viewportChanged ||
      update.selectionSet ||
      ready
    ) {
      const built = this.build(update.view);
      this.decorations = built.all;
      this.atomic = built.atomic;
    }
  }

  destroy() {
    this.destroyed = true;
  }

  // Resolve LaTeX for a Tier-2 substring, scheduling an async parse on a miss and
  // returning null until it lands.
  private latexFor(sub: string): string | null {
    const cached = latexCache.get(sub);
    if (cached !== undefined) return cached.latex;
    if (!pending.has(sub)) {
      pending.add(sub);
      parseToLatex(sub).then((latex) => {
        latexCache.set(sub, { latex });
        pending.delete(sub);
        if (!this.destroyed) {
          try {
            this.view.dispatch({ effects: mathReadyEffect.of(null) });
          } catch {
            // view torn down between resolve and dispatch — ignore
          }
        }
      });
    }
    return null;
  }

  private build(view: EditorView): {
    all: DecorationSet;
    atomic: DecorationSet;
  } {
    const all: Range<Decoration>[] = [];
    const atomic: Range<Decoration>[] = [];
    const { state } = view;
    const sel = state.selection;

    for (const visible of view.visibleRanges) {
      let pos = visible.from;
      while (pos <= visible.to) {
        const line = state.doc.lineAt(pos);
        this.buildLine(line, sel.ranges, all, atomic);
        pos = line.to + 1;
      }
    }

    return {
      all: Decoration.set(all, true),
      atomic: Decoration.set(atomic, true),
    };
  }

  private buildLine(
    line: { from: number; to: number; text: string },
    selRanges: readonly { from: number; to: number }[],
    all: Range<Decoration>[],
    atomic: Range<Decoration>[],
  ) {
    const commentIdx = line.text.indexOf("//");
    const code = commentIdx === -1 ? line.text : line.text.slice(0, commentIdx);
    if (!code) return;
    const base = line.from;
    const cursorOnLine = selRanges.some(
      (r) => r.from <= line.to && r.to >= line.from,
    );

    // Tier 2: KaTeX blocks (only when this line isn't being edited).
    const covered: Span[] = [];
    if (!cursorOnLine) {
      for (const call of findTier2Calls(code)) {
        const sub = code.slice(call.from, call.to);
        const latex = this.latexFor(sub);
        if (latex == null) continue; // not symbolic / not ready
        const deco = Decoration.replace({
          widget: new KatexWidget(latex, sub),
        });
        const r = deco.range(base + call.from, base + call.to);
        all.push(r);
        atomic.push(r);
        covered.push(call);
      }
    }

    // Tier 1: superscripts (always on; they stay editable in place).
    for (const { op, exp } of findPowers(code)) {
      if (within(op.from, covered)) continue;
      all.push(
        Decoration.mark({ class: "cm-sup-caret" }).range(
          base + op.from,
          base + op.to,
        ),
      );
      all.push(
        Decoration.mark({ class: "cm-sup" }).range(
          base + exp.from,
          base + exp.to,
        ),
      );
    }
  }
}

export const mathDecorations = ViewPlugin.fromClass(MathDecorations, {
  decorations: (v) => v.decorations,
  provide: (plugin) =>
    EditorView.atomicRanges.of(
      (view) => view.plugin(plugin)?.atomic ?? Decoration.none,
    ),
});
