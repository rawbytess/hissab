export function hexToUint8Array(hex: string) {
  const x = hex.match(/.{1,2}/g);
  if (!x) {
    return new Uint8Array();
  }
  return new Uint8Array(x.map((byte) => parseInt(byte, 16)));
}
