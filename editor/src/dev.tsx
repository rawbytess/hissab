import { useEffect, useRef } from "react";
import { createRoot } from "react-dom/client";
import HissabEditor, { HissabEditorType, hissabEditorIf } from "./editor";

function Basic() {
  async function storePage(pageText: string, page: string) {
    await localStorage.setItem(page, pageText);
  }
  async function retrievePage(key: string) {
    return localStorage.getItem(key);
  }

  const hissabEditorOptions: hissabEditorIf = {
    currentPage: "page",
    storePage,
    retrievePage,
    isWritable: true,
    isDark: true,
    isPro: true,
  };

  const heRef = useRef<HTMLDivElement>(null);
  useEffect(() => {
    const he: HissabEditorType = new HissabEditor(
      heRef.current!,
      hissabEditorOptions,
    );
    he.init().then(async () => {
      const page = await retrievePage("page");
      he.updateEditor(page || "");
    });
    return () => he.destroy();
  }, []);

  return (
    <>
      <div
        id="editor-root"
        style={{
          height: "40rem",
          width: "80%",
          fontWeight: "400",
          fontSize: "1 em",
          backgroundColor: "#1c1c1c",
        }}
        ref={heRef}
      ></div>
    </>
  );
}
const root = createRoot(document.getElementById("root") as HTMLDivElement);
root.render(<Basic />);
