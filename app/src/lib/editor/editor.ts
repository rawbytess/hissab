import { EditorState, StateEffect } from "@codemirror/state";
import {
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  placeholder,
} from "@codemirror/view";
import { prompt } from "./promptWidget";
import { defaultKeymap, history, redo, undo } from "@codemirror/commands";
import {
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { closeBrackets } from "@codemirror/autocomplete";

import pkg from "lodash";

import {
  getStreamLanguage,
  HissabHighlightStyle,
} from "./syntaxHighlighting.ts";
import {
  getResultExtension,
  resultStateField,
} from "@/lib/editor/resultWidget.ts";
import { Results } from "@/lib/editor/getResults.ts";
import { hissabTheme } from "@/lib/editor/cmTheme.ts";

const { debounce } = pkg;

interface hissabEditorIf {
  currentPage: string;
  storePage: (content: string) => void;
  retrievePage?: null | string;
  isWritable?: boolean;
  isDark?: boolean;
  isPro?: boolean;
  setFocus?: any;
  editorBackground?: string;
  borderRadius?: string;
  innerPadding?: string;
}

export default class HissabEditor {
  private parent: Element | ShadowRoot;

  private currentPage: string;

  private storePage: (content: string) => void;

  private retrievePage: string | null;

  private setFocus: null | ((focus: boolean) => object);

  private isDark: boolean;

  private isWritable: boolean;

  private editorBackground: string;

  private borderRadius: string;

  private innerPadding: string;

  private isPro: boolean;

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
    this.isPro = options.isPro ?? false;
    this.editorBackground = options.editorBackground ?? "#1c1c1c";
    this.borderRadius = options.borderRadius ?? "none";
    this.innerPadding = options.innerPadding ?? "0px";

    this.oldResults = [];
    this.view = null;

    this.clearEditor = this.clearEditor.bind(this);
    this.focusEditor = this.focusEditor.bind(this);
    this.updateEditor = this.updateEditor.bind(this);
    this.insertString = this.insertString.bind(this);
    this.undoEditor = this.undoEditor.bind(this);
    this.redoEditor = this.redoEditor.bind(this);
    this.hasFocus = this.hasFocus.bind(this);
    this.appendText = this.appendText.bind(this);
    this.insertTextinLine = this.insertTextinLine.bind(this);
    this.getPositionofLastLine = this.getPositionofLastLine.bind(this);
  }

  focusEditor() {
    if (this.setFocus) this.setFocus(true);
    this.view?.focus();
  }

  hasFocus() {
    return this.view?.hasFocus;
  }

  clearEditor() {
    const transaction = this.view?.state.update({
      changes: {
        from: 0,
        to: this.view?.state?.doc.length,
        insert: "",
      },
    });

    if (transaction) {
      this.view?.dispatch(transaction);
      this.focusEditor();
      this.oldResults = [];
    }
  }

  updateEditor(text: string) {
    const transaction = this.view?.state.update({
      changes: {
        from: 0,
        to: this.view?.state?.doc.length,
        insert: text,
      },
    });

    if (transaction) {
      this.view?.dispatch(transaction);
      this.focusEditor();
      this.oldResults = [];
    }
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
    const doc = this.view!.state.doc.toString();
    const docArray = doc.split("\n");
    const newDocArray = [
      ...docArray.slice(0, line),
      text,
      ...docArray.slice(line + 1),
    ];
    // this.updateEditor(newDocArray.join("\n"));
  }

  appendText(text: string) {
    const transaction = this.view?.state.update({
      changes: {
        from: this.view?.state.doc.length,
        insert: "\n" + text,
      },
    });

    if (transaction) {
      this.view?.dispatch(transaction);
      this.focusEditor();
    }
  }

  undoEditor() {
    undo(this.view!);
  }

  redoEditor() {
    redo(this.view!);
  }

  destroy() {
    this.view?.destroy();
  }

  async init() {
    const page = "";
    const resultViewPlugin = await getResultExtension(
      this.storePage,
      this.oldResults,
      this.isPro,
    );

    const extensions = [
      lineNumbers(),
      history(),
      bracketMatching(),
      closeBrackets(),
      highlightActiveLine(),
      placeholder(" Type your expressions here..."),
      prompt,
      keymap.of(defaultKeymap),
      syntaxHighlighting(
        HighlightStyle.define(HissabHighlightStyle(this.isDark)),
      ),
      EditorView.theme(
        hissabTheme(
          this.isDark,
          this.editorBackground,
          this.borderRadius,
          this.innerPadding,
        ),
      ),
      EditorView.lineWrapping,
      getStreamLanguage(this),
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
