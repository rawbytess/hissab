import {
  EditorState,
  StateEffect,
  StateField,
  Range,
  Facet,
} from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import { sleep } from "../../../../lib/utils.ts";

type chatsType = {
  chat: string;
  position: number;
};

export const chats: chatsType[] = [];

export const charPromptExtension = StateField.define({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    value = chatPrompt(tr.state);
    for (const effect of tr.effects) {
      if (effect.is(chatPromptEffect)) {
        value = effect.value?.decorations;
      }
    }
    return value;
  },
  provide(f) {
    // static atomicRanges: Facet<(view: EditorView) => RangeSet<any>, readonly ((view: EditorView) => RangeSet<any>
    const charPromptFacet = Facet.define<DecorationSet>();
    //return [
    //  EditorView.atomicRanges.of((v) => v.state.field(f)),
    //charPromptFacet.from(f),
    //];
    return EditorView.decorations.from(f);
  },
});
export function chatPrompt(state: EditorState) {
  const chatWidgets: Range<Decoration>[] = [];
  const doc = state.doc.toString();
  // get position of string between "[[" and "]]"
  const regex = /\[\[([\s\S]*?)\]\]/g;
  let match;
  while ((match = regex.exec(doc)) !== null) {
    const chat = match[1];
    const position = match.index;
    const end = match.index + match[0].length;
    const deco = Decoration.replace({
      widget: new ChatPromptWidget(chat),
      inclusive: true,
    });
    const range = deco.range(position, end);
    chatWidgets.push(range);
  }
  return Decoration.set(chatWidgets);
}

export class ChatPromptWidget extends WidgetType {
  value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
  toDOM(): HTMLElement {
    const span = document.createElement("span");
    // span.contentEditable = "false";
    span.innerHTML = this.value;
    span.className = "cm-prompt";
    return span;
  }
}

export const chatPromptEffect = StateEffect.define<{
  decorations: DecorationSet;
}>({});

export const chatPromptPlugin = ViewPlugin.define(() => {
  return {
    update(update) {
      if (update.state.doc.toString() === update.startState.doc.toString())
        return;

      update.view.dispatch({
        effects: chatPromptEffect.of({
          decorations: chatPrompt(update.state),
        }),
      });
    },
  };
});
