import { closeBrackets } from "@codemirror/autocomplete";
import { defaultKeymap, history, redo, undo } from "@codemirror/commands";
import {
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { EditorState, StateEffect } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  placeholder,
} from "@codemirror/view";
import { debounce } from "lodash-es";
import { hissabTheme } from "@/lib/editor/cmTheme.ts";
import type { Results } from "@/lib/editor/getResults.ts";
import { hissabHoverTooltip } from "@/lib/editor/hoverTooltip.ts";
import { mathDecorations } from "@/lib/editor/mathDecorations.ts";
import {
  getResultExtension,
  resultStateField,
} from "@/lib/editor/resultWidget.ts";
import { tokenDecorations } from "@/lib/editor/tokenDecorations.ts";
import {
  getStreamLanguage,
  HissabHighlightStyle,
} from "./syntaxHighlighting.ts";

interface hissabEditorIf {
  currentPage: string;
  storePage: (content: string) => void;
  retrievePage?: null | string;
  isWritable?: boolean;
  isDark?: boolean;
  setFocus?: (focus: boolean) => object | undefined;
  editorBackground?: string;
  borderRadius?: string;
  innerPadding?: string;
}

type ReplaceDocumentOptions = {
  focus?: boolean;
  resetResults?: boolean;
};

export default class HissabEditor {
  private parent: Element | ShadowRoot;

  private currentPage: string;

  private storePage: (content: string) => void;

  private retrievePage: string | null;

  private setFocus: null | ((focus: boolean) => object | undefined);

  private isDark: boolean;

  private isWritable: boolean;

  private editorBackground: string;

  private borderRadius: string;

  private innerPadding: string;

  private oldResults: Results[];

  private view: EditorView | null;

  constructor(parent: Element | ShadowRoot, options: hissabEditorIf) {
    this.parent = parent;
    this.currentPage = options.currentPage;
    this.storePage = options.storePage;
    this.retrievePage = options.retrievePage ?? null;
    this.setFocus = options.setFocus ?? null;
    this.isDark = options.isDark ?? true;
    this.isWritable = options.isWritable ?? true;
    this.editorBackground = options.editorBackground ?? "#1c1c1c";
    this.borderRadius = options.borderRadius ?? "none";
    this.innerPadding = options.innerPadding ?? "0px";

    this.oldResults = [];
    this.view = null;

    this.clearEditor = this.clearEditor.bind(this);
    this.focusEditor = this.focusEditor.bind(this);
    this.updateEditor = this.updateEditor.bind(this);
    this.replaceDocument = this.replaceDocument.bind(this);
    this.getText = this.getText.bind(this);
    this.insertString = this.insertString.bind(this);
    this.undoEditor = this.undoEditor.bind(this);
    this.redoEditor = this.redoEditor.bind(this);
    this.hasFocus = this.hasFocus.bind(this);
    this.appendText = this.appendText.bind(this);
    this.insertTextinLine = this.insertTextinLine.bind(this);
    this.getPositionofLastLine = this.getPositionofLastLine.bind(this);
    this.replaceRange = this.replaceRange.bind(this);
  }

  focusEditor() {
    if (this.setFocus) this.setFocus(true);
    this.view?.focus();
  }

  hasFocus() {
    return this.view?.hasFocus;
  }

  clearEditor() {
    this.replaceDocument("");
  }

  getText() {
    return this.view?.state.doc.toString() ?? "";
  }

  replaceDocument(text: string, options: ReplaceDocumentOptions = {}) {
    const transaction = this.view?.state.update({
      changes: {
        from: 0,
        to: this.view?.state?.doc.length,
        insert: text,
      },
    });

    if (transaction) {
      this.view?.dispatch(transaction);
      if (options.focus ?? true) this.focusEditor();
      if (options.resetResults ?? true) this.oldResults = [];
    }
  }

  updateEditor(text: string) {
    this.replaceDocument(text);
  }

  insertString(text: string) {
    const cursor = this.view?.state.selection.main.head || 0;
    const transaction = this.view?.state.update({
      changes: {
        from: cursor,
        insert: text,
      },
      selection: { anchor: cursor + text.length },
      scrollIntoView: true,
    });

    if (transaction) {
      this.view?.dispatch(transaction);
      this.focusEditor();
    }
  }

  getPositionofLastLine() {
    if (!this.view) return 0;
    const lastLine = this.view.state.doc.lines;
    return this.view.state.doc.line(lastLine).from;
  }

