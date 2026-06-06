// Kind-aware editor decorations.
//
// Where `mathDecorations.ts` works off regex + the symbolic AST (powers, KaTeX),
// this plugin works off the *lexer*: it re-lexes each visible line, reconstructs
// each token's character span, and decorates by token **kind**. That gives us
// the semantic, position-aware styling that the per-token `StreamLanguage`
// highlighter can't express:
//
//   • quantity pill   — a number and its trailing unit(s) read as one entity
//   • IP pill         — IP addresses get a contiguous background
//   • variable bold   — identifiers defined anywhere in the doc (`name = …`),
//                       both at the definition and at every later usage
//   • glyph swaps     — arithmetic `*` → ×, `/` → ÷, `pi` → π (reveal-on-cursor,
//                       suppressed in unit context so `meter/second` stays raw)
//   • bracket depth   — nested parens cycle through colours
//   • colour swatch   — a clickable dot before each colour literal
//   • date trigger    — a clickable calendar glyph after each concrete date
//
// The clickable swatch / date glyphs don't open the picker themselves — the
// editor is plain CodeMirror. They dispatch a `hissab-token-interact`
// CustomEvent on `view.dom`; the React host (ExpressionsCell) listens and renders
// the popover, then writes the edit back via `HissabEditor.replaceRange`.

import type { Range } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  type ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { doLex, type TokenType } from "@rawbytes/hissab";

export const TOKEN_INTERACT_EVENT = "hissab-token-interact";

export interface TokenInteractionDetail {
  kind: "color" | "date";
  // Absolute document offsets of the token text to replace on commit.
  from: number;
  to: number;
  // The current token source (a CSS colour string, or a date expression).
  value: string;
  // Anchor for the popover, in viewport coordinates.
  rect: DOMRect;
}

export interface LexSpan {
  kind: string;
  from: number;
  to: number;
  text: string;
  token: TokenType;
}

// Re-lex `code` and reconstruct each token's absolute span by locating its
// `originalValue` (the verbatim source substring) from a moving cursor. Tokens
// that can't be located (odd whitespace, etc.) are skipped rather than guessed.
// Exported so the hover-tooltip extension can reuse the same span model.
export function lexSpans(code: string, base: number): LexSpan[] {
  let tokens: ReturnType<typeof doLex>;
  try {
    tokens = doLex(code, {}, 0);
  } catch {
    return []; // empty line / lex error — nothing to decorate
  }
  const spans: LexSpan[] = [];
  let cursor = 0;
  for (const tk of tokens) {
    const text = tk.originalValue;
    if (!text) continue;
    const idx = code.indexOf(text, cursor);
    if (idx === -1) continue;
    spans.push({
      kind: tk.kind,
      from: base + idx,
      to: base + idx + text.length,
      text,
      token: tk,
    });
    cursor = idx + text.length;
  }
  return spans;
}

// Identifiers (`name = …`) defined anywhere in the document. Used to bold both
// the definition and later usages. `(?!=)` skips `==`; comments are stripped so
// `// x = 1` doesn't register.
const ASSIGN_RE = /^\s*([A-Za-z_]\w*)\s*=(?!=)/;
function collectDefinedNames(doc: string): Set<string> {
  const names = new Set<string>();
  for (const raw of doc.split("\n")) {
    const code = stripComment(raw);
    const m = ASSIGN_RE.exec(code);
    if (m) names.add(m[1]);
  }
  return names;
}

function stripComment(line: string): string {
  const i = line.indexOf("//");
  return i === -1 ? line : line.slice(0, i);
}

const GLYPH: Record<string, string> = { "*": "×", "/": "÷", pi: "π" };

const BRACKET_DEPTH_CLASSES = 5;

// Identifier-ish kinds that can stand in for a user variable.
const IDENT_KINDS = new Set([
  "stringToken",
  "symbolToken",
  "undefinedToken",
  "VariableNameToken",
]);

