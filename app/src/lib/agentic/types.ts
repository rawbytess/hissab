import {
  OPERATION_TAGS,
  type OperationTag,
} from "../../../../lib/documentation/index.ts";
import type {
  ClarificationRequest,
  SolutionPlan,
  SolutionStep,
} from "../../../../lib/types/AITypes.ts";

export type { ClarificationRequest, SolutionPlan, SolutionStep };
export { OPERATION_TAGS, type OperationTag };

export interface ClassificationGeneral {
  intent: "general";
  reply: string;
}

export interface ClassificationHissabDocs {
  intent: "hissab_docs";
  question: string;
  operation_tags: OperationTag[];
  include_catalog?: boolean;
}

export interface ClassificationNeedsClarification extends ClarificationRequest {
  intent: "needs_clarification";
}

export interface ClassificationCalculateSimple {
  intent: "calculate_simple";
  goal: string;
  operation_tags: OperationTag[];
  expressions: string[];
}

export interface ClassificationCalculateComplex extends SolutionPlan {
  intent: "calculate_complex";
}

export type Classification =
  | ClassificationGeneral
  | ClassificationHissabDocs
  | ClassificationNeedsClarification
  | ClassificationCalculateSimple
  | ClassificationCalculateComplex;

export type AgentProgressStage =
  | "planning"
  | "thinking"
  | "fetching_docs"
  | "searching_web"
  | "calculating"
  | "calling_tool"
  | "synthesizing"
  | "done";

export interface AgentProgressEvent {
  stage: AgentProgressStage;
  detail?: string;
}

export type AgentProgressCallback = (event: AgentProgressEvent) => void;
