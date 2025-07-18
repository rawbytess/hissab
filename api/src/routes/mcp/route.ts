import { StreamableHTTPTransport } from "@hono/mcp";
import documentation from "@lib/ai/instructions/documentation";
import systemInstructions from "@lib/ai/instructions/system-instructions";
import type { MetaBindings } from "@lib/types/envTypes";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { Hono } from "hono";
import { z } from "zod";
import { calculateExpressions } from "~lib/calculateExpressions";

const server = new McpServer({
  name: "hissab-mcp",
  version: "0.1.0",
});

server.registerTool(
  "Hissab",
  {
    title: "Hissab Math & calculation Tool",
    description: systemInstructions() + documentation,
    inputSchema: { hissab_expressions: z.array(z.string()) },
  },
  async ({ hissab_expressions }) => {
    const results = await calculateExpressions(hissab_expressions, true);
    return {
      content: [{ type: "text", text: results.join("\n") }],
    };
  },
);

const app = new Hono<MetaBindings>();

app.all("/", async (c) => {
  const transport = new StreamableHTTPTransport();
  await server.connect(transport);
  return transport.handleRequest(c);
});

export default app;
