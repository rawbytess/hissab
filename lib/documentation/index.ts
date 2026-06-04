import { baseDocumentation } from "./base";
import { arithmetic } from "./chunks/arithmetic";
import { bitwise } from "./chunks/bitwise";
import { color } from "./chunks/color";
import { complex_numbers } from "./chunks/complex_numbers";
import { compound_units } from "./chunks/compound_units";
import { coordinate_systems } from "./chunks/coordinate_systems";
import { date_time } from "./chunks/date_time";
import { finance } from "./chunks/finance";
import { ip_address } from "./chunks/ip_address";
import { labels_and_prev } from "./chunks/labels_and_prev";
import { logarithm } from "./chunks/logarithm";
import { number_systems } from "./chunks/number_systems";
import { number_theory } from "./chunks/number_theory";
import { percentage } from "./chunks/percentage";
import { probability } from "./chunks/probability";
import { set_operations } from "./chunks/set_operations";
import { statistics } from "./chunks/statistics";
import { symbolic } from "./chunks/symbolic";
import { trigonometry } from "./chunks/trigonometry";
import { unit_conversion } from "./chunks/unit_conversion";
import { visualization } from "./chunks/visualization";
import { OPERATION_TAGS, type OperationTag, tagDescriptions } from "./tags";

export {
  default as systemInstructions,
  mcpInstructions,
} from "./system-instructions";
export type { OperationTag };
export { baseDocumentation, OPERATION_TAGS, tagDescriptions };

export const chunks: Record<OperationTag, string> = {
  arithmetic,
  percentage,
  unit_conversion,
  compound_units,
  set_operations,
  number_theory,
  logarithm,
  statistics,
  probability,
  finance,
  trigonometry,
  date_time,
  number_systems,
  bitwise,
  color,
  ip_address,
  symbolic,
  complex_numbers,
  coordinate_systems,
  visualization,
  labels_and_prev,
};

export function getDocumentationChunk(tag: OperationTag): string {
  return chunks[tag] ?? "";
}

export function getFullDocumentation(): string {
  const sections = OPERATION_TAGS.map((tag) => chunks[tag].trim()).join("\n\n");
  return `${baseDocumentation.trim()}\n\n${sections}\n`;
}
