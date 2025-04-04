import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  DecorationSet,
  EditorView,
  MatchDecorator,
  ViewPlugin,
  ViewUpdate,
  WidgetType,
} from "@codemirror/view";

/*
const addUnderline = StateEffect.define<{ from: number; to: number }>({
  map: ({ from, to }, change) => ({
    from: change.mapPos(from),
    to: change.mapPos(to),
  }),
});

const underlineField = StateField.define<DecorationSet>({
  create() {
    return Decoration.none;
  },
  update(underlines, tr) {
    underlines = underlines.map(tr.changes);
    //console.log("Underlines: ", underlines);
    for (let e of tr.effects)
      if (e.is(addUnderline)) {
        underlines = underlines.update({
          add: [underlineMark.range(e.value.from, e.value.to)],
        });
      }
    return underlines;
  },
  provide: (f) => EditorView.decorations.from(f),
});

const underlineMark = Decoration.mark({ class: "cm-prompt" });

export function underlineSelection(view: EditorView) {
  // get from and to of text that are between {{ and }}
  const pos = findEmbeddedTextPositions(view.state.doc.toString());
  //console.log("Positions: ", pos);

  let effects: StateEffect<unknown>[] = pos.map((x) =>
    addUnderline.of({ from: x.start, to: x.end }),
  );
  if (!effects.length) return false;

  if (!view.state.field(underlineField, false))
    effects.push(StateEffect.appendConfig.of([underlineField]));
  view.dispatch({ effects });
  return true;
}
interface MatchPosition {
  /** The starting index of the match (inclusive, position of the first '{').
  start: number;
  /** The ending index of the match (exclusive, position *after* the second '}').
  end: number;
  /** The full matched text, including the {{ and }} delimiters.
  text: string;
  /** The text content *inside* the delimiters.
  contentText: string;
}
function findEmbeddedTextPositions(inputString: string): MatchPosition[] {
  // Regular expression explanation:
  // /\{\{      - Match the literal opening double curly braces '{{'
  // [\s\S]*?  - Match any character (including newlines) zero or more times,
  //             non-greedily (*?). This ensures we stop at the *first* closing '}}'.
  // \}\}/g    - Match the literal closing double curly braces '}}'.
  //            The 'g' flag ensures we find *all* matches, not just the first one.
  const regex = /\ai>(.*?)/g;

  const results: MatchPosition[] = [];
  let match;

  // Use regex.exec() in a loop to find all matches
  while ((match = regex.exec(inputString)) !== null) {
    const fullMatchText = match[0];
    const startIndex = match.index;
    const endIndex = startIndex + fullMatchText.length; // End index is exclusive

    // Extract content *inside* the delimiters
    // Remove the first 2 chars '{{' and the last 2 chars '}}'
    const contentText = fullMatchText.slice(2, -2);

    results.push({
      start: startIndex,
      end: endIndex,
      text: fullMatchText,
      contentText: contentText,
    });

    // Important for global regex with exec: If the match is zero-length,
    // advance the regex's lastIndex manually to prevent infinite loops.
    // This shouldn't happen with `\{\{[\s\S]*?\}\}` unless the input somehow
    // contains just "{{" or "}}" which wouldn't match the full pattern,
    // but it's good practice. Our pattern requires at least 4 characters `{{}}`.
    if (fullMatchText.length === 0) {
      regex.lastIndex++;
    }
  }

  return results;
}
*/

class PlaceholderWidget extends WidgetType {
  value: string;
  constructor(value: string) {
    super();
    this.value = value;
  }
  toDOM(): HTMLElement {
    const span = document.createElement("span");

    span.textContent = this.value;
    span.className = "cm-ai-widget";
    // span.contentEditable = "true";
    /*
    span.onbeforeinput = (e) => {
      e.preventDefault();
      e.stopPropagation();
      // span.contentEditable = "false";
      console.log("Span blurred");
    };

    span.addEventListener("keyup", (e) => {
      console.log("Key Presssssssssss:", e.key);
      e.preventDefault();
      e.stopPropagation();
      console.log("Form submitted");
    });*/

    span.onkeydown = (e) => {
      console.log("Key released:", e.key);
      if (e.key === "Enter") {
        //e.preventDefault();
        //e.stopPropagation();
        console.log("Enter key released");
      }
    };
    /*
    span.parentElement?.addEventListener("keydown", (e) => {
      console.log("Key Parent pressed:", e.key);
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        console.log("Enter key pressed");
      }
    });*/
    /*span.onkeydown = (e) => {
      console.log("Key pressed:", e.key);
      if (e.key === "Enter") {
        e.preventDefault();
        e.stopPropagation();
        console.log("Enter key pressed");
      }
    };*/
    span.onclick = (e) => {
      e.preventDefault();
      e.stopPropagation();
      span.focus();
      span.contentEditable = "true";
      console.log("Span clicked");
    };

    return span;
  }
}

const placeholderMatcher = new MatchDecorator({
  regexp: /\ai\s(.*?)/gi,
  decoration: (match) =>
    Decoration.replace({
      widget: new PlaceholderWidget(match[0]),
    }),
});

export const prompt = ViewPlugin.fromClass(
  class {
    placeholders: DecorationSet;
    constructor(view: EditorView) {
      this.placeholders = placeholderMatcher.createDeco(view);
    }
    update(update: ViewUpdate) {
      this.placeholders = placeholderMatcher.updateDeco(
        update,
        this.placeholders,
      );
    }
  },
  {
    eventHandlers: {
      keydown: (e, view) => {
        //console.log("*****************************************");
        const value = view.plugin(prompt)?.placeholders;
        const current = view.state.selection.main.head;
        const currentLine = view.state.doc.lineAt(current);
        let from = 0,
          to = 0;
        let isPromptFocused = false;
        for (let iter = value!.iter(); iter.value !== null; iter.next()) {
          if (current > iter.from && current < currentLine.to) {
            isPromptFocused = true;
            from = iter.from;
            to = iter.to;
            break;
          }
          //console.log("FROM: ", iter.from);
          //console.log("TO: ", iter.to);
          //console.log("Value: ", iter.value);
        }

        console.log("Current:", view.state.selection.main.head);
        console.log("Key pressed:", e.key);
        if (e.key === "Enter") {
          if (isPromptFocused) {
            console.log("Enter key pressed in prompt");
            view.dispatch({
              selection: { anchor: currentLine.to },
            });
            //e.preventDefault();
            //e.stopPropagation();
          }

          console.log("Enter key pressed");
        }
      },
    },

    decorations: (instance) => instance.placeholders,
    provide: (plugin) =>
      EditorView.atomicRanges.of((view) => {
        return view.plugin(plugin)?.placeholders || Decoration.none;
      }),
  },
);
