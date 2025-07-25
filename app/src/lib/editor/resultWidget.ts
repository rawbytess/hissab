import { StateEffect, StateField } from "@codemirror/state";
import {
  Decoration,
  type DecorationSet,
  EditorView,
  ViewPlugin,
  WidgetType,
} from "@codemirror/view";
import { aicache } from "@/lib/cache.ts";
import {
  getResult,
  type Results,
  refreshResults,
} from "@/lib/editor/getResults.ts";
import type { ProductNames } from "../../../../lib/types/userMetadata.ts";

const resultStateEffect = StateEffect.define<{ decorations: DecorationSet }>(
  {},
);

export const resultStateField = StateField.define({
  create() {
    return Decoration.none;
  },
  update(value, tr) {
    for (const effect of tr.effects) {
      if (effect.is(resultStateEffect)) {
        value = effect.value?.decorations;
      }
    }
    return value;
  },
  provide(f) {
    return EditorView.decorations.from(f);
  },
});

export async function getResultExtension(
  storePage: (content: string) => void,
  oldResults: Results[],
  isPro: boolean,
  isAuthenticated: boolean,
  isPremium: ProductNames | null,
) {
  return ViewPlugin.define(() => {
    return {
      update(update) {
        if (update.docChanged || update.selectionSet) {
          getResult(
            update.view,
            resultStateEffect,
            storePage,
            oldResults,
            isPro,
            isAuthenticated,
            isPremium,
          ).then((result) => {
            oldResults = result;
            refreshResults(
              result,
              oldResults,
              update.view,
              resultStateEffect,
              isPro,
            );
          });
        }
      },
    };
  });
}

export class ResultWidget extends WidgetType {
  constructor(
    readonly result: Results,
    readonly pro: boolean,
    readonly view: EditorView,
  ) {
    super();
  }

  toDOM() {
    const wrap = document.createElement("span");
    wrap.className = this.result.stale
      ? "cm-result cm-result-stale"
      : "cm-result cm-result-fresh";
    if (this.result.ai) wrap.className += " cm-result-ai";

    if (
      this.result.error &&
      this.result.errorMessage?.message !== "User Error" &&
      !this.result.loading
    ) {
      const errorSpan = document.createElement("span");
      errorSpan.setAttribute("id", `result-error-${this.result.lineNumber}`);
      wrap.appendChild(errorSpan);
      errorSpan.innerHTML = `<span>${this.result.errorMessage?.userMessage ?? "Something went wrong"}</span>`;
      errorSpan.className = "error-span";
      //errorSpan.ariaLabel = `Double click to try again.`;
      errorSpan.title = `Double click to try again.`;
      errorSpan.addEventListener("dblclick", async (e) => {
        e.preventDefault();
        e.stopPropagation();
        window.getSelection()?.removeAllRanges();
        const currentLine = this.view.state.doc.toString().split("\n")[
          this.result.lineNumber
        ];
        const current = this.view.state.selection.main.head;
        const currentLn = this.view.state.doc.lineAt(current);
        const aiPrompt = currentLine.trim().substring(2).trim();

        aicache.delete(aiPrompt);
        this.view.dispatch({
          selection: { anchor: currentLn.to + 1 },
        });
      });
      return wrap;
    }
    wrap.innerText = this.result.result;
    const copiedDiv = document.createElement("div");
    copiedDiv.innerText = "Copied!";
    copiedDiv.className = "copied-div";

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
    wrap.setAttribute("title", "Double click to copy answer");

    if (this.result.loading) {
      const loadingSpan = document.createElement("span");
      loadingSpan.setAttribute(
        "id",
        `result-loading-${this.result.lineNumber}`,
      );
      wrap.appendChild(loadingSpan);
      loadingSpan.innerHTML = loadingIcon;
      loadingSpan.className = "cm-ai-span";
    }
    if (this.result.ai && !this.result.error) {
      const aiSpan = document.createElement("button");

      const title = `Hissab Expressions: 
${this.result.ai?.expressions?.join("\n")}
Click to add expressions to the editor`;
      aiSpan.setAttribute("title", title);
      aiSpan.addEventListener("click", async (e) => {
        e.preventDefault();
        e.stopPropagation();

        const doc = this.view!.state.doc.toString();
        const docArray = doc.split("\n");

        const newDocArray = [
          ...docArray.slice(0, this.result.lineNumber + 1),
          this.result.ai?.expressions.join("\n") || "",
          ...docArray.slice(this.result.lineNumber + 1),
        ];

        const transaction = this.view.state.update({
          changes: {
            from: 0,
            to: this.view?.state?.doc.length,
            insert: newDocArray.join("\n"),
          },
        });

        if (transaction) {
          this.view?.dispatch(transaction);
        }
      });

      aiSpan.setAttribute("id", `result-ai-${this.result.lineNumber}`);
      wrap.appendChild(aiSpan);
      aiSpan.innerHTML = aiIcon;
      aiSpan.className = "cm-ai-span opacity-70 hover:opacity-100";
    }

    return wrap;
  }
  ignoreEvent() {
    return true;
  }
}
const loadingIcon = `
<l-infinity
  size="30"
  stroke="4"
  stroke-length="0.15"
  bg-opacity="0.2"
  speed="1.3"
  color="#8100ff"
></l-infinity>
`;

export const aiIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24">
<g fill="#8100ff" fill-rule="evenodd">
<path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
<path fill="#C672FF" d="M12 2a1 1 0 0 0-1 1v2H5a2 2 0 0 0-2 2v13a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-6V3a1 1 0 0 0-1-1m1 3v8.828L14.828 12a1 1 0 0 1 1.415 1.414l-3.36 3.359a1.25 1.25 0 0 1-1.767 0l-3.359-3.359A1 1 0 1 1 9.172 12L11 13.828V5z" />
</g>
</svg>`;

const errorIcon = `<svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24">
<path fill="red" d="M4.25 12a7.75 7.75 0 1 1 15.5 0a7.75 7.75 0 0 1-15.5 0" opacity="0.5"/>
<path fill="red" d="M8.25 12a3.75 3.75 0 1 0 7.5 0a3.75 3.75 0 0 0-7.5 0"/></svg>`;
