import { lstatSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import spacetime from "spacetime";
import { doLex, doParse, type ParseResult, type Variables } from "../../src";
import { UserError } from "../../src/exceptions";

// Every fake-able API except `Date`, so only the clock is frozen.
const REAL_TIMERS = [
  "hrtime",
  "nextTick",
  "performance",
  "queueMicrotask",
  "requestAnimationFrame",
  "cancelAnimationFrame",
  "requestIdleCallback",
  "cancelIdleCallback",
  "setImmediate",
  "clearImmediate",
  "setInterval",
  "clearInterval",
  "setTimeout",
  "clearTimeout",
] as const;

describe("Valid Expressions", () => {
  const validTestDir = "./tests/expression/valid/";
  beforeEach(() => {
    // Fixed "now", so `today` and year-less dates (`25 dec` = this year) are
    // deterministic. Live-clock checks stay in datetime_live.txt.
    jest.useFakeTimers({
      now: new Date("2026-09-22T12:00:00Z"),
      doNotFake: [...REAL_TIMERS],
    });
    const mockTimezone = "America/Toronto";

    // @ts-expect-error
    jest.spyOn(Intl, "DateTimeFormat").mockImplementation(() => ({
      resolvedOptions: () => ({
        timeZone: mockTimezone,
      }),
    }));
  });

  afterEach(() => {
    jest.useRealTimers();
    jest.restoreAllMocks();
  });

  readdirSync(validTestDir).forEach((file) => {
    if (lstatSync(resolve(validTestDir, file)).isDirectory()) {
      return;
    }
    const filename = file.split(".")[0];
    const validExp = readFileSync(validTestDir + file, { encoding: "utf8" });
    const exps = validExp.split(/\r?\n/);

    exps.forEach((exp, i) => {
      if (exp === "" || exp[0] === "#") return;
      // `[expr, result]`, or `[line1, line2, …, result]` for a multi-line case:
      // the lines share one scope — labels, `line<N>`/`l<N>` and `prev`, wired
      // the way lib/calculateExpressions.ts does — and the last line's result
      // is checked.
      const lines: string[] = JSON.parse(exp);
      const result = lines.pop();

      test(`Valid Expression: ${filename}:${i + 1}`, async () => {
        const variables: Variables = {};
        let res: ParseResult | undefined;
        for (const [l, line] of lines.entries()) {
          const n = l + 1;
          if (variables[`line${n - 1}`])
            variables[`prev${n}`] = variables[`line${n - 1}`];
          res = await doParse(doLex(line, variables, n));
          if (res.meta.variableName)
            variables[res.meta.variableName] = res.resultToken;
          variables[`line${n}`] = res.resultToken;
          variables[`l${n}`] = res.resultToken;
        }
        expect(res?.result).toStrictEqual(result);
      });
    });
  });
});

describe("Invalid Expressions", () => {
  const validTestDir = "./tests/expression/invalid/";

  readdirSync(validTestDir).forEach((file) => {
    if (lstatSync(resolve(validTestDir, file)).isDirectory()) {
      return;
    }
    const filename = file.split(".")[0];
    const validExp = readFileSync(validTestDir + file, { encoding: "utf8" });
    const exps = validExp.split(/\r?\n/);

    exps.forEach((exp, i) => {
      if (exp === "" || exp[0] === "#") return;

      test(`Invalid Expression: ${filename}:${i + 1}`, async () => {
        const tokens = doLex(exp, {}, 1);
        await expect(doParse(tokens)).rejects.toThrow(UserError);
      });
    });
  });
});

describe("UserError messages", () => {
  test("maps a known code to a descriptive message and keeps the code", () => {
    const err = new UserError(2334);
    expect(err.code).toStrictEqual(2334);
    expect(err.message).not.toStrictEqual("User Error");
    expect(err.message.toLowerCase()).toContain("convert");
  });

  test("falls back to a generic message that includes the code", () => {
    const err = new UserError(999999);
    expect(err.message).not.toStrictEqual("User Error");
    expect(err.message).toContain("999999");
  });

  test("incompatible unit conversion surfaces a readable message", async () => {
    const tokens = doLex("10 meter to kilogram", {}, 1);
    await expect(doParse(tokens)).rejects.toThrow(/[a-z]{4,}/i);
    await expect(doParse(tokens)).rejects.not.toThrow("User Error");
  });
});

describe("Date and Time live Expressions", () => {
  const validTestDir = "./tests/expression/";
  const file = "datetime_live.txt";
  const validExp = readFileSync(validTestDir + file, { encoding: "utf8" });
  const exps = validExp.split(/\r?\n/);

  exps.forEach((exp, i) => {
    if (exp === "" || exp[0] === "#") return;

    test(`Live datetime:${i + 1}`, async () => {
      const tokens = doLex(exp, {}, 1);
      const res = await doParse(tokens);
      expect(spacetime(res.result).isValid).toBeTruthy();
    });
  });
});

/*
   TODO:
 - original values,
 - multi word strings,
 - extensive units,
 - more complex expressions,
 - percentage with units,
 - functions extensive,
 - monthly yearly,
 - 1 year to months etc,
 - complex/multiple binary values,
 - precision of numbers <1,
 - exp like 5 meter 30 cm
 - other number systems operations with multiple operands
 - references and variables extensive
 */
