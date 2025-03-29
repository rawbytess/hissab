import { Hono } from "hono";
import ai from "./routes/ai/route";
import classic from "./routes/classic/route";
import prompt from "./routes/user/ai/prompt/route";
import lemonsqueezy from "./routes/webhook/lemonsqueezy/route";
import plan from "./routes/user/plan/route";
import { Bindings } from "./types/envTypes";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/ping", (c) => c.json({ message: "pong", ok: true }));
app.get("/", (c) => c.text("Hissab API"));

// app.route("/ai", ai);
app.route("/classic", classic);
app.route("/user/ai/prompt", prompt);
app.route("/webhook/lemonsqueezy", lemonsqueezy);
app.route("/user/plan", plan);

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

export default {
  fetch(request: Request, env: any, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};

export { app };
