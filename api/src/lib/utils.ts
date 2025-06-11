import { format, add } from "date-fns";

export function hexToUint8Array(hex: string) {
  const x = hex.match(/.{1,2}/g);
  if (!x) {
    return new Uint8Array();
  }
  return new Uint8Array(x.map((byte) => parseInt(byte, 16)));
}

export function log(message: {}, type: "info" | "warn" | "error" = "error") {
  if (type === "error") {
    console.error(message);
  } else if (type === "warn") {
    console.warn(message);
  } else {
    console.log(message);
  }
}

export function getFormattedUtcDateString(
  duration: {
    years?: number;
    months?: number;
    days?: number;
    hours?: number;
    minutes?: number;
    seconds?: number;
  } | null = null,
): string {
  const baseDate = new Date();

  let targetDate;
  if (duration) {
    targetDate = add(baseDate, duration);
  } else {
    targetDate = baseDate;
  }
  return format(targetDate, "yyyy-MM-dd HH:mm:ss") + "+00";
}
