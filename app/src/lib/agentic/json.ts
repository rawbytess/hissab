/**
 * Parse a JSON object from an LLM response, tolerating ```json code fences.
 * Returns `{}` on failure so callers can normalize a missing/invalid result
 * instead of throwing.
 */
export function parseJsonObject(raw: string): unknown {
  const trimmed = raw.trim();
  const withoutFence = trimmed
    .replace(/^```(?:json)?\s*/i, "")
    .replace(/\s*```$/i, "");
  try {
    return JSON.parse(withoutFence);
  } catch {
    return {};
  }
}
