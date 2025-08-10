import { StreamableHTTPTransport } from "@hono/mcp";
import { cloudflareRateLimiter } from "@hono-rate-limiter/cloudflare";
import documentation from "@lib/ai/instructions/documentation";
import { mcpInstructions } from "@lib/ai/instructions/system-instructions";
import type { MetaBindings } from "@lib/types/envTypes";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { z } from "zod";
import { calculateExpressions } from "~lib/calculateExpressions";
import { safeGet } from "~lib/utils";

const app = new Hono<MetaBindings>();

const server = new McpServer({
  name: "hissab-mcp",
  version: "0.1.0",
});
server.registerTool(
  "Hissab",
  {
    title: "Hissab Math & calculation Tool",
    description: mcpInstructions + documentation,
    inputSchema: { hissab_expressions: z.array(z.string()) },
  },
  async ({ hissab_expressions }) => {
    const results = await calculateExpressions(hissab_expressions, true);
    const formattedResults = results
      .map((item) => `${item.expression} = ${item.result}`)
      .join("\n");
    return {
      content: [{ type: "text", text: formattedResults }],
    };
  },
);

app.use(
  cloudflareRateLimiter<MetaBindings>({
    rateLimitBinding: (c) => c.env.MCP_FREE_RATE_LIMITER,
    keyGenerator: (c) => c.req.header("cf-connecting-ip") ?? "", // Method to generate custom identifiers for clients.
  }),
);

app.all("/", async (c) => {
  const body = await c.req.text();
  const db = c.env.LOGS_DB;
  const transport = new StreamableHTTPTransport();

  await server.connect(transport);

  c.executionCtx.waitUntil(logdata(db, body));
  return transport.handleRequest(c);
});

async function logdata(db: D1Database, data: string) {
  try {
    const jsonData = JSON.parse(data);
    const method = jsonData?.method || "unknown";
    const client = safeGet(jsonData, "params.clientInfo.name") ?? "unknown";
    await db
      .prepare(
        `INSERT INTO mcplogs (body, method, client)
    VALUES (?, ?, ?)`,
      )
      .bind(data, method, client)
      .run();
  } catch (error: any) {
    console.error(error?.message || error);
  }
}

export default app;
