// Seed injection — the editor half of the "managed seed in source" design.
//
// Impure calls (`random(...)`, `uuid(...)`) are pure given a seed. This plugin
// watches the document and, once a call has parsed cleanly, appends a dimmed
// `@<seed>` argument so the result freezes (it no longer re-rolls on every
// keystroke) and the value travels with the saved text. It is the only place
// that *writes* a seed automatically; re-rolling is an explicit user action
// (the dice in tokenDecorations.ts).
//
// Two safeguards keep it from fighting the user:
//   • debounced — only runs after typing settles, and on cursor moves (so
//     leaving a call you were editing triggers the freeze).
//   • cursor-safe — never injects into a call the caret is currently inside.
// It is idempotent: a call that already carries a seed is skipped, so the
// docChange it produces doesn't loop.

import { type EditorView, ViewPlugin, type ViewUpdate } from "@codemirror/view";
import { debounce } from "lodash-es";
import { freshSeed, IMPURE_FUNCTIONS } from "./seedUtil.ts";
import { type LexSpan, lexSpans } from "./tokenDecorations.ts";

interface SeedEdit {
  from: number;
  insert: string;
}

function stripComment(line: string): string {
  const i = line.indexOf("//");
  return i === -1 ? line : line.slice(0, i);
}

// Find impure calls on one line that lack a seed and aren't under the caret,
// pushing one insertion (at the call's closing `)`) per such call.
function planLine(
  spans: LexSpan[],
  cursorInside: (from: number, to: number) => boolean,
  edits: SeedEdit[],
): void {
  for (let i = 0; i < spans.length; i++) {
    const fn = spans[i];
    if (fn.kind !== "functionToken" || !IMPURE_FUNCTIONS.has(fn.text)) continue;

    const open = spans[i + 1];
    if (!open || open.kind !== "controllerToken" || open.text !== "(") continue;

    // Walk to the matching close, noting a seed among *this* call's own args.
    let depth = 1;
    let hasSeed = false;
    let closeIdx = -1;
    for (let j = i + 2; j < spans.length; j++) {
      const s = spans[j];
      if (s.kind === "controllerToken" && s.text === "(") depth += 1;
      else if (s.kind === "controllerToken" && s.text === ")") {
        depth -= 1;
        if (depth === 0) {
          closeIdx = j;
          break;
        }
      } else if (depth === 1 && s.kind === "seedToken") hasSeed = true;
    }

    if (closeIdx === -1) continue; // unbalanced — call still being typed
    if (hasSeed) continue; // already frozen
    const close = spans[closeIdx];
    // Don't fight active edits: skip while the caret is within the argument
    // list `[open.to, close.from]` (where inserting before `)` would jump it).
    // A caret just after `)` is fine — it maps forward past the insertion — so
    // the freeze fires as soon as the caret leaves the parens.
    if (cursorInside(open.to, close.from)) continue;

    const empty = closeIdx === i + 2; // `(` immediately followed by `)`
    edits.push({
      from: close.from,
      insert: empty ? `@${freshSeed()}` : `, @${freshSeed()}`,
    });
  }
}

class SeedInjector {
  private readonly run: (view: EditorView) => void;

  constructor(view: EditorView) {
    this.run = debounce((v: EditorView) => SeedInjector.inject(v), 350);
    this.run(view);
  }

  update(update: ViewUpdate) {
    if (update.docChanged || update.selectionSet) this.run(update.view);
  }

  destroy() {
    (this.run as unknown as { cancel?: () => void }).cancel?.();
  }

  private static inject(view: EditorView) {
    const { state } = view;
    const cursorInside = (from: number, to: number) =>
      state.selection.ranges.some((r) => r.from <= to && r.to >= from);

    const edits: SeedEdit[] = [];
    for (let ln = 1; ln <= state.doc.lines; ln += 1) {
      const line = state.doc.line(ln);
      const code = stripComment(line.text);
      if (!code.includes("(")) continue;
      const spans = lexSpans(code, line.from);
      if (spans.length > 0) planLine(spans, cursorInside, edits);
    }
    if (edits.length === 0) return;

    edits.sort((a, b) => a.from - b.from);
    view.dispatch({
      changes: edits.map((e) => ({ from: e.from, insert: e.insert })),
    });
  }
}

export const seedInjection = ViewPlugin.fromClass(SeedInjector);
