import React from "react";

export function useLocalStorage<T>(
  key: string,
  initialValue: T,
): [T, (value: T | ((prevState: T) => T)) => void] {
  const getSnapshot = (): string | null => getLocalStorageItem(key);
  const store = React.useSyncExternalStore(
    useLocalStorageSubscribe,
    getSnapshot,
    getLocalStorageServerSnapshot,
  );

  const setState = React.useCallback(
    (valueOrFn: T | ((prevState: T) => T)) => {
      try {
        const currentStateString = getLocalStorageItem(key);
        const currentParsedState: T =
          currentStateString !== null
            ? JSON.parse(currentStateString)
            : initialValue;

        const nextState =
          typeof valueOrFn === "function"
            ? (valueOrFn as (prevState: T) => T)(currentParsedState)
            : valueOrFn;

        if (nextState === undefined || nextState === null) {
          removeLocalStorageItem(key);
        } else {
          setLocalStorageItem(key, nextState);
        }
      } catch (e) {
        console.warn(`Error setting localStorage key “${key}”:`, e);
      }
    },
    [key, initialValue],
  );

  React.useEffect(() => {
    if (
      getLocalStorageItem(key) === null &&
      typeof initialValue !== "undefined"
    ) {
      setLocalStorageItem(key, initialValue);
    }
  }, [key, initialValue]);

  const parsedStoreValue: T = store !== null ? JSON.parse(store) : initialValue;

  return [parsedStoreValue, setState];
}
function getLocalStorageItem(key: string): string | null {
  if (typeof window === "undefined") return null; // Basic SSR check
  return window.localStorage.getItem(key);
}

function setLocalStorageItem(key: string, value: any): void {
  if (typeof window === "undefined") return;
  window.localStorage.setItem(key, JSON.stringify(value));
  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      newValue: JSON.stringify(value),
      storageArea: window.localStorage,
    }),
  );
}

function removeLocalStorageItem(key: string): void {
  if (typeof window === "undefined") return;
  window.localStorage.removeItem(key);
  window.dispatchEvent(
    new StorageEvent("storage", {
      key,
      newValue: null,
      storageArea: window.localStorage,
    }),
  );
}

function useLocalStorageSubscribe(callback: () => void): () => void {
  if (typeof window === "undefined") return () => {}; // No-op for SSR
  window.addEventListener("storage", callback);
  return () => window.removeEventListener("storage", callback);
}

function getLocalStorageServerSnapshot(): string | null {
  return null;
}
