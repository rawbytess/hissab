export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function printImmediate(item: any) {
  console.log(JSON.parse(JSON.stringify(item)));
}

/*
TODO:
- Fix flickering issue in the app when AI expression is present in free mode.
- Implement constants like pi, e, etc.
 */
