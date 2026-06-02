import { type ClassValue, clsx } from "clsx";
import { twMerge } from "tailwind-merge";
import { CustomError, run } from "../../../lib/errors.ts";

export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export function debounce<T extends (...args: any[]) => any>(
  func: T,
  wait: number,
): (...args: Parameters<T>) => void {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (...args: Parameters<T>): void => {
    // Clear any existing timeout to reset the debounce timer
    if (timeoutId !== null) {
      clearTimeout(timeoutId);
    }

    // Set a new timeout
    timeoutId = setTimeout(() => {
      // Execute the original function after the wait period
      func(...args);
    }, wait);
  };
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
      credentials: "include",
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
