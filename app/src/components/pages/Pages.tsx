import {
  ClipboardCheck,
  FilePlus2,
  NotepadText,
  Pencil,
  Trash2,
} from "lucide-react";
import { Button } from "@/components/ui/button.tsx";
import { useContext, useEffect, useState } from "react";
import { Page, PageContext } from "@/components/pages/PagesProvider.tsx";
import { Input } from "@/components/ui/input.tsx";
import { cn } from "@/lib/utils.ts";
import ToolTips from "@/components/ToolTips.tsx";
import { getRandomPlaceholderName } from "@/lib/placeholder.ts";

export default function Pages() {
  const {
    notes,
    createNote,
    renameNote,
    deleteNote,
    currentPage,
    setCurrentPage,
  } = useContext(PageContext);
  const [editing, setEditing] = useState<Page | undefined>(undefined);
  useEffect(() => {
    if (notes.length === 0) {
      const newNote: Page = createNote(getRandomPlaceholderName(), "");
      setCurrentPage(newNote);
    }
    if (currentPage === undefined) {
      setCurrentPage(notes[0]);
    }
  }, [notes]);

  return (
    <div>
      <div className={"p-2 pb-4 drop-shadow bg-purple-900"}>
        <p className={"text-center"}>{currentPage?.title}</p>
      </div>
      <ul>
        {notes.map((page, index) => (
          <li
            key={index}
            className={cn(
              "p-1 border-b-[1px] border-gray-700   hover:bg-gray-800",
              page.id === currentPage?.id
                ? "font-medium text-white bg-cyan-900"
                : "font-light",
            )}
            onClick={() => {
              setCurrentPage(page);
            }}
            onDoubleClick={() => {
              setEditing(page);
            }}
          >
            {editing?.id === page.id ? (
              <div className={"flex"}>
                <Input
                  autoFocus
                  value={page.title}
                  className={"rounded ring-1 ring-gray-700 p-2"}
                  onChange={(e) => {
                    renameNote(page.id, e.target.value);
                  }}
                  onKeyUp={(e) => {
                    if (e.key === "Enter") setEditing(undefined);
                  }}
                />
                <ToolTips tip={"Done Editing"} side={"right"}>
                  <Button
                    className={"text-green-600 hover:bg-gray-900 p-2"}
                    onClick={() => {
                      setEditing(undefined);
                    }}
                  >
                    <ClipboardCheck />
                  </Button>
                </ToolTips>
                <ToolTips tip={"Delete Page"} side={"right"}>
                  <Button
                    className={"text-red-600 w-10 hover:bg-gray-900 p-2"}
                    onClick={() => {
                      deleteNote(page.id);
                      setCurrentPage(notes[index - 1] ?? notes[index + 1]);
                      setEditing(undefined);
                    }}
                  >
                    <Trash2 />
                  </Button>
                </ToolTips>
              </div>
            ) : (
              <>
                <Button className={"flex gap-2"}>
                  <NotepadText className={"w-4"} />
                  <p className={"text-xs"}>{page.title}</p>
                </Button>
              </>
            )}
          </li>
        ))}
        <li className={"mt-10 flex gap-2 justify-around"}>
          <ToolTips tip={"Add new page"}>
            <Button
              onClick={() => {
                const newNote: Page = createNote(
                  getRandomPlaceholderName(),
                  "",
                );
                setCurrentPage(newNote);
                setEditing(newNote);
              }}
              className={
                "bg-blue-900 hover:bg-blue-700 rounded drop-shadow p-2"
              }
            >
              <FilePlus2 />
              New Page
            </Button>
          </ToolTips>
          <ToolTips tip={"Add new page"}>
            <Button
              onClick={() => {
                editing ? setEditing(undefined) : setEditing(currentPage);
              }}
              className={
                "bg-teal-900 hover:bg-teal-700 rounded drop-shadow p-2"
              }
            >
              <Pencil />
              Edit Page
            </Button>
          </ToolTips>
        </li>
      </ul>
    </div>
  );
}
