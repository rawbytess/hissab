import { useAtom, useSetAtom } from "jotai";
import {
  ChevronRight,
  Eye,
  EyeOff,
  Plug,
  Plus,
  RefreshCw,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { asyncMCPServersAtom, mcpServersAtom } from "@/lib/atoms/mcp.ts";
import { mcpManager } from "@/lib/mcp/manager.ts";
import type { MCPServer } from "@/lib/mcp/types.ts";

type TestStatus =
  | { state: "idle" }
  | { state: "checking" }
  | { state: "ok"; toolNames: string[] }
  | { state: "error"; message: string };

function newServer(): MCPServer {
  const now = Date.now();
  return {
    id: crypto.randomUUID(),
    name: "",
    url: "",
    enabled: false,
    createdAt: now,
    updatedAt: now,
  };
}

export function MCPForm() {
  const [mcpValue] = useAtom(mcpServersAtom);
  const setServers = useSetAtom(asyncMCPServersAtom);
  const servers = mcpValue.state === "hasData" ? mcpValue.data : [];

  const upsert = (next: MCPServer) => {
    const now = Date.now();
    const exists = servers.some((s) => s.id === next.id);
    const updated = exists
      ? servers.map((s) => (s.id === next.id ? { ...next, updatedAt: now } : s))
      : [...servers, { ...next, updatedAt: now }];
    setServers(updated);
  };

  const remove = (id: string) => {
    if (!confirm("Delete this MCP server?")) return;
    setServers(servers.filter((s) => s.id !== id));
  };

  const addNew = () => {
    upsert(newServer());
  };

  return (
    <div className="mcp-list">
      {servers.length === 0 && mcpValue.state === "hasData" && (
        <div className="mcp-empty">
          <Plug size={16} />
          <div>No MCP servers yet.</div>
        </div>
      )}
      {servers.map((server) => (
        <ServerCard
          key={server.id}
          server={server}
          onChange={upsert}
          onDelete={() => remove(server.id)}
        />
      ))}
      <button type="button" className="wb-btn ghost mcp-add" onClick={addNew}>
        <Plus size={12} /> Add MCP server
      </button>
    </div>
  );
}

function ServerCard({
  server,
  onChange,
  onDelete,
}: {
  server: MCPServer;
  onChange: (next: MCPServer) => void;
  onDelete: () => void;
}) {
  const [open, setOpen] = useState(!server.name || !server.url);
  const [status, setStatus] = useState<TestStatus>({ state: "idle" });
  const [showAuth, setShowAuth] = useState(false);

  const update = (patch: Partial<MCPServer>) => {
    onChange({ ...server, ...patch });
    setStatus({ state: "idle" });
  };

  const test = async () => {
    if (!server.url) {
      setStatus({ state: "error", message: "URL is required." });
      return;
    }
    setStatus({ state: "checking" });
    try {
      const tools = await mcpManager.listTools(server);
      setStatus({ state: "ok", toolNames: tools.map((t) => t.name) });
    } catch (e) {
      const message = e instanceof Error ? e.message : String(e);
      setStatus({ state: "error", message });
    }
  };

  const headerLabel = server.name || "Untitled server";

  return (
    <div className={`mcp-card${open ? " open" : ""}${server.enabled ? " enabled" : ""}`}>
      <button
        type="button"
        className="mcp-head"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mcp-mark">
          <Plug size={13} />
        </span>
        <div className="mcp-info">
          <div className="mcp-name">{headerLabel}</div>
          <div className="mcp-url">{server.url || "no url"}</div>
        </div>
        <label
          className="mcp-switch"
          onClick={(e) => e.stopPropagation()}
        >
          <input
            type="checkbox"
            checked={server.enabled}
            onChange={(e) => update({ enabled: e.currentTarget.checked })}
          />
          <span>{server.enabled ? "On" : "Off"}</span>
        </label>
        <span className="chev">
          <ChevronRight size={14} />
        </span>
      </button>
      {open && (
        <div className="mcp-body">
          <div className="prov-field-label"><span>Name</span></div>
          <div className="prov-input-wrap">
            <input
              className="prov-input"
              defaultValue={server.name}
              placeholder="My MCP server"
              onBlur={(e) => update({ name: e.currentTarget.value })}
            />
          </div>

          <div className="prov-field-label"><span>Server URL</span></div>
          <div className="prov-input-wrap">
            <input
              className="prov-input"
              defaultValue={server.url}
              placeholder="https://mcp.example.com/"
              onBlur={(e) => update({ url: e.currentTarget.value })}
            />
          </div>

          <div className="prov-field-label">
            <span>CORS proxy URL</span>
            <span className="hint">Optional — prefixed to the request</span>
          </div>
          <div className="prov-input-wrap">
            <input
              className="prov-input"
              defaultValue={server.proxyUrl ?? ""}
              placeholder="https://corsproxy.io/?"
              onBlur={(e) =>
                update({ proxyUrl: e.currentTarget.value || undefined })
              }
            />
          </div>

          <div className="prov-field-label">
            <span>Authorization header</span>
            <span className="hint">Optional, e.g. "Bearer xxx"</span>
          </div>
          <div className="prov-input-wrap">
            <input
              className="prov-input"
              type={showAuth ? "text" : "password"}
              defaultValue={server.authHeader ?? ""}
              placeholder="Bearer …"
              onBlur={(e) =>
                update({ authHeader: e.currentTarget.value || undefined })
              }
            />
            <div className="prov-input-actions">
              <button
                type="button"
                className="prov-input-action"
                onClick={() => setShowAuth((v) => !v)}
                title={showAuth ? "Hide" : "Show"}
              >
                {showAuth ? <EyeOff size={13} /> : <Eye size={13} />}
              </button>
            </div>
          </div>

          <div className="mcp-actions">
            <button
              type="button"
              className="wb-btn"
              onClick={test}
              disabled={status.state === "checking"}
            >
              {status.state === "checking" ? (
                <>
                  <RefreshCw
                    size={12}
                    style={{ animation: "spin 1s linear infinite" }}
                  />
                  Testing…
                </>
              ) : (
                <>
                  <RefreshCw size={12} /> Test connection
                </>
              )}
            </button>
            <button
              type="button"
              className="wb-btn danger-ghost"
              onClick={onDelete}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>

          {status.state === "ok" && (
            <div className="mcp-status ok">
              Connected. {status.toolNames.length} tool
              {status.toolNames.length === 1 ? "" : "s"}:{" "}
              {status.toolNames.join(", ")}
            </div>
          )}
          {status.state === "error" && (
            <div className="mcp-status error">{status.message}</div>
          )}
        </div>
      )}
    </div>
  );
}
