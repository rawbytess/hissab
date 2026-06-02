const INDEXED_DB_STORES = [
  { dbName: "hissab", storeName: "notes" },
  { dbName: "hissab-inline", storeName: "inline-llm-settings" },
  { dbName: "hissab-files", storeName: "files" },
  { dbName: "hissab-mcp", storeName: "mcp-data" },
  { dbName: "hissab-cache", storeName: "ai-cache" },
] as const;

const LEGACY_INDEXED_DB_NAMES = ["hissab-local-llm"] as const;
const LEGACY_CACHE_NAMES = ["transformers-cache"] as const;

type IDBFactoryWithDatabases = IDBFactory & {
  databases?: () => Promise<Array<{ name?: string | null }>>;
};

export async function clearAllLocalData(): Promise<void> {
  if (typeof window === "undefined") return;

  const results = await Promise.allSettled([
    clearKnownIndexedDBStores(),
    clearCacheStorage(),
  ]);

  clearWebStorage();
  await deleteKnownIndexedDBDatabases();

  const failed = results.find((result) => result.status === "rejected");
  if (failed?.status === "rejected") {
    throw failed.reason;
  }
}

async function clearKnownIndexedDBStores(): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  await Promise.all(INDEXED_DB_STORES.map(clearIndexedDBObjectStore));
}

async function clearIndexedDBObjectStore({
  dbName,
  storeName,
}: {
  dbName: string;
  storeName: string;
}): Promise<void> {
  const db = await openIndexedDB(dbName);
  if (!db) return;

  try {
    if (!db.objectStoreNames.contains(storeName)) return;

    await new Promise<void>((resolve, reject) => {
      const transaction = db.transaction(storeName, "readwrite");
      transaction.objectStore(storeName).clear();
      transaction.oncomplete = () => resolve();
      transaction.onerror = () => reject(transaction.error);
      transaction.onabort = () => reject(transaction.error);
    });
  } finally {
    db.close();
  }
}

function openIndexedDB(dbName: string): Promise<IDBDatabase | undefined> {
  return new Promise((resolve) => {
    const request = indexedDB.open(dbName);
    request.onsuccess = () => resolve(request.result);
    request.onerror = () => resolve(undefined);
    request.onblocked = () => resolve(undefined);
  });
}

async function deleteKnownIndexedDBDatabases(): Promise<void> {
  if (typeof indexedDB === "undefined") return;

  const databaseNames = await getKnownIndexedDBNames();
  await Promise.all(databaseNames.map((name) => deleteIndexedDBDatabase(name)));
}

async function getKnownIndexedDBNames(): Promise<string[]> {
  const names = new Set<string>([
    ...INDEXED_DB_STORES.map(({ dbName }) => dbName),
    ...LEGACY_INDEXED_DB_NAMES,
  ]);
  const idb = indexedDB as IDBFactoryWithDatabases;

  if (idb.databases) {
    try {
      const databases = await idb.databases();
      for (const database of databases) {
        const name = database.name;
        if (name?.startsWith("hissab")) names.add(name);
      }
    } catch (error) {
      console.warn("Failed to list IndexedDB databases:", error);
    }
  }

  return Array.from(names);
}

function deleteIndexedDBDatabase(name: string): Promise<void> {
  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}

async function clearCacheStorage(): Promise<void> {
  if (typeof caches === "undefined") return;

  const cacheNames = await caches.keys();
  await Promise.all(
    cacheNames
      .filter(
        (name) =>
          name.includes("hissab") ||
          name.startsWith("workbox-") ||
          LEGACY_CACHE_NAMES.includes(
            name as (typeof LEGACY_CACHE_NAMES)[number],
          ),
      )
      .map((name) => caches.delete(name)),
  );
}

function clearWebStorage() {
  try {
    localStorage.clear();
  } catch (error) {
    console.warn("Failed to clear localStorage:", error);
  }

  try {
    sessionStorage.clear();
  } catch (error) {
    console.warn("Failed to clear sessionStorage:", error);
  }
}
