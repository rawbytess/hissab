import {
  Decoration,
  DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";

class PromptWidget extends WidgetType {
  value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
  toDOM(): HTMLElement {
    const span = document.createElement("span");
    span.textContent = this.value;
    span.className = "cm-ai-widget";
    return span;
  }
}

const promptMatcher = new MatchDecorator({
  regexp: /ai\s(.*?)/gi,
  decoration: (match) =>
    Decoration.replace({
      widget: new PromptWidget(match[0]),
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

        let isPromptFocused = false;

        if (e.key === "Enter") {
          for (let iter = value!.iter(); iter.value !== null; iter.next()) {
            if (current > iter.from && current < currentLine.to) {
              isPromptFocused = true;
              break;
            }
          }
          if (isPromptFocused) {
            view.dispatch({
              selection: { anchor: currentLine.to },
            });
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
