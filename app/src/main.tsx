import { createRoot } from "react-dom/client";
import App from "./App.tsx";
import "./index.css";
import "./styles/workbook.css";
import React from "react";

const LOCAL_LLM_CLEANUP_KEY = "hissab-local-llm-cleanup-v1";

void cleanupRemovedLocalLLMArtifacts();

createRoot(document.getElementById("root")!).render(<App />);

async function cleanupRemovedLocalLLMArtifacts() {
  if (typeof window === "undefined") return;
  if (localStorage.getItem(LOCAL_LLM_CLEANUP_KEY) === "done") return;

  try {
    await Promise.all([
      typeof caches === "undefined"
        ? Promise.resolve(false)
        : caches.delete("transformers-cache"),
      deleteDatabase("hissab-local-llm"),
    ]);
  } catch (error) {
    console.warn("Failed to clean up removed local LLM artifacts:", error);
  } finally {
    localStorage.setItem(LOCAL_LLM_CLEANUP_KEY, "done");
  }
}

function deleteDatabase(name: string): Promise<void> {
  if (typeof indexedDB === "undefined") return Promise.resolve();

  return new Promise((resolve) => {
    const request = indexedDB.deleteDatabase(name);
    request.onsuccess = () => resolve();
    request.onerror = () => resolve();
    request.onblocked = () => resolve();
  });
}