const selectionTouches = (
  ranges: readonly { from: number; to: number }[],
  from: number,
  to: number,
): boolean => ranges.some((r) => r.from <= to && r.to >= from);

class GlyphWidget extends WidgetType {
  constructor(
    readonly glyph: string,
    readonly raw: string,
  ) {
    super();
  }
  eq(other: GlyphWidget) {
    return other.glyph === this.glyph && other.raw === this.raw;
  }
  toDOM() {
    const span = document.createElement("span");
    span.className = "cm-math-glyph";
    span.textContent = this.glyph;
    return span;
  }
  ignoreEvent() {
    return false;
  }
}

class InteractWidget extends WidgetType {
  constructor(
    readonly interactKind: "color" | "date",
    readonly from: number,
    readonly to: number,
    readonly value: string,
  ) {
    super();
  }
  eq(other: InteractWidget) {
    return (
      other.interactKind === this.interactKind &&
      other.from === this.from &&
      other.to === this.to &&
      other.value === this.value
    );
  }
  toDOM(view: EditorView) {
    const el = document.createElement("span");
    if (this.interactKind === "color") {
      el.className = "cm-color-swatch";
      el.style.backgroundColor = this.value;
      el.setAttribute("title", "Pick colour");
    } else {
      el.className = "cm-date-trigger";
      el.textContent = "📅";
      el.setAttribute("title", "Pick date & time");
    }
    el.setAttribute("aria-hidden", "true");
    el.addEventListener("mousedown", (e) => {
      // Don't move the caret / steal focus — just open the popover.
      e.preventDefault();
      e.stopPropagation();
      view.dom.dispatchEvent(
        new CustomEvent<TokenInteractionDetail>(TOKEN_INTERACT_EVENT, {
          bubbles: true,
          detail: {
            kind: this.interactKind,
            from: this.from,
            to: this.to,
            value: this.value,
            rect: el.getBoundingClientRect(),
          },
        }),
      );
    });
    return el;
  }
  ignoreEvent() {
    return false;
  }
}

class TokenDecorations {
  decorations: DecorationSet;
  atomic: DecorationSet;

