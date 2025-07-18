import type { Bindings } from "@lib/types/envTypes";
import { Hono } from "hono";
import adminUser from "./routes/admin/user/route";
import mcpServer from "./routes/mcp/route";
import userAI from "./routes/user/ai/route";
import auth from "./routes/user/auth/route";
import userUpload from "./routes/user/upload/route";
import polar from "./routes/webhook/polar/route";

const app = new Hono<{ Bindings: Bindings }>();

app.get("/ping", (c) => c.json({ message: "pong", ok: true }));
app.get("/", (c) => c.text("Hissab API"));

// app.route("/ai", ai);
app.route("/user/ai", userAI);
app.route("/webhook/polar", polar);
app.route("/user/upload", userUpload);
app.route("/admin/user", adminUser);
app.route("/mcp", mcpServer);
app.route("/user/auth", auth);

app.notFound((c) => c.json({ message: "Not Found", ok: false }, 404));

export default {
  fetch(request: Request, env: any, ctx: ExecutionContext) {
    return app.fetch(request, env, ctx);
  },
};

export { app };
export { UserRateLimiter } from "@lib/durableObjects/UserRateLimiter";
