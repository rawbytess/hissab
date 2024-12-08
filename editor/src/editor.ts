import { EditorState, Range, StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  highlightActiveLine,
  keymap,
  lineNumbers,
  placeholder,
  tooltips,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import { defaultKeymap, history, redo, undo } from "@codemirror/commands";
import {
  bracketMatching,
  HighlightStyle,
  syntaxHighlighting,
} from "@codemirror/language";
import { autocompletion, closeBrackets } from "@codemirror/autocomplete";

import { debounce } from "lodash";
import {
  doLex,
  doParse,
  TokenBaseType,
  tokenFactory,
  TokenType,
  Variables,
  ReportError,
} from "engine";

import { getStreamLanguage, HissabHighlightStyle, hissabTheme } from "./theme";
import autoComplete from "./autoComplete";

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

  undoEditor() {
    undo(this.view!);
  }

  redoEditor() {
    redo(this.view!);
  }

  private async calculateTotal(index: number, variables: Variables) {
    const tokens: TokenType[] = [];
    try {
      for (let i = 1; i < index; i++) {
        if (variables[`line${i}`]) {
          tokens.push(variables[`line${i}`]);
          tokens.push(tokenFactory("+", TokenBaseType.SYMBOL) as TokenType);
        }
      }
      tokens.pop();
      if (tokens.length === 0) return;
      const { resultToken } = await doParse(tokens);
      variables[`total${index}`] = resultToken;
    } catch {}
  }

  private calculatePrev(index: number, variables: Variables) {
    for (let i = index; i > 1; i--) {
      if (variables[`line${i - 1}`]) {
        variables[`prev${index}`] = variables[`line${i - 1}`];
        break;
      }
    }
  }

  getResult = async (state: EditorState) => {
    const data = state.doc.toString();
    const variables: Variables = {};
    const results: Results[] = [];
    const lines = data.split("\n");
    this.storePage(data);
    let ln = "";

    for (const [index, line] of lines.entries()) {
      try {
        [ln] = line.split("//");
        ln = ln.trim();
        await this.calculateTotal(index + 1, variables);
        this.calculatePrev(index + 1, variables);
        const tokens = doLex(ln, variables, index + 1);
        const { result, meta, resultToken } = await doParse(tokens, this.isPro);
        results.push({
          result,
          stale: false,
          lineNumber: index,
          error: false,
          errorMessage: null,
        });
        if (meta.variableName) variables[meta.variableName] = resultToken;
        variables[`line${index + 1}`] = resultToken;
        variables[`l${index + 1}`] = resultToken;
      } catch (e: any) {
        if (this.oldResults && this.oldResults[index] && ln.length)
          results.push({
            result: this.oldResults[index].result,
            error: true,
            errorMessage: e,
            stale: true,
            lineNumber: index,
          });
        else
          results.push({
            result: "",
            stale: true,
            lineNumber: index,
            error: true,
            errorMessage: e,
          });
      }
    }
    this.oldResults = results;
    return results;
  };

  async resultDOM(state: EditorState) {
    const resultWidgets: Range<Decoration>[] = [];
    const results = await this.getResult(state);
    results.forEach((res: Results, index: number) => {
      const deco = Decoration.widget({
        widget: new ResultWidget(res, this.isPro),
        side: 1,
        block: false,
      });
      const { to } = state.doc.line(index + 1);
      resultWidgets.push(deco.range(to));
    });
    return Decoration.set(resultWidgets);
  }

  destroy() {
    this.view?.destroy();
  }

  async init() {
    const page = "";
    const resultDOMBind = this.resultDOM.bind(this);

    const resultPlugin = StateField.define({
      create() {
        return Decoration.none;
      },
      update(value, tr) {
        for (const effect of tr.effects) {
          if (effect.is(stateEffect)) {
            value = effect.value?.decorations;
          }
        }
        return value;
      },
      provide(f) {
        return EditorView.decorations.from(f);
      },
    });
    let stateEffect = StateEffect.define<{ decorations: DecorationSet }>({});
    const viewPlugin = ViewPlugin.define(() => {
      return {
        update(update) {
          if (update.state.doc.toString() === update.startState.doc.toString())
            return;
          resultDOMBind(update.state).then((deco) => {
            update.view.dispatch({
              effects: stateEffect.of({
                decorations: deco,
              }),
            });
          });
        },
      };
    });

    const extensions = [
      lineNumbers(),
      history(),
      bracketMatching(),
      closeBrackets(),
      highlightActiveLine(),
      placeholder(" Type your expressions here..."),
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
        if (v.docChanged) this.view = v.view;
      }),
      EditorView.focusChangeEffect.of((_, focusing) => {
        if (this.setFocus) this.setFocus(focusing);
        return StateEffect.define(undefined).of(null);
      }),
      viewPlugin,
      resultPlugin,
      EditorView.editable.of(this.isWritable),
    ];

    if (this.isPro) {
      const proExtensions = [
        tooltips({
          position: "absolute",
          parent: this.parent.parentNode as HTMLElement,
        }),
        autocompletion({
          override: [autoComplete],
          closeOnBlur: false,
          tooltipClass: () => "autocomplete-position",
        }),
      ];

      extensions.push(...proExtensions);
    }

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

interface Results {
  result: string;
  error: boolean;
  errorMessage: ReportError | null;
  stale: boolean;
  lineNumber: number;
}

const copiedDiv = document.createElement("div");
copiedDiv.innerText = "Copied!";
copiedDiv.className = "copied-div";

class ResultWidget extends WidgetType {
  constructor(
    readonly result: Results,
    readonly pro: boolean,
  ) {
    super();
    this.result = result;
    this.pro = pro;
  }

  toDOM() {
    const wrap = document.createElement("span");
    wrap.addEventListener("dblclick", async (e) => {
      e.preventDefault();
      await navigator.clipboard.writeText(wrap.innerText);
      window.getSelection()?.removeAllRanges();
      wrap.appendChild(copiedDiv);
      setTimeout(() => {
        wrap.removeChild(copiedDiv);
      }, 1000);
    });
    wrap.setAttribute("aria-hidden", "true");
    wrap.setAttribute("id", `result-element-${this.result.lineNumber}`);

    wrap.className = this.result.stale
      ? "cm-result cm-result-stale"
      : "cm-result cm-result-fresh";
    wrap.innerText = this.result.result;
    if (
      this.pro &&
      this.result.error &&
      this.result.errorMessage?.name === "ReportError"
    ) {
      const errorSpan = document.createElement("span");
      errorSpan.setAttribute("id", `result-error-${this.result.lineNumber}`);
      wrap.appendChild(errorSpan);
      errorSpan.innerHTML = "<img src='../resources/caution.png' alt='error'/>";
      errorSpan.className = "error-span";

      const errortip = document.createElement("span");
      errortip.setAttribute("id", `result-tip-${this.result.lineNumber}`);
      errorSpan.appendChild(errortip);
      errortip.innerText = this.result.errorMessage.message;
      errortip.className = "error-tip";
    }
    return wrap;
  }

  ignoreEvent() {
    return true;
  }
}
export type { HissabEditor as HissabEditorType, hissabEditorIf };
