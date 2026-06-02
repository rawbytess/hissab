import { createStore, del, get, keys, set } from "idb-keyval";
import type { Notebook } from "@/lib/atoms/notebooks.ts";

const fileStore = createStore("hissab-files", "files");

export type NotebookFileKind =
  | "image"
  | "pdf"
  | "text"
  | "document"
  | "spreadsheet"
  | "presentation"
  | "audio"
  | "video"
  | "unknown";

export type StoredNotebookFile = {
  id: string;
  name: string;
  mimeType: string;
  size: number;
  kind: NotebookFileKind;
  createdAt: number;
  updatedAt: number;
  content:
    | {
        encoding: "text";
        text: string;
      }
    | {
        encoding: "base64";
        data: string;
      };
};

export type FileType = {
  id: string;
  name: string;
  mimeType: string;
  fileBuffer?: ArrayBuffer;
};

const TEXT_MIME_PREFIXES = ["text/"];

const TEXT_MIME_TYPES = new Set([
  "application/json",
  "application/ld+json",
  "application/xml",
  "application/yaml",
  "application/x-yaml",
  "application/javascript",
  "application/typescript",
  "application/sql",
]);

const EXTENSION_MIME: Record<string, string> = {
  csv: "text/csv",
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  jpeg: "image/jpeg",
  jpg: "image/jpeg",
  json: "application/json",
  md: "text/markdown",
  m4a: "audio/mp4",
  mov: "video/quicktime",
  mp3: "audio/mpeg",
  mp4: "video/mp4",
  pdf: "application/pdf",
  png: "image/png",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  txt: "text/plain",
  wav: "audio/wav",
  webm: "video/webm",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
};

const SUPPORTED_EXTENSIONS = new Set(Object.keys(EXTENSION_MIME));

export function detectFileKind(
  name: string,
  mimeType: string,
): NotebookFileKind {
  const mime = mimeType.toLowerCase();
  const extension = getFileExtension(name);
  if (mime.startsWith("image/")) return "image";
  if (mime.startsWith("audio/")) return "audio";
  if (mime.startsWith("video/")) return "video";
  if (mime === "application/pdf" || extension === "pdf") return "pdf";
  if (isTextLike(name, mime)) return "text";
  if (extension === "docx") return "document";
  if (extension === "xlsx") return "spreadsheet";
  if (extension === "pptx") return "presentation";
  return "unknown";
}

export function isSupportedNotebookFile(file: Pick<File, "name" | "type">) {
  const mime = normalizeMime(file.name, file.type);
  const extension = getFileExtension(file.name);
  if (SUPPORTED_EXTENSIONS.has(extension)) return true;
  return (
    mime.startsWith("image/") ||
    mime.startsWith("audio/") ||
    mime.startsWith("video/") ||
    mime === "application/pdf" ||
    isTextLike(file.name, mime)
  );
}

export async function saveBrowserFileToIDB(
  browserFile: File,
): Promise<StoredNotebookFile> {
  const id = crypto.randomUUID();
  const mimeType = normalizeMime(browserFile.name, browserFile.type);
  const now = Date.now();
  const record: StoredNotebookFile = {
    id,
    name: browserFile.name,
    mimeType,
    size: browserFile.size,
    kind: detectFileKind(browserFile.name, mimeType),
    createdAt: now,
    updatedAt: now,
    content: isTextLike(browserFile.name, mimeType)
      ? { encoding: "text", text: await browserFile.text() }
      : {
          encoding: "base64",
          data: await arrayBufferToBase64(await browserFile.arrayBuffer()),
        },
  };
  await saveFileRecordToIDB(record);
  return record;
}

export async function saveLegacyFileToIDB(
  legacyFile: FileType,
): Promise<StoredNotebookFile | null> {
  const existing = await getNotebookFileFromIDB(legacyFile.id);
  if (existing && existing.name !== legacyFile.id) return existing;

  const buffer = legacyFile.fileBuffer ?? (await getFileFromIDB(legacyFile.id));
  if (!buffer) return null;

  const mimeType = normalizeMime(legacyFile.name, legacyFile.mimeType);
  const now = Date.now();
  const textLike = isTextLike(legacyFile.name, mimeType);
  const record: StoredNotebookFile = {
    id: legacyFile.id,
    name: legacyFile.name,
    mimeType,
    size: buffer.byteLength,
    kind: detectFileKind(legacyFile.name, mimeType),
    createdAt: now,
    updatedAt: now,
    content: textLike
      ? { encoding: "text", text: new TextDecoder().decode(buffer) }
      : { encoding: "base64", data: await arrayBufferToBase64(buffer) },
  };
  await saveFileRecordToIDB(record);
  return record;
}

export function saveFileRecordToIDB(file: StoredNotebookFile) {
  return set(file.id, file, fileStore);
}

