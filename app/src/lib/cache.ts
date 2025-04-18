import { AIFormatResponseType, AIRequest } from "../../../lib/types/AITypes.ts";

export class LRUCache<T extends object> {
  private cache: Map<string, T>;
  private capacity: number;
  private storageKey: string;

  constructor(capacity: number, storageKey: string) {
    this.capacity = capacity;
    this.cache = new Map();
    this.storageKey = storageKey;
    this.loadFromLocalStorage();
  }

  private loadFromLocalStorage(): void {
    const storedData = localStorage.getItem(this.storageKey);
    if (storedData) {
      try {
        const parsedData: [string, T][] = JSON.parse(storedData);
        this.cache = new Map(parsedData);
        this.rebalanceCache();
      } catch (error) {
        console.error("Error loading LRU cache from localStorage:", error);
      }
    }
  }

  private saveToLocalStorage(): void {
    const data = Array.from(this.cache.entries());
    localStorage.setItem(this.storageKey, JSON.stringify(data));
  }

  private rebalanceCache(): void {
    while (this.cache.size > this.capacity) {
      const oldestKey = this.cache.keys().next().value;
      if (oldestKey !== undefined) {
        this.cache.delete(oldestKey);
      }
    }
    this.saveToLocalStorage();
  }

  get(key: string): T | undefined {
    if (!this.cache.has(key)) {
      return undefined;
    }
    const value = this.cache.get(key)!;
    this.cache.delete(key);
    this.cache.set(key, value);
    this.saveToLocalStorage();
    return value;
  }

  set(key: string, value: T): void {
    if (this.cache.has(key)) {
      this.cache.delete(key);
    }
    this.cache.set(key, value);
    this.rebalanceCache();
    this.saveToLocalStorage();
  }

  has(key: string): boolean {
    return this.cache.has(key);
  }

  clear(): void {
    this.cache.clear();
    this.saveToLocalStorage();
  }

  size(): number {
    return this.cache.size;
  }

  entries(): IterableIterator<[string, T]> {
    return this.cache.entries();
  }

  forEach(
    callbackfn: (value: T, key: string, map: Map<string, T>) => void,
    thisArg?: any,
  ): void {
    this.cache.forEach(callbackfn, thisArg);
  }

  keys(): IterableIterator<string> {
    return this.cache.keys();
  }

  values(): IterableIterator<T> {
    return this.cache.values();
  }

  delete(key: string): boolean {
    const deleted = this.cache.delete(key);
    this.saveToLocalStorage();
    return deleted;
  }
  resize(newCapacity: number): void {
    this.capacity = newCapacity;
    this.rebalanceCache();
  }
}

export const aicache = new LRUCache<
  AIFormatResponseType & { error: string | null }
>(500, "ai-cache");
