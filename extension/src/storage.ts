import { readLegacyContent } from "./legacyImport.ts";

// The popup's single document. Deliberately a different key from anything the
// 3.x extension wrote, so "never saved" (null) is distinguishable from "the
// user cleared the editor" ("") and the legacy import only ever runs once.
const DOC_KEY = "hissab-extension-doc";

const SAMPLE = `// Welcome to Hissab — write maths the way you'd say it.
// Results show on the right; double-click one to copy it.
5 km to miles
20% of 150
price = 1299
tax = 18% of price
price + tax
today + 3 weeks
2 hours + 45 minutes to minutes
255 to hex
#ff8800
draw(sin(x), cos(x))
`;

let lastSaved: string | null = null;

/**
 * The saved document, or `null` if nothing has been saved yet. Synchronous so
 * the popup can mount the editor with its content before the first paint.
 */
export function readSavedContent(): string | null {
  try {
    const saved = localStorage.getItem(DOC_KEY);
    if (saved !== null) lastSaved = saved;
    return saved;
  } catch {
    // Storage unavailable — treat as a first run.
    return null;
  }
}

/** First run only: calculations imported from the 3.x extension, else the sample. */
export async function loadFirstRunContent(): Promise<string> {
  return (await readLegacyContent()) ?? SAMPLE;
}

/**
 * Persist the document. The editor calls this on every change *and* every
 * cursor move, and the popup can be closed at any instant, so writes are
 * synchronous (no debounce) and unchanged content is skipped. Never throws: a
 * throw here would reject the editor's result pass and stop results rendering.
 */
export function saveContent(content: string) {
  if (content === lastSaved) return;
  try {
    localStorage.setItem(DOC_KEY, content);
    lastSaved = content;
  } catch {
    // Quota or storage disabled — keep editing; the next change retries.
  }
}
