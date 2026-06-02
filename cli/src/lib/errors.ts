export function formatError(e: unknown): string {
  if (e instanceof Error) {
    const name = e.name && e.name !== "Error" ? `${e.name}: ` : "";
    return `${name}${e.message}`;
  }
  if (typeof e === "string") return e;
  try {
    return JSON.stringify(e);
  } catch {
    return String(e);
  }
}

export function dieWith(e: unknown): never {
  console.error(formatError(e));
  process.exit(1);
}
