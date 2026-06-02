import { useAtom, useSetAtom } from "jotai";
import {
  Check,
  Edit3,
  FileText,
  GripVertical,
  MoreHorizontal,
  Plus,
  Search,
  Settings,
  Trash2,
} from "lucide-react";
import { type DragEvent, useMemo, useState } from "react";
import {
  asyncNotebooksAtom,
  createNotebook,
  notebookMatchesQuery,
  notebooksAtom,
} from "@/lib/atoms/notebooks.ts";
import { getRandomPlaceholderName } from "@/lib/placeholder.ts";

interface AppSidebarProps {
  currentId: string | null;
  onSelect: (id: string) => void;
  onOpenSettings: () => void;
}

type DropTarget = { id: string; pos: "above" | "below" } | null;

export function AppSidebar({
  currentId,
  onSelect,
  onOpenSettings,
}: AppSidebarProps) {
  const [search, setSearch] = useState("");
  const [editMode, setEditMode] = useState(false);
  const [editTitles, setEditTitles] = useState<Record<string, string>>({});
  const [dragId, setDragId] = useState<string | null>(null);
  const [dropTarget, setDropTarget] = useState<DropTarget>(null);
  const [notebooksValue] = useAtom(notebooksAtom);
  const setNotebooks = useSetAtom(asyncNotebooksAtom);

  const notebooks =
    notebooksValue.state === "hasData" ? notebooksValue.data : [];

  const filtered = useMemo(
    () =>
      search
        ? notebooks.filter((nb) => notebookMatchesQuery(nb, search))
        : notebooks,
    [notebooks, search],
  );

  const handleNewNotebook = () => {
    const nb = createNotebook(getRandomPlaceholderName());
    setNotebooks([nb, ...notebooks]);
    onSelect(nb.id);
  };

  const commitTitle = (id: string, raw: string) => {
    const v = raw.trim() || "Untitled notebook";
    setEditTitles((prev) => {
      const next = { ...prev };
      delete next[id];
      return next;
    });
    setNotebooks(
      notebooks.map((n) =>
        n.id === id && n.title !== v
          ? { ...n, title: v, updatedAt: Date.now() }
          : n,
      ),
    );
  };

  const handleDelete = (id: string) => {
    setNotebooks(notebooks.filter((n) => n.id !== id));
  };

  const onDragStart = (e: DragEvent<HTMLDivElement>, id: string) => {
    setDragId(id);
    e.dataTransfer.effectAllowed = "move";
    e.dataTransfer.setData("text/plain", id);
  };
  const onDragOver = (e: DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    if (id === dragId) return;
    const rect = e.currentTarget.getBoundingClientRect();
    const pos: "above" | "below" =
      e.clientY < rect.top + rect.height / 2 ? "above" : "below";
    setDropTarget({ id, pos });
  };
  const onDragEnd = () => {
    setDragId(null);
    setDropTarget(null);
  };
  const onDrop = (e: DragEvent<HTMLDivElement>, id: string) => {
    e.preventDefault();
    if (!dragId || dragId === id) {
      onDragEnd();
      return;
    }
    const from = notebooks.findIndex((n) => n.id === dragId);
    if (from < 0) return onDragEnd();
    const arr = [...notebooks];
    const [moved] = arr.splice(from, 1);
    const targetIdx = arr.findIndex((n) => n.id === id);
    if (targetIdx < 0) return onDragEnd();
    const insertAt = dropTarget?.pos === "below" ? targetIdx + 1 : targetIdx;
    arr.splice(insertAt, 0, moved);
    setNotebooks(arr);
    onDragEnd();
  };

  return (
    <aside className={`sidebar${editMode ? " edit" : ""}`}>
      <div className="sb-head">
        <span className="sb-brand">
          <span className="logo-mark" />
          <span>Hissab</span>
        </span>
        <button
          className="sb-iconbtn"
          type="button"
          title="Settings"
          aria-label="Settings"
          onClick={onOpenSettings}
        >
          <Settings size={14} />
        </button>
      </div>

      <div className="sb-search">
        <Search size={13} />
        <input
          placeholder="Search notebooks"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
        />
        <span className="kbd-soft">⌘K</span>
      </div>

      <div className="sb-new-row">
        <button
          className="sb-new"
          type="button"
          onClick={handleNewNotebook}
        >
          <Plus size={14} />
          New notebook
        </button>
        <button
          type="button"
          className={`sb-organize${editMode ? " active" : ""}`}
          title={editMode ? "Done editing" : "Organize notebooks"}
          onClick={() => {
            setEditMode((v) => !v);
            setEditTitles({});
          }}
        >
          {editMode ? <Check size={14} /> : <Edit3 size={14} />}
        </button>
      </div>

      {editMode && (
        <div className="sb-edit-banner">
          <span className="dot" />
          <span className="grow">Drag to reorder, type to rename</span>
          <button type="button" onClick={() => setEditMode(false)}>
            Done
          </button>
        </div>
      )}

      <div className="sb-section">
        <span>Notebooks</span>
        <span className="count">{notebooks.length}</span>
      </div>

      <div className="sb-scroll scroll">
        <div className="sb-list">
          {filtered.map((nb) => {
            const isDrop = dropTarget?.id === nb.id;
            const updatedAt = new Date(nb.updatedAt).toLocaleDateString([], {
              month: "short",
              day: "numeric",
            });
            const cls = [
              "sb-item",
              nb.id === currentId ? "active" : "",
              dragId === nb.id ? "dragging" : "",
              isDrop && dropTarget?.pos === "above" ? "drop-above" : "",
              isDrop && dropTarget?.pos === "below" ? "drop-below" : "",
            ]
              .filter(Boolean)
              .join(" ");
            return (
              <div
                key={nb.id}
                className={cls}
                onClick={() => {
                  if (editMode) return;
                  onSelect(nb.id);
                }}
                draggable={editMode}
                onDragStart={(e) => onDragStart(e, nb.id)}
                onDragOver={(e) => onDragOver(e, nb.id)}
                onDrop={(e) => onDrop(e, nb.id)}
                onDragEnd={onDragEnd}
                title={nb.title}
              >
                {editMode && (
                  <span className="sb-grip">
                    <GripVertical size={13} />
                  </span>
                )}
                <span className="pin">
                  <FileText size={12} />
                </span>
                {editMode ? (
                  <input
                    className="label-edit"
                    value={editTitles[nb.id] ?? nb.title}
                    onClick={(e) => e.stopPropagation()}
                    onChange={(e) =>
                      setEditTitles((prev) => ({
                        ...prev,
                        [nb.id]: e.target.value,
                      }))
                    }
                    onBlur={(e) => commitTitle(nb.id, e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") {
                        e.preventDefault();
                        e.currentTarget.blur();
                      } else if (e.key === "Escape") {
                        setEditTitles((prev) => {
                          const next = { ...prev };
                          delete next[nb.id];
                          return next;
                        });
                        e.currentTarget.blur();
                      }
                    }}
                  />
                ) : (
                  <span className="label">{nb.title}</span>
                )}
                {editMode ? (
                  <button
                    type="button"
                    className="sb-act danger"
                    title="Delete"
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDelete(nb.id);
                    }}
                  >
                    <Trash2 size={12} />
                  </button>
                ) : (
                  <>
                    <span className="meta">{updatedAt}</span>
                    <button
                      type="button"
                      className="opts"
                      onClick={(e) => {
                        e.stopPropagation();
                        setEditMode(true);
                      }}
                      title="More…"
                    >
                      <MoreHorizontal size={12} />
                    </button>
                  </>
                )}
              </div>
            );
          })}
          {filtered.length === 0 && (
            <div
              style={{
                padding: "16px 12px",
                color: "var(--text-3)",
                fontSize: 12,
                textAlign: "center",
              }}
            >
              {search ? "No notebooks match." : "No notebooks yet."}
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
