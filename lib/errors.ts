import { date } from "zod";

type MaybePromise<T> = T | Promise<T>;
type FunctionReturningMaybePromise<T> = () => MaybePromise<T>;
type SuccessResult<T> = { failed: false; data: T };
type ErrorResult<E> = { failed: true; error: E };
type RunResult<T, E> = SuccessResult<T> | ErrorResult<E>;

export async function run<T, E = CustomError>(
  input: MaybePromise<T> | FunctionReturningMaybePromise<T>,
): Promise<RunResult<T, E>> {
  try {
    const promise: MaybePromise<T> =
      typeof input === "function"
        ? (input as FunctionReturningMaybePromise<T>)()
        : input;
    const data = await promise;
    return { failed: false, data };
  } catch (error: unknown) {
    return { failed: true, error: error as E };
  }
}

export async function wrap<T>(fn: () => T | Promise<T>): Promise<T> {
  try {
    // Execute the function. If it's sync, `result` will be the value.
    // If it's async, `result` will be a Promise.
    const result = fn();

    // `await` handles both cases:
    // - If `result` is a value, it returns the value immediately.
    // - If `result` is a Promise, it waits for it to resolve or reject.
    // If the awaited promise rejects, it will throw an error, which our catch block will handle.
    return await result;
  } catch (error) {
    // Catches synchronous errors from `fn()` or errors from a rejected promise.
    // Re-throwing the error here causes the Promise returned by the `wrapper`
    // async function to be rejected.
    throw error;
  }
}

export type ErrorName =
  | "FetchNetwork"
  | "FetchResponse"
  | "GeminiGenContent"
  | "HissabExpJSON"
  | "NaturalAnswerJSON"
  | "EmptyPrompt"
  | "NotLoggedIn"
  | "NotSubscribed"
  | "Parse"
  | "Unknown";

export class CustomError extends Error {
  statusCode: number;
  userMessage: string;
  constructor(
    name: ErrorName,
    message: string,
    userMessage: string,
    statusCode = 500,
  ) {
    super(message);
    this.name = name;
    this.statusCode = statusCode;
    this.userMessage = userMessage;
  }
}
