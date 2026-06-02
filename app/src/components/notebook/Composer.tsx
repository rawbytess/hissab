import { useAtom, useSetAtom } from "jotai";
import {
  ArrowUp,
  ChevronDown,
  FileText,
  Paperclip,
  X,
} from "lucide-react";
import { ToolsMenu } from "@/components/notebook/ToolsMenu.tsx";
import {
  type ChangeEvent,
  forwardRef,
  type KeyboardEvent,
  useEffect,
  useImperativeHandle,
  useRef,
  useState,
} from "react";
import { type EnabledModel, useCurrentLLM } from "@/hooks/useCurrentLLM.tsx";
import { aiProviders } from "@/lib/aiProviders.ts";
import {
  asyncCurrentLLMAtom,
  asyncDefaultModelAtom,
} from "@/lib/atoms/llms.ts";
import { asyncNotebooksAtom, notebooksAtom } from "@/lib/atoms/notebooks.ts";
import {
  formatFileSize,
  getNotebookFileFromIDB,
  isSupportedNotebookFile,
  saveBrowserFileToIDB,
  type StoredNotebookFile,
} from "@/lib/idb-stores/file-store.ts";

interface ComposerProps {
  notebookId: string;
  fileIds: string[];
  onSubmit: (prompt: string) => void;
  disabled?: boolean;
}

export interface ComposerHandle {
  setValue: (text: string) => void;
}

