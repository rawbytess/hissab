import HissabEditor, { hissabEditorIf, HissabEditorType } from "editor/src";
import { useContext, useEffect, useRef } from "react";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";
import PromptInputWithBottomActions from "@/components/prompt/prompt-input-with-bottom-actions";

export default function Editor() {
  const { updateNote, currentPage, setEditorOperations } =
    useContext(PageContext);
  const heRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!heRef.current || !currentPage) return;
    const hissabEditorOptions: hissabEditorIf = {
      currentPage: currentPage?.id ?? "",
      storePage: (content: string) => {
        updateNote(currentPage?.id ?? "", content);
      },
      retrievePage: null,
      isWritable: true,
      isDark: true,
      isPro: true,
    };

    const he: HissabEditorType = new HissabEditor(
      heRef.current,
      hissabEditorOptions,
    );

    he.init().then(async () => {
      const page = currentPage?.content ?? "";
      he.updateEditor(page);
      setEditorOperations({
        undo: he.undoEditor,
        redo: he.redoEditor,
        clear: he.clearEditor,
        insertText: he.appendText,
      });
    });
    return () => he.destroy();
  }, [currentPage]);

  if (!currentPage) return null;

  return (
    <div className={"flex flex-col gap-4 w-full h-full"}>
      <div
        id="editor-root"
        className={"w-full font-normal bg-[#1c1c1c] "}
        ref={heRef}
      ></div>
      <PromptInputWithBottomActions />
    </div>
  );
}
