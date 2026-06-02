import { atom } from "jotai";

export type EditorOperations = {
  undo: () => void;
  redo: () => void;
  clear: () => void;
  insertText: (text: string) => void;
  getText: () => string;
  replaceDocument: (text: string) => void;
  replaceLineRange: (fromLine: number, toLine: number, text: string) => void;
  deleteLineRange: (fromLine: number, toLine: number) => void;
  getPositionofLastLine: () => number;
};

export const editorOperationsAtom = atom<EditorOperations>({
  undo: () => {},
  redo: () => {},
  clear: () => {},
  insertText: (_text: string) => {},
  getText: () => "",
  replaceDocument: (_text: string) => {},
  replaceLineRange: (_fromLine: number, _toLine: number, _text: string) => {},
  deleteLineRange: (_fromLine: number, _toLine: number) => {},
  getPositionofLastLine: () => 0,
});
