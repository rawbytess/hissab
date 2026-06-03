import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StreamableHTTPClientTransport } from "@modelcontextprotocol/sdk/client/streamableHttp.js";
import type { MCPServer, MCPToolInfo } from "@/lib/mcp/types.ts";

type Entry = {
  client: Client;
  transport: StreamableHTTPClientTransport;
  serverSignature: string;
};

function signature(server: MCPServer): string {
  return JSON.stringify({
    url: server.url,
    proxyUrl: server.proxyUrl ?? "",
    authHeader: server.authHeader ?? "",
  });
}

function effectiveUrl(server: MCPServer): URL {
  const prefix = server.proxyUrl ?? "";
  return new URL(prefix + server.url);
}

class MCPManager {
  private clients = new Map<string, Entry>();

  constructor() {
    if (typeof window !== "undefined") {
      window.addEventListener("mcp-server-invalidate", (e) => {
        const id = (e as CustomEvent<string>).detail;
        if (typeof id === "string") void this.invalidate(id);
      });
    }
  }

  async connect(server: MCPServer): Promise<Client> {
    const existing = this.clients.get(server.id);
    if (existing && existing.serverSignature === signature(server)) {
      return existing.client;
    }
    if (existing) await this.invalidate(server.id);

    const requestInit: RequestInit = {};
    if (server.authHeader) {
      requestInit.headers = { Authorization: server.authHeader };
    }

    const transport = new StreamableHTTPClientTransport(effectiveUrl(server), {
      requestInit,
    });
    const client = new Client({
      name: "hissab-app",
      version: "1.0.0",
    });
    await client.connect(transport);

    this.clients.set(server.id, {
      client,
      transport,
      serverSignature: signature(server),
    });
    return client;
  }

  async listTools(server: MCPServer): Promise<MCPToolInfo[]> {
    const client = await this.connect(server);
    const response = await client.listTools();
    return response.tools.map((t) => ({
      name: t.name,
      description: t.description,
      inputSchema: t.inputSchema,
    }));
  }

  async callTool(
    server: MCPServer,
    name: string,
    args: unknown,
  ): Promise<string> {
    const client = await this.connect(server);
    const params: { name: string; arguments?: Record<string, unknown> } = {
      name,
    };
    if (args && typeof args === "object") {
      params.arguments = args as Record<string, unknown>;
    }
    const result = await client.callTool(params);
    return stringifyToolResult(result);
  }

  async invalidate(serverId: string): Promise<void> {
    const entry = this.clients.get(serverId);
    if (!entry) return;
    this.clients.delete(serverId);
    try {
      await entry.transport.terminateSession();
    } catch {
      // ignore
    }
    try {
      await entry.client.close();
    } catch {
      // ignore
    }
  }
}

function stringifyToolResult(result: unknown): string {
  if (!result || typeof result !== "object") return String(result);
  const r = result as {
    content?: unknown[];
    toolResult?: unknown;
    isError?: boolean;
  };
  if (Array.isArray(r.content)) {
    const parts: string[] = [];
    for (const block of r.content) {
      if (!block || typeof block !== "object") continue;
      const b = block as { type?: string; text?: string };
      if (b.type === "text" && typeof b.text === "string") {
        parts.push(b.text);
      } else {
        parts.push(JSON.stringify(block));
      }
    }
    const text = parts.join("\n");
    return r.isError ? `Tool error: ${text}` : text;
  }
  if ("toolResult" in r) return JSON.stringify(r.toolResult);
  return JSON.stringify(result);
}

export const mcpManager = new MCPManager();
