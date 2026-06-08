import { Icon } from "@iconify/react";
import { BookOpen, PanelLeft } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { DocSearchBox } from "@/components/DocSearchBox.tsx";
import type { Notebook } from "@/lib/atoms/notebooks.ts";
import { useDocsNavigation } from "@/lib/docsNav.ts";

interface TopbarProps {
  notebook: Notebook | null;
  onRenameNotebook: (title: string) => void;
  onToggleSidebar: () => void;
  isSidebarOpen: boolean;
  isRunning?: boolean;
}

const GITHUB_URL = "https://github.com/rawbytess/hissab";

export function Topbar({
  notebook,
  onRenameNotebook,
  onToggleSidebar,
  isSidebarOpen,
  isRunning,
}: TopbarProps) {
  const goToDocs = useDocsNavigation();
  const [draftTitle, setDraftTitle] = useState(notebook?.title ?? "");
  const skipCommitRef = useRef(false);

  useEffect(() => {
    setDraftTitle(notebook?.title ?? "");
  }, [notebook?.id, notebook?.title]);

  const commitTitle = () => {
    if (!notebook) return;
    if (skipCommitRef.current) {
      skipCommitRef.current = false;
      return;
    }
    const nextTitle = draftTitle.trim() || "Untitled notebook";
    setDraftTitle(nextTitle);
    onRenameNotebook(nextTitle);
  };

  return (
    <header className="topbar">
      <button
        type="button"
        className="topbar-iconbtn"
        title={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        aria-label={isSidebarOpen ? "Hide sidebar" : "Show sidebar"}
        aria-pressed={!isSidebarOpen}
        onClick={onToggleSidebar}
      >
        <PanelLeft size={16} />
      </button>
      <div className="topbar-title">
        {notebook ? (
          <input
            aria-label="Notebook title"
            className="topbar-title-input"
            value={draftTitle}
            onChange={(event) => setDraftTitle(event.currentTarget.value)}
            onBlur={commitTitle}
            onKeyDown={(event) => {
              if (event.key === "Enter") event.currentTarget.blur();
              if (event.key === "Escape") {
                skipCommitRef.current = true;
                setDraftTitle(notebook.title);
                event.currentTarget.blur();
              }
            }}
          />
        ) : (
          <span className="topbar-title-empty">Notebooks</span>
        )}
      </div>
      <div className="spacer" />
      <DocSearchBox />
      {isRunning && (
        <span className="tb-pill warn">
          <span className="dot" />
          Computing
        </span>
      )}
      <button
        type="button"
        className="topbar-docs-btn"
        title="Documentation"
        aria-label="Open documentation"
        onClick={() => goToDocs()}
      >
        <BookOpen size={15} />
        <span>Documentation</span>
      </button>
      <a
        className="topbar-iconbtn topbar-github-btn"
        href={GITHUB_URL}
        target="_blank"
        rel="noopener noreferrer"
        title="Open GitHub repository"
        aria-label="Open GitHub repository"
      >
        <Icon icon="mdi:github" width={16} height={16} aria-hidden="true" />
      </a>
    </header>
  );
}
