import { useAtom, useSetAtom } from "jotai";
import { ChevronRight, Plus, Sparkles, Trash2 } from "lucide-react";
import { useState } from "react";
import { asyncSkillsAtom, skillsAtom } from "@/lib/atoms/skills.ts";
import { parseSkillMarkdown } from "@/lib/mcp/skillParser.ts";
import type { Skill } from "@/lib/mcp/types.ts";

const SAMPLE = `---
name: my-skill
description: One-line description of when to use this skill.
---

Detailed instructions for the assistant go here.
`;

export function SkillsForm() {
  const [skillsValue] = useAtom(skillsAtom);
  const setSkills = useSetAtom(asyncSkillsAtom);
  const skills = skillsValue.state === "hasData" ? skillsValue.data : [];
  const [adding, setAdding] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);

  const handleSave = (
    raw: string,
    existingId?: string,
  ): { ok: true } | { ok: false; error: string } => {
    try {
      const parsed = parseSkillMarkdown(raw);
      const now = Date.now();
      if (existingId) {
        setSkills(
          skills.map((s) =>
            s.id === existingId ? { ...s, ...parsed, raw, updatedAt: now } : s,
          ),
        );
      } else {
        const skill: Skill = {
          id: crypto.randomUUID(),
          ...parsed,
          raw,
          enabled: true,
          createdAt: now,
          updatedAt: now,
        };
        setSkills([...skills, skill]);
      }
      return { ok: true };
    } catch (e) {
      return { ok: false, error: e instanceof Error ? e.message : String(e) };
    }
  };

  const remove = (id: string) => {
    if (!confirm("Delete this skill?")) return;
    setSkills(skills.filter((s) => s.id !== id));
  };

  const toggle = (id: string, enabled: boolean) => {
    setSkills(
      skills.map((s) =>
        s.id === id ? { ...s, enabled, updatedAt: Date.now() } : s,
      ),
    );
  };

  return (
    <div className="mcp-list">
      {skills.length === 0 && !adding && skillsValue.state === "hasData" && (
        <div className="mcp-empty">
          <Sparkles size={16} />
          <div>No skills yet.</div>
        </div>
      )}
      {skills.map((skill) =>
        editingId === skill.id ? (
          <SkillEditor
            key={skill.id}
            initial={skill.raw}
            onCancel={() => setEditingId(null)}
            onSave={(raw) => {
              const result = handleSave(raw, skill.id);
              if (result.ok) setEditingId(null);
              return result;
            }}
          />
        ) : (
          <SkillCard
            key={skill.id}
            skill={skill}
            onEdit={() => setEditingId(skill.id)}
            onDelete={() => remove(skill.id)}
            onToggle={(enabled) => toggle(skill.id, enabled)}
          />
        ),
      )}
      {adding && (
        <SkillEditor
          initial={SAMPLE}
          onCancel={() => setAdding(false)}
          onSave={(raw) => {
            const result = handleSave(raw);
            if (result.ok) setAdding(false);
            return result;
          }}
        />
      )}
      {!adding && (
        <button
          type="button"
          className="wb-btn ghost mcp-add"
          onClick={() => setAdding(true)}
        >
          <Plus size={12} /> Add skill
        </button>
      )}
    </div>
  );
}

function SkillCard({
  skill,
  onEdit,
  onDelete,
  onToggle,
}: {
  skill: Skill;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: (enabled: boolean) => void;
}) {
  const [open, setOpen] = useState(false);
  return (
    <div
      className={`mcp-card${open ? " open" : ""}${skill.enabled ? " enabled" : ""}`}
    >
      <button
        type="button"
        className="mcp-head"
        onClick={() => setOpen((v) => !v)}
      >
        <span className="mcp-mark">
          <Sparkles size={13} />
        </span>
        <div className="mcp-info">
          <div className="mcp-name">{skill.name}</div>
          <div className="mcp-url">{skill.description}</div>
        </div>
        <label className="mcp-switch" onClick={(e) => e.stopPropagation()}>
          <input
            type="checkbox"
            checked={skill.enabled}
            onChange={(e) => onToggle(e.currentTarget.checked)}
          />
          <span>{skill.enabled ? "On" : "Off"}</span>
        </label>
        <span className="chev">
          <ChevronRight size={14} />
        </span>
      </button>
      {open && (
        <div className="mcp-body">
          <pre className="skill-instructions">{skill.instructions}</pre>
          <div className="mcp-actions">
            <button type="button" className="wb-btn" onClick={onEdit}>
              Edit
            </button>
            <button
              type="button"
              className="wb-btn danger-ghost"
              onClick={onDelete}
            >
              <Trash2 size={12} /> Delete
            </button>
          </div>
        </div>
      )}
    </div>
  );
}

function SkillEditor({
  initial,
  onCancel,
  onSave,
}: {
  initial: string;
  onCancel: () => void;
  onSave: (raw: string) => { ok: true } | { ok: false; error: string };
}) {
  const [text, setText] = useState(initial);
  const [error, setError] = useState<string | null>(null);

  return (
    <div className="mcp-card open">
      <div className="mcp-body">
        <div className="prov-field-label">
          <span>SKILL.md</span>
          <span className="hint">
            YAML frontmatter (`name`, `description`) + markdown body
          </span>
        </div>
        <textarea
          className="prov-input skill-textarea"
          value={text}
          onChange={(e) => {
            setText(e.target.value);
            if (error) setError(null);
          }}
          rows={14}
          spellCheck={false}
        />
        {error && <div className="mcp-status error">{error}</div>}
        <div className="mcp-actions">
          <button
            type="button"
            className="wb-btn"
            onClick={() => {
              const result = onSave(text);
              if (!result.ok) setError(result.error);
            }}
          >
            Save
          </button>
          <button type="button" className="wb-btn ghost" onClick={onCancel}>
            Cancel
          </button>
        </div>
      </div>
    </div>
  );
}