  constructor(view: EditorView) {
    const built = this.build(view);
    this.decorations = built.all;
    this.atomic = built.atomic;
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.viewportChanged || update.selectionSet) {
      const built = this.build(update.view);
      this.decorations = built.all;
      this.atomic = built.atomic;
    }
  }

  private build(view: EditorView): {
    all: DecorationSet;
    atomic: DecorationSet;
  } {
    const all: Range<Decoration>[] = [];
    const atomic: Range<Decoration>[] = [];
    const { state } = view;
    const defined = collectDefinedNames(state.doc.toString());
    const selRanges = state.selection.ranges;

    for (const visible of view.visibleRanges) {
      let pos = visible.from;
      while (pos <= visible.to) {
        const line = state.doc.lineAt(pos);
        this.buildLine(line, defined, selRanges, all, atomic);
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
    defined: Set<string>,
    selRanges: readonly { from: number; to: number }[],
    all: Range<Decoration>[],
    atomic: Range<Decoration>[],
  ) {
    const code = stripComment(line.text);
    if (!code.trim()) return;
    const spans = lexSpans(code, line.from);
    if (spans.length === 0) return;

    let bracketDepth = 0;

    for (let i = 0; i < spans.length; i++) {
      const span = spans[i];

      // Quantity pill: a number immediately followed by its unit(s), including
      // compound units (`meter/second^2`, `N*meter`,
      // `newton*meter^2/kilogram^2`). Mirrors the engine's compound-unit
      // absorption: consecutive units, a trailing `*`/`/` + unit, and `^` +
      // integer exponent.
      if (span.kind === "numberToken" && spans[i + 1]?.kind === "unitToken") {
        let j = i + 1;
        for (;;) {
          const next = spans[j + 1];
          const after = spans[j + 2];
          if (next?.kind === "unitToken") {
            j += 1;
          } else if (
            next?.kind === "operatorToken" &&
            (next.text === "*" || next.text === "/") &&
            after?.kind === "unitToken"
          ) {
            j += 2;
          } else if (
            next?.kind === "operatorToken" &&
            next.text === "^" &&
            after?.kind === "numberToken"
          ) {
            j += 2;
          } else {
            break;
          }
        }
        all.push(
          Decoration.mark({ class: "cm-quantity" }).range(
            span.from,
            spans[j].to,
          ),
        );
        // Fall through so the number/units inside still get other treatment.
      }

      // IP pill.
      if (span.kind === "ipToken") {
        all.push(Decoration.mark({ class: "cm-ip" }).range(span.from, span.to));
      }

      // Variable bold (definitions + usages).
      if (IDENT_KINDS.has(span.kind) && defined.has(span.text)) {
        all.push(
          Decoration.mark({ class: "cm-variable" }).range(span.from, span.to),
        );
      }

      // Bracket depth colours.
      if (span.kind === "controllerToken" && span.text === "(") {
        const cls = `cm-bracket-d${bracketDepth % BRACKET_DEPTH_CLASSES}`;
        all.push(Decoration.mark({ class: cls }).range(span.from, span.to));
        bracketDepth++;
      } else if (span.kind === "controllerToken" && span.text === ")") {
        bracketDepth = Math.max(0, bracketDepth - 1);
        const cls = `cm-bracket-d${bracketDepth % BRACKET_DEPTH_CLASSES}`;
        all.push(Decoration.mark({ class: cls }).range(span.from, span.to));
      }

      // Glyph swaps (reveal raw when the caret touches the token).
      const isArithOp =
        span.kind === "operatorToken" &&
        (span.text === "*" || span.text === "/");
      const isPi = span.kind === "numberToken" && span.text === "pi";
      if (isArithOp || isPi) {
        const inUnitContext =
          isArithOp &&
          (spans[i - 1]?.kind === "unitToken" ||
            spans[i + 1]?.kind === "unitToken");
        if (
          !inUnitContext &&
          !selectionTouches(selRanges, span.from, span.to)
        ) {
          const deco = Decoration.replace({
            widget: new GlyphWidget(GLYPH[span.text], span.text),
          });
          const r = deco.range(span.from, span.to);
          all.push(r);
          atomic.push(r);
        }
      }

      // Colour swatch (a dot before the colour literal).
      if (span.kind === "colorToken") {
        all.push(
          Decoration.widget({
            widget: new InteractWidget("color", span.from, span.to, span.text),
            side: -1,
          }).range(span.from),
        );
      }

      // Seed literal (`@7f3a`): editor-managed plumbing for the entropy-drawing
      // functions. Hide it entirely (along with its leading `, `) so the call
      // reads cleanly; the hover tooltip on the function name surfaces the seed
      // and offers a re-roll. Atomic so the caret treats the hidden run as one
      // unit — it steps over it, and a selection still carries the seed so
      // copy/paste keeps the value reproducible.
      if (span.kind === "seedToken") {
        const prev = spans[i - 1];
        const hideFrom =
          prev?.kind === "controllerToken" && prev.text === ","
            ? prev.from
            : span.from;
        const r = Decoration.replace({}).range(hideFrom, span.to);
        all.push(r);
        atomic.push(r);
      }

      // Date trigger (after concrete dates only — skip relative operands like
      // `today` / `now` / `next week`, which carry no digits).
      if (span.kind === "dateToken" && /\d/.test(span.text)) {
        all.push(
          Decoration.widget({
            widget: new InteractWidget("date", span.from, span.to, span.text),
            side: 1,
          }).range(span.to),
        );
      }
    }
  }
}

export const tokenDecorations = ViewPlugin.fromClass(TokenDecorations, {
  decorations: (v) => v.decorations,
  provide: (plugin) =>
    EditorView.atomicRanges.of(
      (view) => view.plugin(plugin)?.atomic ?? Decoration.none,
    ),
});
