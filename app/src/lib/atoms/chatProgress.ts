import { atom } from "jotai";
import type { AgentProgressEvent } from "@/lib/agentic/types.ts";

export interface ChatProgressState {
  pageId: string;
  event: AgentProgressEvent;
}

export const chatProgressAtom = atom<ChatProgressState | null>(null);
