import { useContext, useEffect, useRef } from "react";
import HissabEditor, {
  hissabEditorIf,
  HissabEditorType,
} from "@/lib/editor/editor.ts";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";

export function InChatEditor({ expressions }: { expressions: string[] }) {
  const heRef = useRef<HTMLDivElement>(null);
  const { isPaid } = useContext(SessionContext);
  useEffect(() => {
    if (!heRef.current) return;
    const hissabEditorOptions: hissabEditorIf = {
      currentPage: "",
      storePage: (content: string) => {},
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
      he.updateEditor(expressions.join("\n"));
    });
    return () => he.destroy();
  }, [expressions, isPaid]);

  return (
    <div
      className={"ring-2 ring-gray-700  rounded-xl max-h-32 my-5 p-1 w-full"}
      ref={heRef}
    ></div>
  );
}