export async function saveFileToIDB(fileID: string, fileBuffer: ArrayBuffer) {
  const now = Date.now();
  const record: StoredNotebookFile = {
    id: fileID,
    name: fileID,
    mimeType: "application/octet-stream",
    size: fileBuffer.byteLength,
    kind: "unknown",
    createdAt: now,
    updatedAt: now,
    content: {
      encoding: "base64",
      data: await arrayBufferToBase64(fileBuffer),
    },
  };
  return saveFileRecordToIDB(record);
}

export async function getNotebookFileFromIDB(
  fileID: string,
): Promise<StoredNotebookFile | undefined> {
  const stored = await get<StoredNotebookFile | ArrayBuffer>(fileID, fileStore);
  if (!stored) return undefined;
  if (stored instanceof ArrayBuffer) {
    return {
      id: fileID,
      name: fileID,
      mimeType: "application/octet-stream",
      size: stored.byteLength,
      kind: "unknown",
      createdAt: Date.now(),
      updatedAt: Date.now(),
      content: {
        encoding: "base64",
        data: await arrayBufferToBase64(stored),
      },
    };
  }
  return stored;
}

export async function getFileFromIDB(
  fileID: string,
): Promise<ArrayBuffer | undefined> {
  const file = await getNotebookFileFromIDB(fileID);
  if (!file) return undefined;
  if (file.content.encoding === "text") {
    return new TextEncoder().encode(file.content.text).buffer;
  }
  return base64ToArrayBuffer(file.content.data);
}

export async function listNotebookFilesFromIDB(): Promise<StoredNotebookFile[]> {
  const fileKeys = await keys(fileStore);
  const files = await Promise.all(
    fileKeys.map((key) => getNotebookFileFromIDB(String(key))),
  );
  return files
    .filter((file): file is StoredNotebookFile => Boolean(file))
    .sort((a, b) => b.createdAt - a.createdAt);
}

export function deleteNotebookFileFromIDB(fileID: string): Promise<void> {
  return del(fileID, fileStore);
}

export function detachFileIdFromNotebooks(
  notebooks: Notebook[],
  fileID: string,
): Notebook[] {
  return notebooks.map((notebook) => {
    const fileIds = notebook.fileIds ?? [];
    if (!fileIds.includes(fileID)) return notebook;
    return {
      ...notebook,
      fileIds: fileIds.filter((id) => id !== fileID),
      updatedAt: Date.now(),
    };
  });
}

export function fileAsDataUrl(file: StoredNotebookFile): string {
  if (file.content.encoding === "base64") {
    return `data:${file.mimeType};base64,${file.content.data}`;
  }
  return `data:${file.mimeType};base64,${textToBase64(file.content.text)}`;
}

export function fileTextContent(file: StoredNotebookFile): string | null {
  return file.content.encoding === "text" ? file.content.text : null;
}

export function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  const units = ["KB", "MB", "GB"];
  let size = bytes / 1024;
  let unit = 0;
  while (size >= 1024 && unit < units.length - 1) {
    size /= 1024;
    unit++;
  }
  return `${size >= 10 ? size.toFixed(0) : size.toFixed(1)} ${units[unit]}`;
}

function getFileExtension(name: string): string {
  const match = name.toLowerCase().match(/\.([^.]+)$/);
  return match?.[1] ?? "";
}

function normalizeMime(name: string, mimeType: string): string {
  const trimmed = mimeType.trim().toLowerCase();
  if (trimmed) return trimmed;
  return EXTENSION_MIME[getFileExtension(name)] ?? "application/octet-stream";
}

function isTextLike(name: string, mimeType: string): boolean {
  const mime = mimeType.toLowerCase();
  if (TEXT_MIME_PREFIXES.some((prefix) => mime.startsWith(prefix))) return true;
  if (TEXT_MIME_TYPES.has(mime)) return true;
  return ["csv", "json", "md", "txt", "xml", "yaml", "yml"].includes(
    getFileExtension(name),
  );
}

async function arrayBufferToBase64(buffer: ArrayBuffer): Promise<string> {
  return new Promise((resolve, reject) => {
    const blob = new Blob([buffer]);
    const reader = new FileReader();
    reader.onload = () => {
      const result = String(reader.result ?? "");
      resolve(result.slice(result.indexOf(",") + 1));
    };
    reader.onerror = () => reject(reader.error);
    reader.readAsDataURL(blob);
  });
}

function textToBase64(text: string): string {
  const bytes = new TextEncoder().encode(text);
  let binary = "";
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte);
  });
  return btoa(binary);
}

function base64ToArrayBuffer(base64: string): ArrayBuffer {
  const binary = atob(base64);
  const bytes = new Uint8Array(binary.length);
  for (let i = 0; i < binary.length; i++) {
    bytes[i] = binary.charCodeAt(i);
  }
  return bytes.buffer;
}
