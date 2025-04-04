export function hexToUint8Array(hex: string) {
  const x = hex.match(/.{1,2}/g);
  if (!x) {
    return new Uint8Array();
  }
  return new Uint8Array(x.map((byte) => parseInt(byte, 16)));
}

export const modelMap: {
  "AI Lite": string;
  "AI Plus": string;
} = {
  "AI Lite": "gemini-1.0-flash-lite",
  "AI Plus": "gemini-2.0-flash",
};
