import { calculate, doLex, doParse, UserError, type Variables } from "../src";

describe("Public API", () => {
  test("calculate lexes and parses an expression", async () => {
    const res = await calculate("1 + 2");

    expect(res.result).toStrictEqual("3");
    expect(res.meta.variableName).toStrictEqual("");
    expect(res.resultToken).toBeDefined();
  });

  test("calculate accepts variables and lineNumber options", async () => {
    const variables: Variables = {};
    const assigned = await calculate("x = 12", { variables, lineNumber: 1 });
    variables[assigned.meta.variableName] = assigned.resultToken;

    const res = await calculate("x + 3", {
      variables,
      lineNumber: 2,
    });

    expect(res.result).toStrictEqual("15");
  });

  test("doLex and doParse keep the existing result shape", async () => {
    const tokens = doLex("10 meter to feet");
    const res = await doParse(tokens);

    expect(res).toHaveProperty("result");
    expect(res).toHaveProperty("resultToken");
    expect(res).toHaveProperty("meta.variableName");
    expect(res.result).toStrictEqual("32.8084 feet");
  });

  test("UserError propagates for invalid input", async () => {
    await expect(calculate("10 blah to foo")).rejects.toThrow(UserError);
  });
});
