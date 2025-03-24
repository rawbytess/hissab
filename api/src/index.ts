import { Hono } from "hono";
import { cors } from "hono/cors";
import expression from "./routes/expression/expression";
import ai from "./routes/ai/ai";
import ls from "./routes/ls/ls";
import { Bindings } from "./envTypes";

const app = new Hono<{ Bindings: Bindings }>();

app.use("/expression/*", cors());
app.get("/ping", (c) => c.json({ message: "pong", ok: true }));
app.get("/", (c) => c.text("Hissab API"));

app.route("/expression", expression);
app.route("/ai", ai);
app.route("/ls", ls);

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

export default {
  fetch(request: Request, env: any, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};

export { app };
