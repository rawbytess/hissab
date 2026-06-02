import { useEffect, useState } from "react";
import type { AgentProgressStage } from "@/lib/agentic/types.ts";

interface FloatingToastProps {
  stage: AgentProgressStage | undefined;
  detail: string | undefined;
  startedAt: number | undefined;
  onJumpToCell?: () => void;
}

const STAGE_LABELS: Record<string, string> = {
  planning: "Planning",
  thinking: "Thinking",
  fetching_docs: "Looking up docs",
  searching_web: "Searching web",
  calculating: "Calculating",
  synthesizing: "Writing answer",
  done: "Done",
};

export function FloatingToast({
  stage,
  detail,
  startedAt,
  onJumpToCell,
}: FloatingToastProps) {
  const [elapsed, setElapsed] = useState(0);

  useEffect(() => {
    if (!startedAt) return;
    setElapsed(Date.now() - startedAt);
    const id = setInterval(() => setElapsed(Date.now() - startedAt), 100);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!stage || stage === "done") return null;

  return (
    <div className="floating-toast">
      <span className="ring" />
      <span style={{ color: "var(--text-0)", fontWeight: 500 }}>
        {STAGE_LABELS[stage] ?? stage}
      </span>
      {detail && <span style={{ color: "var(--text-3)" }}>· {detail}</span>}
      <span
        style={{
          color: "var(--text-3)",
          fontFamily: "var(--font-mono)",
          fontSize: 11,
        }}
      >
        {(elapsed / 1000).toFixed(1)}s
      </span>
      {onJumpToCell && (
        <button type="button" className="expand" onClick={onJumpToCell}>
          Jump to cell ↑
        </button>
      )}
    </div>
  );
}