  insertTextinLine(text: string, line: number) {
    if (!this.view) return;
    const targetLine = Math.max(1, Math.min(line, this.view.state.doc.lines));
    const { from } = this.view.state.doc.line(targetLine);
    const transaction = this.view.state.update({
      changes: {
        from,
        insert: `${text}\n`,
      },
      selection: { anchor: from + text.length },
      scrollIntoView: true,
    });
    this.view.dispatch(transaction);
    this.focusEditor();
  }

  appendText(text: string) {
    if (!this.view) return;
    const separator = this.view.state.doc.length > 0 ? "\n" : "";
    const transaction = this.view?.state.update({
      changes: {
        from: this.view?.state.doc.length,
        insert: `${separator}${text}`,
      },
    });

    if (transaction) {
      this.view?.dispatch(transaction);
      this.focusEditor();
    }
  }

  replaceLineRange(fromLine: number, toLine: number, text: string) {
    if (!this.view) return;
    const doc = this.view.state.doc;
    const startLine = Math.max(1, Math.min(fromLine, doc.lines));
    const endLine = Math.max(startLine, Math.min(toLine, doc.lines));
    const from = doc.line(startLine).from;
    const to = doc.line(endLine).to;
    const transaction = this.view.state.update({
      changes: { from, to, insert: text },
      selection: { anchor: from + text.length },
      scrollIntoView: true,
    });
    this.view.dispatch(transaction);
    this.focusEditor();
  }

  // Replace an absolute character range with new text. Used by the editor's
  // interactive popovers (colour / date pickers) to write a picked value back
  // into the document. Offsets are clamped to the current doc length so a stale
  // range (doc edited while the popover was open) can't throw.
  replaceRange(from: number, to: number, text: string) {
    if (!this.view) return;
    const docLen = this.view.state.doc.length;
    const f = Math.max(0, Math.min(from, docLen));
    const t = Math.max(f, Math.min(to, docLen));
    const transaction = this.view.state.update({
      changes: { from: f, to: t, insert: text },
      selection: { anchor: f + text.length },
      scrollIntoView: true,
    });
    this.view.dispatch(transaction);
    this.focusEditor();
  }

  deleteLineRange(fromLine: number, toLine: number) {
    if (!this.view) return;
    const doc = this.view.state.doc;
    const startLine = Math.max(1, Math.min(fromLine, doc.lines));
    const endLine = Math.max(startLine, Math.min(toLine, doc.lines));
    const from = doc.line(startLine).from;
    const to =
      endLine < doc.lines ? doc.line(endLine + 1).from : doc.line(endLine).to;
    const transaction = this.view.state.update({
      changes: { from, to, insert: "" },
      selection: { anchor: from },
      scrollIntoView: true,
    });
    this.view.dispatch(transaction);
    this.focusEditor();
  }

  undoEditor() {
    if (this.view) undo(this.view);
  }

  redoEditor() {
    if (this.view) redo(this.view);
  }

  destroy() {
    this.view?.destroy();
  }

  async init() {
    const page = this.retrievePage ?? "";
    const resultViewPlugin = await getResultExtension(
      this.storePage,
      this.oldResults,
    );
    const undoRedoKeymap = keymap.of([
      {
        key: "Mod-z",
        preventDefault: true,
        run: undo,
      },
      {
        key: "Mod-y",
        preventDefault: true,
        run: redo,
      },
      {
        key: "Mod-Shift-z",
        preventDefault: true,
        run: redo,
      },
    ]);

    const extensions = [
      lineNumbers(),
      history(),
      bracketMatching(),
      closeBrackets(),
      highlightActiveLine(),
      placeholder("Type your expressions here..."),
      keymap.of(defaultKeymap),
      syntaxHighlighting(
        HighlightStyle.define(HissabHighlightStyle(this.isDark)),
      ),
      mathDecorations,
      tokenDecorations,
      hissabHoverTooltip,
      EditorView.theme(
        hissabTheme(
          this.isDark,
          this.editorBackground,
          this.borderRadius,
          this.innerPadding,
        ),
      ),
      EditorView.lineWrapping,
      getStreamLanguage(),
      EditorView.updateListener.of((v) => {
        if (v.docChanged) {
          this.view = v.view;
        }
      }),
      EditorView.focusChangeEffect.of((_, focusing) => {
        if (this.setFocus) this.setFocus(focusing);
        return StateEffect.define(undefined).of(null);
      }),
      resultViewPlugin,
      resultStateField,
      EditorView.editable.of(this.isWritable),
      undoRedoKeymap,
    ];

    if (this.storePage) debounce(this.storePage, 2000);

    const state = EditorState.create({
      doc: page ?? "",
      extensions,
    });

    this.view = new EditorView({
      state,
      parent: this.parent,
    });
  }
}

export type { HissabEditor as HissabEditorType, hissabEditorIf };
