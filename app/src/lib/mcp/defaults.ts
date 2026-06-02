import type { MCPServer, Skill } from "@/lib/mcp/types.ts";

export type DefaultMCPServer = Omit<MCPServer, "createdAt" | "updatedAt">;
export type DefaultSkill = Omit<Skill, "createdAt" | "updatedAt">;

export const DEFAULT_MCP_SERVERS: DefaultMCPServer[] = [];

export const DEFAULT_SKILLS: DefaultSkill[] = [];

export function seedMCPServers(): MCPServer[] {
  const now = Date.now();
  return DEFAULT_MCP_SERVERS.map((s) => ({ ...s, createdAt: now, updatedAt: now }));
}

export function seedSkills(): Skill[] {
  const now = Date.now();
  return DEFAULT_SKILLS.map((s) => ({ ...s, createdAt: now, updatedAt: now }));
}
