import { doLex, doParse } from "engine";
import { Hono } from "hono";

const app = new Hono();
app.post("/", async (c) => {
  try {
    const requestBody = await c.req.json();
    console.log("abcd");
    const exps = requestBody["expressions"];
    if (exps === undefined || !Array.isArray(exps))
      return c.json({ error: "Bad request. No expressions found." }, 400);

    const results: string[] = [];
    for (const exp of exps) {
      const tokens = doLex(exp);
      const result = await doParse(tokens, true);
      results.push(result.result);
    }

    const response = {
      results,
    };

    return c.json(response);
  } catch (error: any) {
    return c.json({ error: error.message }, 400);
  }
});
export default app;
