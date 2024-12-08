import { doLex, doParse } from "../../src";
import { clearRateCache } from "../../src/utils";
import { lstatSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";

async function sleep(seconds: number) {
  return new Promise((resolve) => setTimeout(resolve, seconds * 1000));
}
// TODO: add test - 10 cad + 5 usd + 1000 inr to aed on 10 mar 2020
describe("Finance manual tests", () => {
  test("check cache hits", async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({ rates: { INR: 50, CAD: 20 }, expiration: 1000 }),
      });
    });

    const exp = ["10 usd to inr", "20 usd to cad", "20 usd to inr"];
    const result = ["₹500.00", "CA$400.00", "₹1,000.00"];
    // @ts-ignore
    for (const [i, ex] of exp.entries()) {
      const tokens = doLex(ex, {}, 1);
      const res = await doParse(tokens, true);
      expect(res.result).toStrictEqual(result[i]);
    }
    expect(global.fetch).toBeCalledTimes(1);
  });

  test("check cache hits expiration", async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      return Promise.resolve({
        json: () =>
          Promise.resolve({ rates: { INR: 50, CAD: 20 }, expiration: 2 }),
      });
    });

    const exp = ["10 usd to inr", "20 usd to cad", "20 usd to inr"];
    const result = ["₹500.00", "CA$400.00", "₹1,000.00"];
    // @ts-ignore
    for (const [i, ex] of exp.entries()) {
      const tokens = doLex(ex, {}, 1);
      const res = await doParse(tokens, true);
      expect(res.result).toStrictEqual(result[i]);
      await sleep(2);
    }
    expect(global.fetch).toBeCalledTimes(3);
  });

  test("check cache hits with multiple entries", async () => {
    global.fetch = jest.fn().mockImplementation((url) => {
      const urlObj = new URL(url);
      const base = urlObj.searchParams.get("base");
      const date = urlObj.searchParams.get("date");
      if (base === "usd" && date === "2005-05-13")
        return Promise.resolve({
          json: () =>
            Promise.resolve({ rates: { INR: 40, CAD: 25 }, expiration: 200 }),
        });
      if (date === "2020-03-10" && base === "inr")
        return Promise.resolve({
          json: () =>
            Promise.resolve({ rates: { USD: 15, CAD: 30 }, expiration: 200 }),
        });
      if (base === "cad" && date === "2020-03-10")
        return Promise.resolve({
          json: () =>
            Promise.resolve({ rates: { INR: 55, USD: 5 }, expiration: 200 }),
        });
      if (date === "2020-03-10" && base === "inr")
        return Promise.resolve({
          json: () =>
            Promise.resolve({ rates: { USD: 45, CAD: 40 }, expiration: 200 }),
        });
      return Promise.resolve({
        json: () =>
          Promise.resolve({ rates: { INR: 50, CAD: 20 }, expiration: 200 }),
      });
    });

    const exp = [
      "10 usd to inr on 5.13.2005",
      "20 inr to cad on 10 mar 2020",
      "20 usd to inr",
      "20 cad to usd on 2020.03.10",
      "20 inr to usd on 2020.03.10",
    ];
    const result = ["₹400.00", "CA$600.00", "₹1,000.00", "$100.00", "$300.00"];
    // @ts-ignore
    for (const [i, ex] of exp.entries()) {
      const tokens = doLex(ex, {}, 1);
      const res = await doParse(tokens, true);
      expect(res.result).toStrictEqual(result[i]);
    }
    expect(global.fetch).toBeCalledTimes(4);
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
    clearRateCache();
  });
});

describe("Valid Finance", () => {
  const validTestDir = "./tests/finance/valid/";
  beforeEach(() => {
    // utils.getRate = jest.fn().mockReturnValue({ inr: 50, usd: 20 });

    global.fetch = jest.fn().mockImplementation((url) => {
      const urlObj = new URL(url);
      const base = urlObj.searchParams.get("base");
      const date = urlObj.searchParams.get("date");
      return Promise.resolve({
        json: () => Promise.resolve({ rates: { INR: 50, USD: 20 } }),
      });
    });
  });

  afterEach(() => {
    jest.restoreAllMocks();
    jest.resetModules();
    clearRateCache();
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
      const [expr, result] = expList;
      let [, , unit] = expList;
      if (unit === "") unit = undefined;

      test(`Valid Expression: ${filename}:${i + 1}`, async () => {
        const tokens = doLex(expr, {}, 1);
        const res = await doParse(tokens, true);
        // res.formatResult();

        expect(res.result).toStrictEqual(result);
        // expect(res.unit?.originalValue).toStrictEqual(unit);
      });
    });
  });
});
