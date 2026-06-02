import { lstatSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import spacetime from "spacetime";
import { doLex, doParse } from "../../src";
import { UserError } from "../../src/exceptions";

describe("Valid Expressions", () => {
  const validTestDir = "./tests/expression/valid/";
  beforeEach(() => {
    const mockTimezone = "America/Toronto";

    // @ts-expect-error
    jest.spyOn(Intl, "DateTimeFormat").mockImplementation(() => ({
      resolvedOptions: () => ({
        timeZone: mockTimezone,
      }),
    }));
  });

  afterEach(() => {
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
      const [expr, result] = JSON.parse(exp);

      test(`Valid Expression: ${filename}:${i + 1}`, async () => {
        const tokens = doLex(expr, {}, 1);
        const res = await doParse(tokens);
        expect(res.result).toStrictEqual(result);
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
