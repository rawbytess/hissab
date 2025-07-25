import { createInterface } from "readline";
import context from "../dist/context.js";
import { doLex, doParse } from "../src/index.ts";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

context.financeURL = "http://127.0.0.1:8787";
// context.financeURL = "https://finance.hissab.io";
context.isPro = true;

function test() {
  readline.question("Expression: ", async (expr) => {
    if (expr === "q") {
      return readline.close();
    }
    const tokens = doLex(expr, {}, 1);
    try {
      const res = await doParse(tokens, context.isPro);
      console.log(`Result: ${res.result}`);
    } catch (e) {
      console.log(e.message, e.code);
    }
    test();
  });
}
test();
