import { Hono } from "hono";
import { cors } from "hono/cors";
import expression from "./expression/expression";
import ai from "./ai/ai";
import { Bindings } from "./envTypes";

const app = new Hono<{ Bindings: Bindings }>();

app.use("/expression/*", cors());
app.get("/ping", (c) => c.json({ message: "pong", ok: true }));
app.get("/", (c) => c.text("Hissab API"));

app.route("/expression", expression);
app.route("/ai", ai);

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

export default {
  fetch(request: Request, env: any, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};

export { app };
