/* eslint-disable import/no-unresolved */
import { lstatSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";
import DateTimeOperands from "../../src/datetime_operands";
import Functions from "../../src/function";
import lexer from "../../src/lexer/lexer";
import { Controllers, Operators } from "../../src/types/operator_types";
import Plurals from "../../src/types/plurals";
import Synonyms from "../../src/types/synonyms";
import { Units, UnitTypes } from "../../src/types/unit_types";

describe("Valid Tokens", () => {
  const validTestDir = "./tests/tokens/valid/";
  readdirSync(validTestDir).forEach((file) => {
    if (lstatSync(resolve(validTestDir, file)).isDirectory()) {
      return;
    }
    const filename = file.split(".")[0];
    const validExp = readFileSync(validTestDir + file, { encoding: "utf8" });
    const exps = validExp.split(/\r?\n/);

    exps.forEach((exp, i) => {
      if (exp === "" || exp[0] === "#") return;

      test(`Valid Tokens:${filename}:${i + 1}`, () => {
        const tokens = lexer(exp, {}, 1);
        expect(tokens.length).toBe(1);
        expect(tokens[0].constructor.name).toBe(filename);
      });
    });
  });
});

describe("Invalid Tokens", () => {
  const validTestDir = "./tests/tokens/";
  const file = "invalid-tokens.txt";
  const validExp = readFileSync(validTestDir + file, { encoding: "utf8" });
  const exps = validExp.split(/\r?\n/);
  exps.forEach((exp, i) => {
    if (exp === "" || exp[0] === "#") return;

    test(`Invalid Tokens:${i + 1}`, () => {
      const tokens = lexer(exp, {}, 1);
      expect(tokens.length).toBe(1);
      expect(tokens[0].constructor.name).toBe("UndefinedToken");
    });
  });
});

describe("Valid Token Types", () => {
  for (const key in Units) {
    test(`Unit token ${key}`, () => {
      const tokens = lexer(key, {}, 1);
      expect(tokens.length).toBe(1);

      const unitData = Units[key];
      if (unitData.type === UnitTypes.MONTH)
        expect(tokens[0].constructor.name).toBe("DateToken");
      else expect(tokens[0].constructor.name).toBe("UnitToken");
    });
  }
  for (const key in Synonyms) {
    test(`Synonyms token ${key}`, () => {
      if (key === "'" || key === '"') return;
      const tokens = lexer(key, {}, 1);
      expect(tokens.length).toBeGreaterThanOrEqual(1);
      expect(tokens.length).toBeLessThanOrEqual(2);
      expect(tokens[0].constructor.name).not.toBe("UndefinedToken");
    });
  }
  for (const key in Plurals) {
    test(`Plurals token ${key}`, () => {
      const tokens = lexer(key, {}, 1);
      expect(tokens.length).toBe(1);
      expect(tokens[0].constructor.name).not.toBe("UndefinedToken");
      expect(tokens[0].originalValue).toBe(key);
    });
  }

  for (const key in Operators) {
    test(`Operators token ${key}`, () => {
      const tokens = lexer(key, {}, 1);
      expect(tokens.length).toBe(1);
      expect(tokens[0].constructor.name).toBe("OperatorToken");
    });
  }
  for (const key in Functions) {
    test(`Function token ${key}`, () => {
      const tokens = lexer(key, {}, 1);
      expect(tokens.length).toBe(1);
      expect(tokens[0].constructor.name).toBe("FunctionToken");
    });
  }
  for (const key in Controllers) {
    test(`Controllers token ${key}`, () => {
      const tokens = lexer(key, {}, 1);
      expect(tokens.length).toBe(1);
      expect(tokens[0].constructor.name).toBe("ControllerToken");
    });
  }
  for (const key in DateTimeOperands) {
    test(`DateTimeOperands token ${key}`, () => {
      const tokens = lexer(key, {}, 1);
      expect(tokens.length).toBe(1);
      expect(tokens[0].constructor.name).toBe("DateToken");
    });
  }
});
