class UserError extends Error {
  constructor(code: number) {
    super("User Error");
    this.name = this.constructor.name;
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
  constructor(code: number) {
    super("Unhandled Error");
    this.name = this.constructor.name;
  }
}

export { UserError, UnhandledError, ReportError };
