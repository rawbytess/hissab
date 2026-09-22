// One-time import of calculations saved by the 3.x extension, which bundled the
// full notebook app. Its notebooks live in the extension's own origin, so the
// 4.x popup can still read them after the upgrade:
//
//   - IndexedDB "hissab" / "notes" (idb-keyval) — `Notebook` records, and
//     pre-notebook `LegacyPage` records that were never re-saved
//   - localStorage "hissab-pages" — `LegacyPage[]` from builds before IndexedDB
//   - localStorage "hissab-last-notebook-id" — the notebook the popup last showed
//
// Shapes mirror app/src/lib/atoms/notebooks.ts. Everything here is read-only:
// the old stores are never written to, and a missing database is never created.

const LEGACY_DB = "hissab";
const LEGACY_STORE = "notes";
const LEGACY_PAGES_KEY = "hissab-pages";
const LAST_NOTEBOOK_KEY = "hissab-last-notebook-id";

type LegacyRecord = {
  id?: unknown;
  type?: unknown;
  content?: unknown;
  updatedAt?: unknown;
  cells?: unknown;
};

/**
 * The calculations the old popup was showing — the last-opened notebook, else
 * the most recently updated one — or `null` when there is nothing to import.
 * A notebook's expression cells are joined into one document.
 */
export async function readLegacyContent(): Promise<string | null> {
  const records = [...readLegacyPages(), ...(await readLegacyNotes())];
  const candidates = records
    .map((record) => ({ record, content: contentOf(record) }))
    .filter(
      (c): c is { record: LegacyRecord; content: string } =>
        c.content !== null && c.content.trim() !== "",
    );
  if (candidates.length === 0) return null;

  const lastId = safeGetItem(LAST_NOTEBOOK_KEY);
  const lastOpened = candidates.find((c) => c.record.id === lastId);
  if (lastOpened) return lastOpened.content;

  const updatedAt = (r: LegacyRecord) =>
    typeof r.updatedAt === "number" ? r.updatedAt : 0;
  candidates.sort((a, b) => updatedAt(b.record) - updatedAt(a.record));
  return candidates[0].content;
}

function contentOf(record: LegacyRecord): string | null {
  if (record.type === "chat") return null;
  if (Array.isArray(record.cells)) {
    const parts = record.cells
      .filter(
        (cell): cell is { kind: "expressions"; content: string } =>
          typeof cell === "object" &&
          cell !== null &&
          cell.kind === "expressions" &&
          typeof cell.content === "string" &&
          cell.content.trim() !== "",
      )
      .map((cell) => cell.content);
    return parts.length > 0 ? parts.join("\n\n") : null;
  }
  return typeof record.content === "string" ? record.content : null;
}

function readLegacyPages(): LegacyRecord[] {
  const raw = safeGetItem(LEGACY_PAGES_KEY);
  if (!raw) return [];
  try {
    const parsed: unknown = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

async function readLegacyNotes(): Promise<LegacyRecord[]> {
  if (typeof indexedDB === "undefined") return [];
  // Cheap existence check first; `onupgradeneeded` below is the backstop for
  // browsers without `databases()`.
  try {
    const dbs = await indexedDB.databases?.();
    if (dbs && !dbs.some((db) => db.name === LEGACY_DB)) return [];
  } catch {
    // Fall through to the open() probe.
  }

  const db = await new Promise<IDBDatabase | null>((resolve) => {
    let request: IDBOpenDBRequest;
    try {
      request = indexedDB.open(LEGACY_DB);
    } catch {
      resolve(null);
      return;
    }
    // Only fires when the database doesn't exist yet. Abort so the probe
    // doesn't leave an empty "hissab" database behind; that routes to onerror.
    request.onupgradeneeded = () => request.transaction?.abort();
    request.onerror = () => resolve(null);
    request.onblocked = () => resolve(null);
    request.onsuccess = () => resolve(request.result);
  });
  if (!db) return [];

  try {
    if (!db.objectStoreNames.contains(LEGACY_STORE)) return [];
    return await new Promise<LegacyRecord[]>((resolve) => {
      const request = db
        .transaction(LEGACY_STORE, "readonly")
        .objectStore(LEGACY_STORE)
        .getAll();
      request.onsuccess = () =>
        resolve(
          request.result.filter(
            (value): value is LegacyRecord =>
              typeof value === "object" && value !== null,
          ),
        );
      request.onerror = () => resolve([]);
    });
  } catch {
    return [];
  } finally {
    db.close();
  }
}

function safeGetItem(key: string): string | null {
  try {
    return localStorage.getItem(key);
  } catch {
    return null;
  }
}
