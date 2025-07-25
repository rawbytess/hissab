import { Tooltip } from "@heroui/react";
import { Icon } from "@iconify/react";
import { useContext, useEffect, useRef } from "react";
import { useAuth } from "@/components/user/auth/AuthProvider";
import HissabEditor, {
  type HissabEditorType,
  type hissabEditorIf,
} from "@/lib/editor/editor.ts";

export function InChatEditor({ expressions }: { expressions: string[] }) {
  const heRef = useRef<HTMLDivElement>(null);
  const heeditorRef = useRef<HissabEditorType | null>(null);
  const { isPremium, isAuthenticated } = useAuth();

  useEffect(() => {
    if (!heRef.current) return;
    const hissabEditorOptions: hissabEditorIf = {
      currentPage: "",
      storePage: () => {},
      retrievePage: null,
      isWritable: true,
      isDark: true,
      isPro: !!isPremium,
      isAuthenticated: isAuthenticated,
      isPremium: isPremium,
    };
    heeditorRef.current = new HissabEditor(heRef.current, hissabEditorOptions);

    heeditorRef.current.init().then(async () => {
      heeditorRef.current?.updateEditor(expressions.join("\n"));
    });
    return () => heeditorRef.current?.destroy();
  }, [expressions, isPremium]);

  return (
    <div className="relative">
      <div
        className={
          "ring-2 ring-gray-700  rounded-xl max-w-[35em] max-h-[20em] my-10 mx-2 p-1 w-full overflow-y-auto "
        }
        ref={heRef}
      ></div>
      <Tooltip
        content="Restore expressions"
        className={"text-gray-300 bg-stone-800"}
        delay={0}
        closeDelay={0}
      >
        <Icon
          icon="solar:refresh-square-bold"
          className="absolute -top-2 z-50 -left-0 cursor-pointer drop-shadow-lg text-gray-500"
          width={20}
          onClick={() => {
            heeditorRef.current?.updateEditor(expressions.join("\n"));
          }}
        />
      </Tooltip>
    </div>
  );
}
