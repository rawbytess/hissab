import { useContext, useEffect, useState } from "react";
import {
  Page,
  PageContext,
} from "@/components/sidebar/pages/PagesProvider.tsx";
import { getRandomPlaceholderName } from "@/lib/placeholder.ts";
import { Button, Input, cn, Divider } from "@heroui/react";
import { Icon } from "@iconify/react";
import PageOptions from "@/components/sidebar/pages/PageOptions.tsx";

export default function Pages() {
  const {
    notes,
    createNote,
    renameNote,
    deleteNote,
    currentPageNumber,
    setCurrentPageNumber,
  } = useContext(PageContext);
  const [editing, setEditing] = useState<Page | undefined>(undefined);
  useEffect(() => {
    if (notes.length === 0) {
      const newNote: Page = createNote(getRandomPlaceholderName(), "");
      setCurrentPageNumber(newNote.id);
    }
    if (currentPageNumber?.length === 0) {
      setCurrentPageNumber(notes[0].id);
    }
  }, [createNote, notes, currentPageNumber, setCurrentPageNumber]);

  return (
    <>
      <div className="bg-purple-700 flex justify-between h-11">
        <Button
          onPress={() => {
            const newNote: Page = createNote(getRandomPlaceholderName(), "");
            setCurrentPageNumber(newNote.id);
            setEditing(newNote);
          }}
          variant={"light"}
          size={"sm"}
          className="m-2 w-fit text-gray-300 h-7"
        >
          <Icon
            icon="fluent:document-one-page-add-20-filled"
            width="20"
            height="20"
          />
        </Button>
        <Button
          onPress={() => {
            const newNote: Page = createNote(
              getRandomPlaceholderName(),
              "",
              "chat",
            );
            setCurrentPageNumber(newNote.id);
            setEditing(newNote);
          }}
          variant={"light"}
          size={"md"}
          className="m-2 w-fit text-gray-300 h-7"
        >
          <Icon icon="lsicon:add-chat-two-filled" width="24" height="24" />
        </Button>
      </div>
      <Divider />
      <ul className={"mt-2"}>
        {notes.map((page, index) => (
          <li
            key={index}
            className={cn(
              "p-1  hover:bg-stone-800 mx-2 rounded my-1",
              page.id === currentPageNumber
                ? "font-medium bg-stone-800 text-slate-200"
                : "font-light text-slate-300",
            )}
            onClick={() => {
              setCurrentPageNumber(page.id);
            }}
            onDoubleClick={() => {
              setEditing(page);
            }}
          >
            {editing?.id === page.id ? (
              <Input
                autoFocus
                value={page.title}
                className={"rounded ring-1 ring-gray-700"}
                onChange={(e) => {
                  renameNote(page.id, e.target.value);
                }}
                onKeyUp={(e) => {
                  if (e.key === "Enter") setEditing(undefined);
                }}
                endContent={
                  <Button
                    variant={"light"}
                    className={
                      "text-green-600 hover:bg-green-900 justify-end rounded-full"
                    }
                    size={"sm"}
                    onPress={() => {
                      setEditing(undefined);
                    }}
                  >
                    <Icon icon="lets-icons:done-round" width="24" height="24" />
                  </Button>
                }
              />
            ) : (
              <div className="flex items-center">
                <div className={"flex p-1 items-center gap-2 cursor-pointer"}>
                  <Icon
                    icon={
                      page?.type === "chat"
                        ? "fluent:chat-24-filled"
                        : "emojione-v1:page"
                    }
                    width="16"
                    height="16"
                    className={
                      page.id === currentPageNumber
                        ? "opacity-100"
                        : "opacity-70"
                    }
                  />
                  <p className={"text-sm"}>{page.title}</p>
                </div>
                {page.id === currentPageNumber && (
                  <PageOptions
                    pageID={currentPageNumber}
                    page={page}
                    deletePage={deleteNote}
                    setEditing={setEditing}
                    setCurrentPageNumber={setCurrentPageNumber}
                    notes={notes}
                    index={index}
                  />
                )}
              </div>
            )}
          </li>
        ))}
      </ul>
    </>
  );
}
