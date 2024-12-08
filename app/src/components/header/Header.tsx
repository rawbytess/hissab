import { Redo, Undo } from "lucide-react";
import DeleteLines from "@/components/header/DeleteLines.tsx";
import { useContext } from "react";
import { PageContext } from "@/components/pages/PagesProvider.tsx";
import ToolTips from "@/components/ToolTips.tsx";
import { SidebarTrigger } from "@/components/ui/sidebar.tsx";

export default function Header() {
  const { editorOperations } = useContext(PageContext);
  return (
    <header className="h-12 w-full flex items-center justify-between px-4 bg-purple-900 text-[#dddddd] drop-shadow">
      <SidebarTrigger />
      <img src="/logo_blk.svg" alt="logo" className="h-9 drop-shadow" />
      <div className="flex items-center">
        <ToolTips tip={"Undo"}>
          <button
            className="hover:bg-gray-800 hover:text-white hover:rounded p-2"
            onClick={editorOperations.undo}
          >
            <Undo />
          </button>
        </ToolTips>
        <ToolTips tip={"Redo"}>
          <button
            className="hover:bg-gray-800 hover:text-white hover:rounded p-2"
            onClick={editorOperations.redo}
          >
            <Redo />
          </button>
        </ToolTips>
        <ToolTips tip={"Clear Page"}>
          <button
            className="hover:bg-gray-800 hover:text-white hover:rounded p-2"
            onClick={editorOperations.clear}
          >
            <DeleteLines />
          </button>
        </ToolTips>
      </div>
    </header>
  );
}
