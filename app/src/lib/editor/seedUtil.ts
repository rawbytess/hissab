// Shared helpers for the editor's seed plumbing.
//
// Entropy-drawing engine functions (`random`, `uuid`) are pure *given a seed*.
// The editor injects a trailing `@<base36>` seed into the source so the value
// stays stable across the evaluate-on-every-keystroke loop; the saved text is
// then the single source of truth (no out-of-band cache). `seedInjection.ts`
// adds the seed on first eval; `tokenDecorations.ts` dims it and offers a
// re-roll. Both share the generator and the impure-function list here.

import { Functions } from "@rawbytes/hissab";

// The set of entropy-drawing function names, read straight off the engine's
// exported `Functions` table (the `impure` flag is the source of truth, so this
// stays in sync as the catalog grows — no hardcoded list).
export const IMPURE_FUNCTIONS: ReadonlySet<string> = new Set(
  Object.keys(Functions).filter((name) => Functions[name]?.impure),
);

// A short base36 seed token (e.g. `7f3a`). 32 bits of entropy is plenty to keep
// distinct calls distinct; the engine folds it to a 32-bit PRNG seed anyway.
export function freshSeed(): string {
  const buf = new Uint32Array(1);
  crypto.getRandomValues(buf);
  return buf[0].toString(36);
}
