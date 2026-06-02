import { userErrorMessages } from "./errorMessages";

const GENERIC_USER_ERROR =
  "This expression couldn't be evaluated — check the syntax, units, and function names.";

class UserError extends Error {
  readonly code: number;
  constructor(code: number) {
    super(
      userErrorMessages[code]
        ? userErrorMessages[code]
        : `${GENERIC_USER_ERROR} (code ${code})`,
    );
    this.name = this.constructor.name;
    this.code = code;
  }
}

class UnhandledError extends Error {
  readonly code: number;
  constructor(code: number) {
    super(
      `Hissab hit an unexpected error while evaluating this expression. (code ${code})`,
    );
    this.name = this.constructor.name;
    this.code = code;
  }
}

export { UnhandledError, UserError };
