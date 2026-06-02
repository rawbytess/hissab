import { createStore, get, set } from "idb-keyval";

const aiCacheStore = createStore("hissab-cache", "ai-cache");

export function saveAICacheToIDB(cacheID: string, cacheData: any) {
  return set(cacheID, cacheData, aiCacheStore);
}

export function getAICacheFromIDB(cacheID: string): Promise<any | undefined> {
  return get(cacheID, aiCacheStore);
}
