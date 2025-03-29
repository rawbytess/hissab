export function tryCatch(
  fn: (...args: any[]) => any,
  ...args: any[]
): [error: Error, result?: any];

export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
