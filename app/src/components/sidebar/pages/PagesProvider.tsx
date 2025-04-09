import { useLocalStorage } from "@uidotdev/usehooks";
import React, { PropsWithChildren, useState } from "react";

export type Messages = {
  role: "user" | "hissab";
  content: string;
  expressions?: string[];
  createdAt: number;
};

export type Page = {
  id: string;
  title: string;
  type: "page" | "chat";
  content: string;
  chats?: {
    messages: Messages[];
  };
};

export type EditorOperations = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  insertText: (text: string) => void;
  getPositionofLastLine: () => number;
};

export type pageContextType = {
  notes: Page[];
  createNote: (title: string, content: string, type?: "page" | "chat") => Page;
  updateNote: (
    id: string,
    updatedContent: string,
    type?: "page" | "chat",
    chat?: Messages,
  ) => void;
  renameNote: (id: string, newTitle: string) => void;
  deleteNote: (id: string) => void;
  currentPage?: Page;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page | undefined>>;
  editorOperations: EditorOperations;
  setEditorOperations: React.Dispatch<React.SetStateAction<EditorOperations>>;
};

export const PageContext = React.createContext<pageContextType>(undefined!);

const PagesProvider = ({ children }: PropsWithChildren) => {
  const [notes, setNotes] = useLocalStorage<Page[]>("hissab-pages", []);
  const [currentPage, setCurrentPage] = useState<Page>();
  const [editorOperations, setEditorOperations] = useState<EditorOperations>({
    undo: () => {},
    redo: () => {},
    clear: () => {},
    insertText: (text) => {},
    getPositionofLastLine: () => 0,
  });

  // Create a new note
  const createNote = (
    title: string,
    content: string,
    type: "page" | "chat" = "page",
  ) => {
    const newNote: Page = {
      id: crypto.randomUUID(),
      title,
      type,
      content,
      chats:
        type === "chat"
          ? {
              messages: [
                {
                  role: "user",
                  content: "What is the meaning of life?",
                  createdAt: Date.now(),
                },
                {
                  role: "hissab",
                  content: "42",
                  createdAt: Date.now(),
                },
                {
                  role: "user",
                  content: "Why is the sky blue?",
                  createdAt: Date.now(),
                },
                {
                  role: "hissab",
                  content:
                    "The sky appears blue due to Rayleigh scattering of sunlight.",
                  createdAt: Date.now(),
                },
              ],
            }
          : undefined,
    };
    setNotes([...notes, newNote]);
    return newNote;
  };

  // Update a note's content
  const updateNote = (
    id: string,
    updatedContent: string,
    type: "chat" | "page" = "page",
    chat: Messages,
  ) => {
    if (type === "chat") {
      const newNote = notes.map((note) =>
        note.id === id
          ? {
              ...note,
              chats: {
                messages: [...(note.chats?.messages ?? []), chat],
              },
            }
          : note,
      );
      setNotes(newNote);
      setCurrentPage(newNote.find((note) => note.id === id));
      return;
    }

    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, content: updatedContent } : note,
      ),
    );
  };

  // Rename a note
  const renameNote = (id: string, newTitle: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, title: newTitle } : note,
      ),
    );
  };

  // Delete a note
  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    setCurrentPage(notes[0]);
  };

  return (
    <PageContext.Provider
      value={{
        notes,
        createNote,
        updateNote,
        renameNote,
        deleteNote,
        currentPage,
        setCurrentPage,
        editorOperations,
        setEditorOperations,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export default PagesProvider;
