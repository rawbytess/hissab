import { readdirSync, lstatSync, readFileSync } from "fs";
import { resolve } from "path";
import { UserError } from "../../src/exceptions";
import spacetime from "spacetime";
import { doLex, doParse } from "../../src";

describe("Valid Expressions", () => {
  const validTestDir = "./tests/expression/valid/";
  beforeEach(() => {
    const mockTimezone = "America/Toronto";

    // @ts-ignore
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

describe("Valid Pro Expressions", () => {
  const validTestDir = "./tests/expression/valid/";
  beforeEach(() => {
    const mockTimezone = "America/Toronto";
    // @ts-ignore
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

      const expList = JSON.parse(exp);
      const [expr, _, result] = expList;

      test(`Valid Pro Expression: ${filename}:${i + 1}`, async () => {
        const tokens = doLex(expr, {}, 1);
        const res = await doParse(tokens, true);
        // res.formatResult();

        expect(res.result).toStrictEqual(result);
        // expect(res.unit?.originalValue).toStrictEqual(unit);
      });
    });
  });
});

describe("Valid Pro Only Expressions", () => {
  const validTestDir = "./tests/expression/pro/";

  readdirSync(validTestDir).forEach((file) => {
    if (lstatSync(resolve(validTestDir, file)).isDirectory()) {
      return;
    }
    const filename = file.split(".")[0];
    const validExp = readFileSync(validTestDir + file, { encoding: "utf8" });
    const exps = validExp.split(/\r?\n/);

    exps.forEach((exp, i) => {
      if (exp === "" || exp[0] === "#") return;

      const expList = JSON.parse(exp);
      const [expr, result] = expList;

      test(`Valid Pro Only Expression: ${filename}:${i + 1}`, async () => {
        const tokens = doLex(expr, {}, 1);
        const res = await doParse(tokens, true);
        // res.formatResult();

        expect(res.result).toStrictEqual(result);
        // expect(res.unit?.originalValue).toStrictEqual(unit);
      });
    });
  });
});

describe("Pro Expressions for Non Pro", () => {
  const validTestDir = "./tests/expression/pro/";
  readdirSync(validTestDir).forEach((file) => {
    if (lstatSync(resolve(validTestDir, file)).isDirectory()) {
      return;
    }
    const filename = file.split(".")[0];
    const validExp = readFileSync(validTestDir + file, { encoding: "utf8" });
    const exps = validExp.split(/\r?\n/);

    exps.forEach((exp, i) => {
      if (exp === "" || exp[0] === "#") return;
      const expList = JSON.parse(exp);
      const [expr, result] = expList;
      test(`Invalid Pro Only Expression: ${filename}:${i + 1}`, async () => {
        const tokens = doLex(expr, {}, 1);
        await expect(doParse(tokens)).rejects.toThrow(UserError);
      });
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
 - pro specific results
 - negative tests for non-pro
 - references and variables extensive
 */
