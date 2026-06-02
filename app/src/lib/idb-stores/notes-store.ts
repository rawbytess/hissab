import { createStore, del, get, keys, set } from "idb-keyval";
import type { Notebook } from "@/lib/atoms/notebooks.ts";

const notesStore = createStore("hissab", "notes");

export function saveNoteToIDB(noteID: string, noteData: Notebook) {
  return set(noteID, noteData, notesStore);
}

export function getNoteFromIDB(noteID: string): Promise<Notebook | undefined> {
  return get(noteID, notesStore);
}

export function deleteNoteFromIDB(noteID: string): Promise<void> {
  return del(noteID, notesStore);
}

export function getAllNotesFromIDB(): Promise<string[]> {
  return keys(notesStore);
}
