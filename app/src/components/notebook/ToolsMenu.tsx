import { useAtom, useSetAtom } from "jotai";
import { ChevronDown, Plug, Sparkles, Wrench } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { asyncMCPServersAtom, mcpServersAtom } from "@/lib/atoms/mcp.ts";
import { asyncSkillsAtom, skillsAtom } from "@/lib/atoms/skills.ts";

export function ToolsMenu() {
  const [open, setOpen] = useState(false);
  const wrapRef = useRef<HTMLDivElement>(null);

  const [mcpValue] = useAtom(mcpServersAtom);
  const [skillsValue] = useAtom(skillsAtom);
  const setServers = useSetAtom(asyncMCPServersAtom);
  const setSkills = useSetAtom(asyncSkillsAtom);

  const servers = mcpValue.state === "hasData" ? mcpValue.data : [];
  const skills = skillsValue.state === "hasData" ? skillsValue.data : [];

  useEffect(() => {
    if (!open) return;
    const onDown = (e: MouseEvent) => {
      if (!wrapRef.current?.contains(e.target as Node)) setOpen(false);
    };
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") setOpen(false);
    };
    document.addEventListener("mousedown", onDown);
    document.addEventListener("keydown", onKey);
    return () => {
      document.removeEventListener("mousedown", onDown);
      document.removeEventListener("keydown", onKey);
    };
  }, [open]);

  const enabledCount =
    servers.filter((s) => s.enabled).length +
    skills.filter((s) => s.enabled).length;

  const toggleServer = (id: string, enabled: boolean) => {
    setServers(
      servers.map((s) =>
        s.id === id ? { ...s, enabled, updatedAt: Date.now() } : s,
      ),
    );
  };

  const toggleSkill = (id: string, enabled: boolean) => {
    setSkills(
      skills.map((s) =>
        s.id === id ? { ...s, enabled, updatedAt: Date.now() } : s,
      ),
    );
  };

  const openSettings = () => {
    setOpen(false);
    window.dispatchEvent(new Event("open-settings"));
  };

  return (
    <div className="composer-model-wrap" ref={wrapRef}>
      <button
        type="button"
        className={`composer-btn${open ? " active" : ""}`}
        onClick={() => setOpen((v) => !v)}
        title="Tools"
      >
        <Wrench size={12} />
        Tools
        {enabledCount > 0 && (
          <span className="tools-count">{enabledCount}</span>
        )}
        <ChevronDown size={11} className="chev" />
      </button>
      {open && (
        <div className="composer-model-pop tools-menu-pop" role="menu">
          <div className="composer-model-group">
            <div className="composer-model-group-head">
              <Plug size={10} /> MCP Servers
            </div>
            {servers.length === 0 ? (
              <button
                type="button"
                className="tools-empty"
                onClick={openSettings}
              >
                No servers — add in Settings →
              </button>
            ) : (
              servers.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`tools-row${s.enabled ? " on" : ""}`}
                  onClick={() => toggleServer(s.id, !s.enabled)}
                >
                  <span className="tools-toggle" aria-hidden>
                    {s.enabled ? "✓" : ""}
                  </span>
                  <span className="lbl">{s.name || "Untitled"}</span>
                  <span className="val">{hostnameOf(s.url)}</span>
                </button>
              ))
            )}
          </div>
          <div className="composer-model-group">
            <div className="composer-model-group-head">
              <Sparkles size={10} /> Skills
            </div>
            {skills.length === 0 ? (
              <button
                type="button"
                className="tools-empty"
                onClick={openSettings}
              >
                No skills — add in Settings →
              </button>
            ) : (
              skills.map((s) => (
                <button
                  key={s.id}
                  type="button"
                  className={`tools-row${s.enabled ? " on" : ""}`}
                  onClick={() => toggleSkill(s.id, !s.enabled)}
                >
                  <span className="tools-toggle" aria-hidden>
                    {s.enabled ? "✓" : ""}
                  </span>
                  <span className="lbl">{s.name}</span>
                  <span className="val">{s.description}</span>
                </button>
              ))
            )}
          </div>
          <button
            type="button"
            className="composer-model-link"
            onClick={openSettings}
          >
            Manage in Settings →
          </button>
        </div>
      )}
    </div>
  );
}

function hostnameOf(url: string): string {
  try {
    return new URL(url).hostname;
  } catch {
    return "";
  }
}
