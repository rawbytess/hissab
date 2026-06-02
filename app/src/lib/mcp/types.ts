export type MCPServer = {
  id: string;
  name: string;
  url: string;
  proxyUrl?: string;
  authHeader?: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
};

export type Skill = {
  id: string;
  name: string;
  description: string;
  instructions: string;
  allowedTools?: string[];
  raw: string;
  enabled: boolean;
  createdAt: number;
  updatedAt: number;
};

export type MCPToolDispatch = (args: unknown) => Promise<string>;

export type MCPToolInfo = {
  name: string;
  description?: string;
  inputSchema?: unknown;
};
