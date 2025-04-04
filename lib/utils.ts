export async function sleep(ms: number) {
  return new Promise((resolve) => setTimeout(resolve, ms));
}

export function printImmediate(item: any) {
  console.log(JSON.parse(JSON.stringify(item)));
}
