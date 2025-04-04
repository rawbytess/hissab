import { useLocalStorage } from "@uidotdev/usehooks";
import React, { PropsWithChildren, useState } from "react";

export type Page = {
  id: string;
  title: string;
  content: string;
};

export type EditorOperations = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  insertText: (text: string) => void;
};

export type pageContextType = {
  notes: Page[];
  createNote: (title: string, content: string) => Page;
  updateNote: (id: string, updatedContent: string) => void;
  renameNote: (id: string, newTitle: string) => void;
  deleteNote: (id: string) => void;
  currentPage?: Page;
  setCurrentPage: React.Dispatch<React.SetStateAction<Page | undefined>>;
  editorOperations: EditorOperations;
  setEditorOperations: React.Dispatch<React.SetStateAction<EditorOperations>>;
};

const defaultPageContext: pageContextType = {
  notes: [],
  createNote: (title, content): Page => {
    return {
      id: "",
      title,
      content,
    };
  },
  updateNote: () => {},
  renameNote: () => {},
  deleteNote: () => {},
  setCurrentPage: () => {},
  editorOperations: {
    undo: () => {},
    redo: () => {},
    clear: () => {},
    insertText: (text: string) => {},
  },
  setEditorOperations: () => {},
};

export const PageContext =
  React.createContext<pageContextType>(defaultPageContext);

const PagesProvider = ({ children }: PropsWithChildren) => {
  const [notes, setNotes] = useLocalStorage<Page[]>("hissab-pages", []);
  const [currentPage, setCurrentPage] = useState<Page>();
  const [editorOperations, setEditorOperations] = useState<EditorOperations>({
    undo: () => {},
    redo: () => {},
    clear: () => {},
    insertText: (text) => {},
  });

  // Create a new note
  const createNote = (title: string, content: string) => {
    const newNote: Page = {
      id: crypto.randomUUID(),
      title,
      content,
    };
    setNotes([...notes, newNote]);
    return newNote;
  };

  // Update a note's content
  const updateNote = (id: string, updatedContent: string) => {
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
