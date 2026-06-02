import {
  ExternalLink,
  FileText,
  Heart,
  Paperclip,
  Plug,
  Shield,
  Sparkles,
  Trash2,
  Wand2,
  X,
} from "lucide-react";
import { useAtom, useSetAtom } from "jotai";
import { useEffect, useState } from "react";
import { LLMForm } from "@/components/Settings/LLMForm.tsx";
import { MCPForm } from "@/components/Settings/MCPForm.tsx";
import { SkillsForm } from "@/components/Settings/SkillsForm.tsx";
import { Support } from "@/components/Settings/Support.tsx";
import { asyncNotebooksAtom, notebooksAtom } from "@/lib/atoms/notebooks.ts";
import {
  deleteNotebookFileFromIDB,
  detachFileIdFromNotebooks,
  formatFileSize,
  listNotebookFilesFromIDB,
  type StoredNotebookFile,
} from "@/lib/idb-stores/file-store.ts";
import { clearAllLocalData } from "@/lib/localData.ts";

type SettingsTab =
  | "providers"
  | "mcp"
  | "skills"
  | "files"
  | "privacy"
  | "support";

const TAB_META: Record<
  SettingsTab,
  { label: string; sub: string; icon: React.ReactNode }
> = {
  providers: {
    label: "AI Providers",
    sub: "Connect a provider, then pick the models you want available.",
    icon: <Sparkles size={15} />,
  },
  mcp: {
    label: "MCP Servers",
    sub: "Connect Model Context Protocol servers to expose extra tools.",
    icon: <Plug size={15} />,
  },
  skills: {
    label: "Skills",
    sub: "Add Anthropic-format SKILL.md instructions the assistant follows.",
    icon: <Wand2 size={15} />,
  },
  files: {
    label: "Files",
    sub: "Manage notebook attachments stored in this browser.",
    icon: <Paperclip size={15} />,
  },
  privacy: {
    label: "Privacy & data",
    sub: "All data lives in your browser. Manage it here.",
    icon: <Shield size={15} />,
  },
  support: {
    label: "Support Hissab",
    sub: "Help keep Hissab free and open source.",
    icon: <Heart size={15} />,
  },
};

interface SettingsProps {
  open: boolean;
  onClose: () => void;
}

export default function Settings({ open, onClose }: SettingsProps) {
  const [tab, setTab] = useState<SettingsTab>("providers");

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    document.addEventListener("keydown", handler);
    return () => document.removeEventListener("keydown", handler);
  }, [open, onClose]);

  if (!open) return null;

  const meta = TAB_META[tab];

  return (
    <div
      className="modal-overlay"
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div className="modal">
        <aside className="s-nav">
          <div className="s-nav-head">
            <span className="logo-mark" style={{ width: 22, height: 22 }} />
            <span className="ttl">Settings</span>
          </div>

          <div className="s-nav-tabs">
            {(Object.keys(TAB_META) as SettingsTab[]).map((t) => (
              <button
                key={t}
                type="button"
                className={`s-tab${tab === t ? " active" : ""}`}
                onClick={() => setTab(t)}
              >
                <span className="ico">{TAB_META[t].icon}</span>
                <span>{TAB_META[t].label}</span>
              </button>
            ))}
          </div>

          <div className="s-nav-foot">
            <a
              className="s-tab"
              href="https://github.com/rawbytess/hissab"
              target="_blank"
              rel="noopener noreferrer"
            >
              <span className="ico">
                <GitHubIcon size={14} />
              </span>
              <span>GitHub</span>
              <ExternalLink className="external" size={12} />
            </a>
          </div>
        </aside>

        <div className="s-body">
          <div className="s-body-head">
            <div>
              <div className="ttl">{meta.label}</div>
              <div className="sub">{meta.sub}</div>
            </div>
            <button type="button" className="close" onClick={onClose}>
              <X size={16} />
            </button>
          </div>

          <div className="s-body-scroll scroll">
            {tab === "providers" && <LLMForm />}
            {tab === "mcp" && <MCPForm />}
            {tab === "skills" && <SkillsForm />}
            {tab === "files" && <FilesPane />}
            {tab === "privacy" && <PrivacyPane />}
            {tab === "support" && <Support />}
          </div>
        </div>
      </div>
    </div>
  );
}

