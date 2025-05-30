import {
  Decoration,
  DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";
import { aicache } from "@/lib/cache.ts";

class PromptWidget extends WidgetType {
  value: string;
  view: EditorView;
  pos: number;
  constructor(value: string, view: EditorView, pos: number) {
    super();
    this.value = value;
    this.view = view;
    this.pos = pos;
  }
  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = this.value;
    span.className = "cm-ai-widget";
    span.title = "Double click to refresh";
    span.addEventListener("dblclick", async (e) => {
      e.preventDefault();
      e.stopPropagation();
      window.getSelection()?.removeAllRanges();

      // const current = this.view.state.selection.main.head;
      const currentLn = this.view.state.doc.lineAt(this.pos);
      const aiPrompt = currentLn.text.trim().substring(2).trim();

      aicache.delete(aiPrompt);
      this.view.dispatch({
        selection: { anchor: currentLn.to + 1 },
      });
    });
    return span;
  }
}

const promptMatcher = new MatchDecorator({
  regexp: /ai\s(.*?)/gi,
  decoration: (match, view, pos) =>
    Decoration.replace({
      widget: new PromptWidget(match[0], view, pos),
    }),
});

export const prompt = ViewPlugin.fromClass(
  class {
    prompts: DecorationSet;
    constructor(view: EditorView) {
      this.prompts = promptMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.prompts = promptMatcher.updateDeco(update, this.prompts);
    }
  },
  {
    eventHandlers: {
      keydown: (e, view) => {
        const value = view.plugin(prompt)?.prompts;
        const current = view.state.selection.main.head;
        const currentLine = view.state.doc.lineAt(current);

        if (e.key === "Enter") {
          for (let iter = value!.iter(); iter.value !== null; iter.next()) {
            const decoLine = view.state.doc.lineAt(iter.from);

            if (current >= iter.to && current <= decoLine.to) {
              if (view.state.doc.length === currentLine.to) {
                view.dispatch({
                  changes: {
                    from: view.state.doc.length,
                    to: view.state.doc.length,
                    insert: "\n",
                  },
                  selection: { anchor: currentLine.to + 1 },
                });
              } else {
                view.dispatch({
                  selection: { anchor: currentLine.to + 1 },
                });
              }
              e.stopPropagation();
              e.preventDefault();
              break;
            }
          }
        }
      },
    },
    decorations: (instance) => instance.prompts,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.prompts || Decoration.none;
      }),
  },
);
