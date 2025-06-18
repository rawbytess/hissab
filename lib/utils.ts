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