function GitHubIcon({ size = 14 }: { size?: number }) {
  return (
    <svg
      aria-hidden="true"
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="currentColor"
    >
      <path d="M12 2C6.48 2 2 6.58 2 12.26c0 4.53 2.87 8.37 6.84 9.72.5.1.68-.22.68-.49 0-.24-.01-.88-.01-1.73-2.78.62-3.37-1.38-3.37-1.38-.45-1.18-1.11-1.49-1.11-1.49-.91-.64.07-.63.07-.63 1 .07 1.53 1.06 1.53 1.06.89 1.56 2.34 1.11 2.91.85.09-.66.35-1.11.63-1.37-2.22-.26-4.56-1.14-4.56-5.07 0-1.12.39-2.03 1.03-2.75-.1-.26-.45-1.3.1-2.71 0 0 .84-.28 2.75 1.05A9.33 9.33 0 0 1 12 6.98c.85 0 1.7.12 2.5.35 1.91-1.33 2.75-1.05 2.75-1.05.55 1.41.2 2.45.1 2.71.64.72 1.03 1.63 1.03 2.75 0 3.94-2.34 4.81-4.57 5.07.36.32.68.94.68 1.9 0 1.37-.01 2.48-.01 2.82 0 .27.18.59.69.49A10.16 10.16 0 0 0 22 12.26C22 6.58 17.52 2 12 2Z" />
    </svg>
  );
}

function FilesPane() {
  const [files, setFiles] = useState<StoredNotebookFile[]>([]);
  const [notebooksValue] = useAtom(notebooksAtom);
  const setNotebooks = useSetAtom(asyncNotebooksAtom);
  const notebooks =
    notebooksValue.state === "hasData" ? notebooksValue.data : [];

  const refreshFiles = () => {
    void listNotebookFilesFromIDB().then(setFiles);
  };

  useEffect(refreshFiles, []);

  const usageByFile = new Map<string, string[]>();
  for (const notebook of notebooks) {
    for (const fileId of notebook.fileIds ?? []) {
      const usage = usageByFile.get(fileId) ?? [];
      usage.push(notebook.title);
      usageByFile.set(fileId, usage);
    }
  }

  const handleDelete = async (file: StoredNotebookFile) => {
    if (!confirm(`Delete ${file.name} from local storage?`)) return;
    await deleteNotebookFileFromIDB(file.id);
    setNotebooks(detachFileIdFromNotebooks(notebooks, file.id));
    setFiles((current) => current.filter((item) => item.id !== file.id));
  };

  if (files.length === 0) {
    return (
      <div className="files-empty">
        <FileText size={16} />
        <span>No files attached yet.</span>
      </div>
    );
  }

  return (
    <div className="files-pane">
      {files.map((file) => {
        const usage = usageByFile.get(file.id) ?? [];
        return (
          <div className="files-row" key={file.id}>
            <span className="files-icon">
              <FileText size={14} />
            </span>
            <span className="files-main">
              <span className="files-name">{file.name}</span>
              <span className="files-meta">
                {file.kind} · {formatFileSize(file.size)} ·{" "}
                {new Date(file.createdAt).toLocaleDateString([], {
                  month: "short",
                  day: "numeric",
                  year: "numeric",
                })}
              </span>
              <span className="files-usage">
                {usage.length > 0
                  ? `Used in ${usage.slice(0, 3).join(", ")}${usage.length > 3 ? ` and ${usage.length - 3} more` : ""}`
                  : "Not attached to any notebook"}
              </span>
            </span>
            <button
              type="button"
              className="files-delete"
              title={`Delete ${file.name}`}
              onClick={() => void handleDelete(file)}
            >
              <Trash2 size={13} />
            </button>
          </div>
        );
      })}
    </div>
  );
}

function PrivacyPane() {
  const [isClearing, setIsClearing] = useState(false);

  async function handleClearAllLocalData() {
    if (
      !confirm(
        "This will delete all notebooks, settings, files, MCP servers, skills, and AI cache data stored in this browser. Are you sure?",
      )
    ) {
      return;
    }

    setIsClearing(true);
    try {
      await clearAllLocalData();
      window.location.reload();
    } catch (error) {
      console.error("Failed to clear local data:", error);
      alert("Some local data could not be cleared. Please try again.");
      setIsClearing(false);
    }
  }

  return (
    <div style={{ padding: "16px 0" }}>
      <div className="usage-note" style={{ marginBottom: 14 }}>
        <div className="privacy-tldr">
          <div>
            Your notebooks, settings, files, MCP servers, and skills stay cozy
            in your browser.
          </div>
          <div>
            Nothing goes to Hissab servers, because Hissab does not have any
            servers to send it to.
          </div>
          <div>
            AI requests take the direct route from your browser to the provider
            you choose, using the API key you enter.
          </div>
        </div>
      </div>
      <a
        className="privacy-link-row"
        href="https://hissab.io/privacy-app"
        target="_blank"
        rel="noopener noreferrer"
      >
        <span>Privacy policy</span>
        <ExternalLink size={12} />
      </a>
      <button
        type="button"
        className="wb-btn danger-ghost"
        style={{ width: "100%", justifyContent: "center", height: 38 }}
        disabled={isClearing}
        onClick={() => void handleClearAllLocalData()}
      >
        {isClearing ? "Clearing..." : "Clear all local data"}
      </button>
    </div>
  );
}
