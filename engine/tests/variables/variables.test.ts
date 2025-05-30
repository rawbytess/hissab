import { doLex, doParse, Variables } from "../../src";
import { lstatSync, readdirSync, readFileSync } from "fs";
import { resolve } from "path";

describe("Variable Expressions", () => {
  const validTestDir = "./tests/variables/valid/";
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
      const trueResult = expList.pop();
      const variables: Variables = {};
      let testResult: string;
      test(`Variables:${filename}:${i + 1}`, async () => {
        for (const [l, ex] of expList.entries()) {
          const tokens = doLex(ex, variables, l + 1);
          const { result, resultToken, meta } = await doParse(tokens, true);
          testResult = result;
          if (meta.variableName) variables[meta.variableName] = resultToken;
          variables[`line${l + 1}`] = resultToken;
          variables[`l${l + 1}`] = resultToken;
        }

        expect(testResult).toStrictEqual(trueResult);
      });
    });
  });
});
