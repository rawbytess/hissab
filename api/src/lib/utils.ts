import { add, format } from "date-fns";
import { CustomError, run } from "~lib/errors";

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

  let targetDate: Date;
  if (duration) {
    targetDate = add(baseDate, duration);
  } else {
    targetDate = baseDate;
  }
  return format(targetDate, "yyyy-MM-dd HH:mm:ss") + "+00";
}

export function addDaysToDate(d: Date, days: number): Date {
  const date = d.setDate(d.getDate() + days);
  return new Date(date);
}

export function addDaysToDateStr(date: string, days: number): string {
  const d = new Date(date);
  d.setDate(d.getDate() + days);
  return d.toISOString().split("T")[0]; // Return in YYYY-MM-DD format
}

export async function fetchPost<T>(
  url: string,
  body: unknown,
  headers?: HeadersInit,
): Promise<T> {
  const result = await run(
    fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        ...headers,
      },
      body: JSON.stringify(body),
    }),
  );
  if (result.failed) {
    throw new CustomError(
      "FetchNetwork",
      result.error.message,
      "Failed to reach the server",
    );
  }

  if (!result.data.ok) {
    const text = await result.data.text();
    throw new CustomError(
      "FetchResponse",
      result.data.statusText,
      text,
      result.data.status,
    );
  }
  return result.data.json();
}
