import { createInterface } from "readline";
import { doLex, doParse } from "../src/index.ts";

const readline = createInterface({
  input: process.stdin,
  output: process.stdout,
});

function test() {
  readline.question("Expression: ", async (expr) => {
    if (expr === "q") {
      return readline.close();
    }
    const tokens = doLex(expr, {}, 1);
    try {
      const res = await doParse(tokens);
      console.log(`Result: ${res.result}`);
    } catch (e) {
      console.log(e.message, e.code);
    }
    test();
  });
}
test();
