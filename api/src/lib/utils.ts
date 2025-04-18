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
  "AI Lite": "gemini-2.0-flash-lite",
  "AI Plus": "gemini-2.0-flash",
};

export function log(message: {}, type: "info" | "warn" | "error" = "error") {
  if (type === "error") {
    console.error(message);
  } else if (type === "warn") {
    console.warn(message);
  } else {
    console.log(message);
  }
}
