import HissabEditor, {
  hissabEditorIf,
  HissabEditorType,
} from "@/lib/editor/editor";
import { useContext, useEffect, useRef } from "react";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";
import { ChatPage } from "@/components/sidebar/chat/ChatPage.tsx";

export default function Editor() {
  const { updateNote, currentPage, setEditorOperations } =
    useContext(PageContext);
  const { isPaid } = useContext(SessionContext);
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
      isPro: isPaid,
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
        getPositionofLastLine: he.getPositionofLastLine,
      });
    });
    return () => he.destroy();
  }, [currentPage]);

  if (!currentPage) return null;
  if (currentPage.type === "chat") return <ChatPage page={currentPage} />;

  return (
    <div className={"flex flex-col gap-4 w-full h-full overflow-y-auto"}>
      <div
        id="editor-root"
        className={"w-full font-normal bg-[#1c1c1c] "}
        ref={heRef}
      ></div>
    </div>
  );
}
