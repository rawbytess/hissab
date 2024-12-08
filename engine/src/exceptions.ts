class UserError extends Error {
  private code: number;

  constructor(code: number) {
    super("User Error");
    this.name = this.constructor.name;
    this.code = code;
  }
}

class ReportError extends Error {
  message: string;

  constructor(message: string) {
    super("Report Error");
    this.name = this.constructor.name;
    this.message = message;
  }
}

class UnhandledError extends Error {
  private code: number;

  constructor(code: number) {
    super("Unhandled Error");
    this.name = this.constructor.name;
    this.code = code;
  }
}

export { UserError, UnhandledError, ReportError };
