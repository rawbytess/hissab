import { openDB } from "idb";

export type StoreConfig = {
  name: string;
  options?: IDBObjectStoreParameters;
  indexes?: {
    name: string;
    keyPath: string | string[];
    options?: IDBIndexParameters;
  }[];
};

const aiCacheStore: StoreConfig[] = [
  {
    name: "prompt-cache",
  },
];

const notesStore: StoreConfig[] = [
  {
    name: "notes",
    options: { keyPath: "id" },
    indexes: [
      {
        name: "type",
        keyPath: "type",
        options: { unique: false },
      },
    ],
  },
];

export const STORES: StoreConfig[] = [...aiCacheStore, ...notesStore];

function createIDBStores(
  dbName: string,
  version: number,
  stores: StoreConfig[] = STORES,
) {
  return openDB(dbName, version, {
    upgrade: (db) => {
      // Create any missing stores and indexes
      for (const s of stores) {
        if (!db.objectStoreNames.contains(s.name)) {
          const os = db.createObjectStore(s.name, s.options);
          if (s.indexes?.length) {
            for (const idx of s.indexes) {
              if (!os.indexNames.contains(idx.name)) {
                os.createIndex(idx.name, idx.keyPath, idx.options);
              }
            }
          }
        }
      }
    },
  });
}
