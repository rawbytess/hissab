import { createStore, get, set } from "idb-keyval";
import type { MCPServer, Skill } from "@/lib/mcp/types.ts";

const mcpStore = createStore("hissab-mcp", "mcp-data");

const MCP_SERVERS_KEY = "mcp-servers";
const SKILLS_KEY = "skills";

export function saveMCPServersToIDB(servers: MCPServer[]) {
  return set(MCP_SERVERS_KEY, servers, mcpStore);
}

export function getMCPServersFromIDB(): Promise<MCPServer[] | undefined> {
  return get(MCP_SERVERS_KEY, mcpStore);
}

export function saveSkillsToIDB(skills: Skill[]) {
  return set(SKILLS_KEY, skills, mcpStore);
}

export function getSkillsFromIDB(): Promise<Skill[] | undefined> {
  return get(SKILLS_KEY, mcpStore);
}
