export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function print(item: any, pre = "", post = "") {
  console.log(pre, JSON.stringify(item), null, 2, post);
}

/*
TODO:
- Implement constants like pi, e, etc.
 */

export function safeGet<T>(obj: any, path: string): T | null {
  if (
    typeof obj !== "object" ||
    obj === null ||
    typeof path !== "string" ||
    path === ""
  ) {
    return null;
  }

  const keys = path.split(".");
  let current: any = obj;

  for (const key of keys) {
    if (current === null || current === undefined) {
      return null;
    }
    current = current[key];
  }
  return current;
}
