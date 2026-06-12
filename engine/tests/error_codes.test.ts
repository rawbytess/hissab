import { readdirSync, readFileSync } from "fs";
import { join } from "path";
import { userErrorMessages } from "../src/errorMessages";

// Registry invariants for the engine's error codes.
//
// Codes are plain number literals thrown via `new UserError(<code>)` /
// `new UnhandledError(<code>)`. This suite scrapes the source for them and
// enforces two ratchets:
//   1. No anonymous code 0 — every throw site must be traceable.
//   2. No NEW unmapped UserError codes — a new user-facing code must get a
//      message in errorMessages.ts. The KNOWN_UNMAPPED list below is the
//      backlog inherited before this rule existed: shrink it by adding
//      messages (and deleting the entry here); never add to it.

const SRC_DIR = join(__dirname, "..", "src");

function walkTsFiles(dir: string, out: string[] = []): string[] {
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, entry.name);
    if (entry.isDirectory()) walkTsFiles(p, out);
    else if (p.endsWith(".ts")) out.push(p);
  }
  return out;
}

const sources = walkTsFiles(SRC_DIR).map((file) => ({
  file,
  text: readFileSync(file, { encoding: "utf8" }),
}));

function thrownCodes(errorClass: "UserError" | "UnhandledError"): Set<number> {
  const re = new RegExp(`new ${errorClass}\\((\\d+)\\)`, "g");
  const codes = new Set<number>();
  for (const { text } of sources)
    for (const m of text.matchAll(re)) codes.add(Number(m[1]));
  return codes;
}

// Backlog of user-facing codes thrown before the message rule existed.
// Shrink-only: add the message to errorMessages.ts and delete the code here.
const KNOWN_UNMAPPED = new Set<number>([
  543, 1907, 2333, 3421, 4326, 5376, 5729, 6431, 7301, 7302, 7303, 7304, 7305,
  7310, 7311, 7312, 7313, 7314, 7731, 7734, 7803, 7804, 7902, 7903, 7904, 7905,
  7906, 7907, 7908, 8201, 8202, 8203, 8210, 8211, 8212, 8213, 8215, 8216, 8217,
  8218, 8220, 8225, 8226, 8231, 8240, 8250, 8251, 8645, 8750, 8801, 8802, 8803,
  8804, 8805, 8806, 8810, 8811, 9110, 9111, 9112, 9113, 9114, 9115, 9116, 9117,
  9118, 9119, 9120, 9121, 9122, 9123, 9124, 9130, 9131, 9132, 9133, 9147, 9148,
  9149, 9150, 9151, 9152, 9156, 9157, 9610, 9620, 9701, 9898, 9899,
]);

describe("Error-code registry", () => {
  test("no anonymous UserError(0) or UnhandledError(0)", () => {
    const offenders: string[] = [];
    for (const { file, text } of sources) {
      if (/new (?:UserError|UnhandledError)\(0\)/.test(text))
        offenders.push(file);
    }
    expect(offenders).toStrictEqual([]);
  });

  test("every thrown UserError code has a message or is on the legacy backlog", () => {
    const unmappedAndUnknown = [...thrownCodes("UserError")]
      .filter((code) => !(code in userErrorMessages))
      .filter((code) => !KNOWN_UNMAPPED.has(code))
      .sort((a, b) => a - b);
    // A new user-facing error code needs an entry in errorMessages.ts —
    // do NOT add it to KNOWN_UNMAPPED.
    expect(unmappedAndUnknown).toStrictEqual([]);
  });

  test("the legacy backlog only shrinks", () => {
    const thrown = thrownCodes("UserError");
    const stale = [...KNOWN_UNMAPPED]
      .filter((code) => !thrown.has(code) || code in userErrorMessages)
      .sort((a, b) => a - b);
    // These codes are no longer thrown (or now have messages) — delete them
    // from KNOWN_UNMAPPED so the ratchet keeps its teeth.
    expect(stale).toStrictEqual([]);
  });
});
