import React, { PropsWithChildren, useState } from "react";
import { parseAsString, useQueryState } from "nuqs";
import { FileUpload } from "../../../../../lib/types/fileTypes.ts";
import { useLocalStorage } from "@/hooks/useLocalStorage.tsx";
import {
  chatDefaultModel,
  inLineDefaultModel,
  Models,
  ModelSize,
} from "../../../../../lib/types/AITypes.ts";

export type userMessage = {
  role: "user";
  content: string;
  createdAt: number;
};

export type aiMessage = {
  role: "hissab";
  content: string;
  error: boolean;
  expressions: string[];
  webSearchContext?: string;
  createdAt: number;
};

export type Messages = userMessage | aiMessage;

export type notePage = {
  id: string;
  title: string;
  type: "page" | undefined;
  content: string;
  model: ModelSize;
  file?: FileUpload | null;
};

export type ChatPage = {
  id: string;
  title: string;
  type: "chat";
  file?: FileUpload | null;
  model: ModelSize;
  explain: boolean;
  fallback: boolean;
  chats: {
    messages: Messages[];
  };
};

export type Page = notePage | ChatPage;

export type EditorOperations = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  insertText: (text: string) => void;
  getPositionofLastLine: () => number;
};

export type pageContextType = {
  notes: Page[];
  setNotes: React.Dispatch<React.SetStateAction<Page[]>>;
  currentPage: Page | undefined;
  createNote: (title: string, content: string, type?: "page" | "chat") => Page;
  updateNote: (
    id: string,
    updatedContent: string,
    type?: "page" | "chat",
    file?: FileUpload | null,
    chat?: Messages,
  ) => void;
  renameNote: (id: string, newTitle: string) => void;
  deleteNote: (id: string) => void;
  deleteChatMessage: (id: string, index: number) => void;
  updateModel: (id: string, model: ModelSize) => void;
  toggleExplain: (id: string) => void;
  toggleFallback: (id: string) => void;
  currentPageNumber: string;
  setCurrentPageNumber: React.Dispatch<React.SetStateAction<string>>;
  editorOperations: EditorOperations;
  setEditorOperations: React.Dispatch<React.SetStateAction<EditorOperations>>;
};

export const PageContext = React.createContext<pageContextType>(undefined!);

const PagesProvider = ({ children }: PropsWithChildren) => {
  const [notes, setNotes] = useLocalStorage<Page[]>("hissab-pages", []);

  const [currentPageNumber, setCurrentPageNumber] = useQueryState(
    "page",
    parseAsString.withDefault(""),
  );
  const currentPage = notes.find((note) => note.id === currentPageNumber);
  if (!currentPage) {
    setCurrentPageNumber(notes[0]?.id ?? "");
  }
  const [editorOperations, setEditorOperations] = useState<EditorOperations>({
    undo: () => {},
    redo: () => {},
    clear: () => {},
    insertText: () => {},
    getPositionofLastLine: () => 0,
  });

  // Create a new note
  const createNote = (
    title: string,
    content: string,
    type: "page" | "chat" = "page",
  ) => {
    let newNote: Page;
    if (type === "chat") {
      newNote = {
        id: crypto.randomUUID(),
        title,
        type,
        model: "medium",
        explain: false,
        fallback: true,
        chats: {
          messages: [],
        },
      };
    } else {
      newNote = {
        id: crypto.randomUUID(),
        title,
        type,
        model: "small",
        content: content,
      };
    }
    setNotes([...notes, newNote]);
    return newNote;
  };

  const updateNote = (
    id: string,
    updatedContent: string,
    type: "chat" | "page" = "page",
    file?: FileUpload | null,
    chat?: Messages,
  ) => {
    if (type === "chat" && chat) {
      setNotes((notes) =>
        notes.map((note) =>
          note.id === id && note.type === "chat"
            ? {
                ...note,
                file: file === undefined ? note.file : file,
                chats: {
                  messages: [...note.chats.messages, chat],
                },
              }
            : note,
        ),
      );
      setCurrentPageNumber(id);
      return;
    }

    setNotes((notes) =>
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              content: updatedContent,
              file: file === undefined ? note.file : file,
            }
          : note,
      ),
    );
  };

  const deleteChatMessage = (id: string, index: number) => {
    setNotes((notes) =>
      notes.map((note) =>
        note.id === id && note.type === "chat"
          ? {
              ...note,
              chats: {
                messages: note.chats.messages.filter((_, i) => i !== index),
              },
            }
          : note,
      ),
    );
  };

  const updateModel = (id: string, model: ModelSize) => {
    setNotes((notes) =>
      notes.map((note) =>
        note.id === id
          ? {
              ...note,
              model: model,
            }
          : note,
      ),
    );
  };

  const toggleExplain = (id: string) => {
    setNotes((notes) =>
      notes.map((note) =>
        note.id === id && note.type === "chat"
          ? {
              ...note,
              explain: !note.explain,
            }
          : note,
      ),
    );
  };

  const toggleFallback = (id: string) => {
    setNotes((notes) =>
      notes.map((note) =>
        note.id === id && note.type === "chat"
          ? {
              ...note,
              fallback: !note.fallback,
            }
          : note,
      ),
    );
  };

  const renameNote = (id: string, newTitle: string) => {
    setNotes(
      notes.map((note) =>
        note.id === id ? { ...note, title: newTitle } : note,
      ),
    );
  };

  const deleteNote = (id: string) => {
    setNotes(notes.filter((note) => note.id !== id));
    setCurrentPageNumber(notes[0].id);
  };

  return (
    <PageContext.Provider
      value={{
        notes,
        setNotes,
        currentPage,
        createNote,
        updateNote,
        renameNote,
        deleteNote,
        deleteChatMessage,
        toggleExplain,
        toggleFallback,
        updateModel,
        currentPageNumber,
        setCurrentPageNumber,
        editorOperations,
        setEditorOperations,
      }}
    >
      {children}
    </PageContext.Provider>
  );
};

export default PagesProvider;