export const Composer = forwardRef<ComposerHandle, ComposerProps>(
  function Composer({ notebookId, fileIds, onSubmit, disabled }, ref) {
    const [val, setVal] = useState("");
    const [modelMenuOpen, setModelMenuOpen] = useState(false);
    const [attachedFiles, setAttachedFiles] = useState<StoredNotebookFile[]>(
      [],
    );
    const [attachError, setAttachError] = useState("");
    const taRef = useRef<HTMLTextAreaElement>(null);
    const fileInputRef = useRef<HTMLInputElement>(null);
    const modelWrapRef = useRef<HTMLDivElement>(null);
    const { defaultModel, enabledModels } = useCurrentLLM();
    const setDefaultModel = useSetAtom(asyncDefaultModelAtom);
    const setCurrentLLM = useSetAtom(asyncCurrentLLMAtom);
    const [notebooksValue] = useAtom(notebooksAtom);
    const setNotebooks = useSetAtom(asyncNotebooksAtom);

    useImperativeHandle(ref, () => ({
      setValue: (text: string) => {
        setVal(text);
        requestAnimationFrame(() => taRef.current?.focus());
      },
    }));

    useEffect(() => {
      const ta = taRef.current;
      if (!ta) return;
      ta.style.height = "auto";
      ta.style.height = `${Math.min(ta.scrollHeight, 240)}px`;
    }, [val]);

    useEffect(() => {
      let cancelled = false;
      void Promise.all(fileIds.map((id) => getNotebookFileFromIDB(id))).then(
        (files) => {
          if (cancelled) return;
          setAttachedFiles(
            files.filter((file): file is StoredNotebookFile => Boolean(file)),
          );
        },
      );
      return () => {
        cancelled = true;
      };
    }, [fileIds]);

    useEffect(() => {
      if (!modelMenuOpen) return;
      const onDown = (e: MouseEvent) => {
        if (!modelWrapRef.current?.contains(e.target as Node)) {
          setModelMenuOpen(false);
        }
      };
      const onKey = (e: globalThis.KeyboardEvent) => {
        if (e.key === "Escape") setModelMenuOpen(false);
      };
      document.addEventListener("mousedown", onDown);
      document.addEventListener("keydown", onKey);
      return () => {
        document.removeEventListener("mousedown", onDown);
        document.removeEventListener("keydown", onKey);
      };
    }, [modelMenuOpen]);

    const handleSubmit = () => {
      const trimmed = val.trim();
      if (!trimmed || disabled) return;
      onSubmit(trimmed);
      setVal("");
    };

    const handleKeyDown = (e: KeyboardEvent<HTMLTextAreaElement>) => {
      if (e.key === "Enter" && !e.shiftKey && !e.metaKey && !e.ctrlKey) {
        e.preventDefault();
        handleSubmit();
      }
    };

    const updateNotebookFileIds = (nextFileIds: string[]) => {
      if (notebooksValue.state !== "hasData") return;
      setNotebooks(
        notebooksValue.data.map((notebook) =>
          notebook.id === notebookId
            ? { ...notebook, fileIds: nextFileIds, updatedAt: Date.now() }
            : notebook,
        ),
      );
    };

    const handleAttachFiles = async (event: ChangeEvent<HTMLInputElement>) => {
      const selected = Array.from(event.target.files ?? []);
      event.target.value = "";
      if (selected.length === 0 || disabled) return;

      const valid = selected.filter(isSupportedNotebookFile);
      const invalid = selected.length - valid.length;
      setAttachError(
        invalid > 0
          ? `${invalid} unsupported file${invalid === 1 ? "" : "s"} skipped.`
          : "",
      );
      if (valid.length === 0) return;

      const savedFiles = await Promise.all(valid.map(saveBrowserFileToIDB));
      const nextFileIds = Array.from(
        new Set([...fileIds, ...savedFiles.map((file) => file.id)]),
      );
      setAttachedFiles((current) => [...current, ...savedFiles]);
      updateNotebookFileIds(nextFileIds);
    };

    const handleRemoveFile = (fileId: string) => {
      const nextFileIds = fileIds.filter((id) => id !== fileId);
      setAttachedFiles((current) => current.filter((file) => file.id !== fileId));
      updateNotebookFileIds(nextFileIds);
    };

    const currentEnabled = enabledModels.find(
      (m) => m.composite === defaultModel,
    );
    const modelLabel =
      currentEnabled?.label ??
      (enabledModels.length === 0 ? "No models" : "Select model");

    const groupedModels = enabledModels.reduce<
      Record<string, EnabledModel[]>
    >((acc, m) => {
      (acc[m.provider] ??= []).push(m);
      return acc;
    }, {});

    const handleSelectModel = (m: EnabledModel) => {
      setDefaultModel(m.composite);
      setCurrentLLM(m.provider);
      setModelMenuOpen(false);
    };

    const openSettings = () => {
      setModelMenuOpen(false);
      window.dispatchEvent(new Event("open-settings"));
    };

    return (
      <div className="composer">
        <input
          ref={fileInputRef}
          type="file"
          multiple
          className="composer-file-input"
          accept=".txt,.md,.csv,.json,.pdf,.docx,.xlsx,.pptx,image/*,audio/*,video/*"
          onChange={handleAttachFiles}
          disabled={disabled}
        />
        <textarea
          ref={taRef}
          rows={2}
          placeholder="Ask anything calculable. Hissab can read & edit this notebook."
          value={val}
          onChange={(e) => setVal(e.target.value)}
          onKeyDown={handleKeyDown}
          disabled={disabled}
        />
        {(attachedFiles.length > 0 || attachError) && (
          <div className="composer-files" aria-live="polite">
            {attachedFiles.map((file) => (
              <div className="composer-file-chip" key={file.id}>
                <span className="file-ico">
                  <FileText size={12} />
                </span>
                <span className="file-main">
                  <span className="file-name">{file.name}</span>
                  <span className="file-meta">
                    {file.kind} · {formatFileSize(file.size)}
                  </span>
                </span>
                <button
                  type="button"
                  title={`Remove ${file.name}`}
                  onClick={() => handleRemoveFile(file.id)}
                  disabled={disabled}
                >
                  <X size={12} />
                </button>
              </div>
            ))}
            {attachError && (
              <div className="composer-file-error">{attachError}</div>
            )}
          </div>
        )}
        <div className="composer-row">
          <button
            className="composer-btn"
            title="Attach"
            type="button"
            onClick={() => fileInputRef.current?.click()}
            disabled={disabled}
          >
            <Paperclip size={12} />
            Attach
          </button>
          <ToolsMenu />
          <span className="grow" />
          <div className="composer-model-wrap" ref={modelWrapRef}>
            <button
              className={`composer-model${modelMenuOpen ? " open" : ""}`}
              title="Model selector"
              type="button"
              aria-haspopup="menu"
              aria-expanded={modelMenuOpen}
              onClick={() => setModelMenuOpen((v) => !v)}
            >
              {modelLabel}
              <ChevronDown size={11} className="chev" />
            </button>
            {modelMenuOpen && (
              <div className="composer-model-pop" role="menu">
                {enabledModels.length === 0 ? (
                  <div className="composer-model-empty">
                    <div>No models enabled.</div>
                    <button
                      type="button"
                      className="composer-model-link"
                      onClick={openSettings}
                    >
                      Open settings →
                    </button>
                  </div>
                ) : (
                  Object.entries(groupedModels).map(([provider, models]) => (
                    <div className="composer-model-group" key={provider}>
                      <div className="composer-model-group-head">
                        {aiProviders[provider as EnabledModel["provider"]]
                          ?.label ?? provider}
                      </div>
                      {models.map((m) => {
                        const active = m.composite === defaultModel;
                        return (
                          <button
                            key={m.composite}
                            type="button"
                            role="menuitemradio"
                            aria-checked={active}
                            className={`composer-model-item${active ? " active" : ""}`}
                            onClick={() => handleSelectModel(m)}
                          >
                            <span className="lbl">{m.label}</span>
                            <span className="val">{m.value}</span>
                          </button>
                        );
                      })}
                    </div>
                  ))
                )}
              </div>
            )}
          </div>
          <button
            className="composer-send"
            type="button"
            disabled={!val.trim() || disabled}
            onClick={handleSubmit}
          >
            <ArrowUp size={12} />
            Ask
            <span className="kbd">⏎</span>
          </button>
        </div>
      </div>
    );
  },
);
