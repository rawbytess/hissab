import { atom } from "jotai";
import { loadable } from "jotai/utils";
import {
  getMCPServersFromIDB,
  saveMCPServersToIDB,
} from "@/lib/idb-stores/mcp-store.ts";
import { seedMCPServers } from "@/lib/mcp/defaults.ts";
import type { MCPServer } from "@/lib/mcp/types.ts";

const mcpServersDataAtom = atom<MCPServer[] | null>(null);

const LEGACY_FRANKFURTER_URLS = new Set([
  "https://mcp.frankfurter.dev/",
  "https://mcp.frankfurter.dev",
  "https://frankfurter.dev/mcp/",
  "https://frankfurter.dev/mcp",
]);

const REMOVED_DEFAULT_SERVERS = new Set([
  "pikasim|https://pikasim.com/mcp",
  ...Array.from(LEGACY_FRANKFURTER_URLS, (url) => `frankfurter|${url}`),
]);

let mcpServersLoadPromise: Promise<MCPServer[]> | null = null;
const loadMCPServers = async (): Promise<MCPServer[]> => {
  const stored = await getMCPServersFromIDB();
  if (stored !== undefined) {
    const migrated = migrateMCPServers(stored);
    if (!sameServerList(stored, migrated)) {
      await saveMCPServersToIDB(migrated);
    }
    return migrated;
  }
  const seeded = seedMCPServers();
  await saveMCPServersToIDB(seeded);
  return seeded;
};

function migrateMCPServers(servers: MCPServer[]): MCPServer[] {
  return servers.filter(
    (server) => !REMOVED_DEFAULT_SERVERS.has(`${server.id}|${server.url}`),
  );
}

function sameServerList(a: MCPServer[], b: MCPServer[]): boolean {
  return (
    a.length === b.length && a.every((server, i) => serversEqual(server, b[i]))
  );
}

function serversEqual(a: MCPServer, b: MCPServer): boolean {
  return (
    a.id === b.id &&
    a.name === b.name &&
    a.url === b.url &&
    a.proxyUrl === b.proxyUrl &&
    a.authHeader === b.authHeader &&
    a.enabled === b.enabled
  );
}

function dispatchInvalidations(prev: MCPServer[], next: MCPServer[]) {
  const nextById = new Map(next.map((s) => [s.id, s]));
  const ids = new Set<string>();
  for (const p of prev) {
    const n = nextById.get(p.id);
    if (!n || !serversEqual(p, n)) ids.add(p.id);
  }
  for (const id of ids) {
    window.dispatchEvent(
      new CustomEvent("mcp-server-invalidate", { detail: id }),
    );
  }
}

export const asyncMCPServersAtom = atom<
  MCPServer[] | Promise<MCPServer[]>,
  [MCPServer[]],
  void
>(
  (get) => {
    const cached = get(mcpServersDataAtom);
    if (cached !== null) return cached;
    if (!mcpServersLoadPromise) {
      mcpServersLoadPromise = loadMCPServers();
    }
    return mcpServersLoadPromise;
  },
  async (get, set, updated: MCPServer[]) => {
    const prevMaybe = get(mcpServersDataAtom);
    const prev =
      prevMaybe ?? (await (mcpServersLoadPromise ?? loadMCPServers()));
    await saveMCPServersToIDB(updated);
    set(mcpServersDataAtom, updated);
    dispatchInvalidations(prev, updated);
  },
);

export const mcpServersAtom = loadable(asyncMCPServersAtom);
