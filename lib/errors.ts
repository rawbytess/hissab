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
