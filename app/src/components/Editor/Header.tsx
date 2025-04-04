import { useContext } from "react";
import { PageContext } from "@/components/sidebar/pages/PagesProvider.tsx";
import { SidebarTrigger } from "@/components/ui/sidebar.tsx";
import { Icon } from "@iconify/react";
import { Tooltip } from "@heroui/react";
import { SessionContext } from "@/components/user/auth/SessionProvider.tsx";

export default function Header() {
  const { editorOperations } = useContext(PageContext);
  const { metadata, isPaid } = useContext(SessionContext);
  return (
    <header className="h-12 w-full flex items-center justify-between px-4 bg-purple-700 text-[#dddddd] drop-shadow">
      <SidebarTrigger />
      <div className="flex flex-col items-center">
        <img src="/logo_blk.svg" alt="logo" className="h-9 drop-shadow-lg" />
        <p
          className={
            "text-[9px] uppercase text-purple-300 tracking-wider -mt-2"
          }
        >
          {isPaid ? metadata?.subscription?.product_name : ""}
        </p>
      </div>
      <div className="flex items-center">
        <Tooltip content={"Undo"} className={"bg-stone-900 text-gray-300"}>
          <button
            className="hover:bg-gray-800 hover:text-white hover:rounded p-2"
            onClick={editorOperations.undo}
          >
            <Icon icon="majesticons:undo" width="24" height="24" />
          </button>
        </Tooltip>
        <Tooltip content={"Redo"} className={"bg-stone-900 text-gray-300"}>
          <button
            className="hover:bg-gray-800 hover:text-white hover:rounded p-2"
            onClick={editorOperations.redo}
          >
            <Icon icon="majesticons:redo" width="24" height="24" />
          </button>
        </Tooltip>
        <Tooltip
          content={"Clear Page"}
          className={"bg-stone-900 text-gray-300"}
        >
          <button
            className="hover:bg-gray-800 hover:text-white hover:rounded p-2"
            onClick={editorOperations.clear}
          >
            <Icon icon="fluent:delete-lines-20-filled" width="20" height="20" />
          </button>
        </Tooltip>
      </div>
    </header>
  );
}
