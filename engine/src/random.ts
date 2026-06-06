// Deterministic, dependency-free PRNG + seeded UUID generation.
//
// The engine is otherwise a pure function of its input. The entropy-drawing
// functions (`random`, `uuid` in function.ts) stay pure *given a seed*: with a
// seed the output is reproducible — the app editor relies on this to keep a
// value stable across its evaluate-on-every-keystroke loop — and with no seed
// they draw fresh entropy via `Math.random`, which is the right behaviour for a
// one-shot CLI / AI evaluation.
//
// Never reach for `crypto.randomUUID()` here: it can't be seeded, so it would
// break determinism-given-a-seed. Everything routes through a single `rng`
// function so the seeded and unseeded paths share one implementation.
//
// This module imports nothing from the engine, keeping it clear of the
// unit_types ↔ token_factory ↔ plurals ↔ compound init-order cycle.

// A fast 32-bit PRNG seeded by a single 32-bit integer. Returns a generator of
// floats in [0, 1).
export function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) | 0;
    let t = Math.imul(a ^ (a >>> 15), 1 | a);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

function formatUuid(bytes: number[]): string {
  const h = bytes.map((b) => b.toString(16).padStart(2, "0")).join("");
  return `${h.slice(0, 8)}-${h.slice(8, 12)}-${h.slice(12, 16)}-${h.slice(
    16,
    20,
  )}-${h.slice(20, 32)}`;
}

// nanoid's default URL-safe alphabet, hardcoded so generated ids have the same
// shape/character set as the `nanoid` library's without taking it as a
// dependency (it is ESM-only and pulls `node:crypto`, which breaks the engine's
// jest harness). It is exactly 64 characters, so `byte & 63` is an unbiased
// index into it — the same trick nanoid uses for power-of-two alphabets. The
// character *permutation* differs from the library (which walks its random
// buffer in reverse); both are equally valid random ids. Our forward order has
// a bonus: a shorter id is a prefix of a longer one for the same seed.
export const NANOID_ALPHABET =
  "useandom-26T198340PX75pxJACKVERYMINDBUSHWOLF_GQZbfghjklqvwyzrict";

// Build a nanoid-style id of `size` chars by drawing bytes from `nextByte` (a
// seeded PRNG byte source for reproducibility, or a CSPRNG for a fresh id) and
// mapping each into NANOID_ALPHABET.
export function nanoidId(nextByte: () => number, size: number): string {
  let id = "";
  for (let i = 0; i < size; i += 1) id += NANOID_ALPHABET[nextByte() & 63];
  return id;
}

// Build an RFC-4122 version-4 (random) UUID from any [0, 1) generator. With a
// seeded generator the UUID is reproducible; pass `Math.random` for a fresh one.
export function seededUuidV4(rng: () => number): string {
  const bytes: number[] = new Array(16);
  for (let i = 0; i < 16; i += 1) bytes[i] = Math.floor(rng() * 256) & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x40; // version 4
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  return formatUuid(bytes);
}

// Build an RFC-9562 version-7 (time-ordered) UUID: a 48-bit big-endian
// Unix-millisecond timestamp followed by version/variant bits and random fill.
// The timestamp is passed in so the caller controls reproducibility — the editor
// (seeded) derives it from the PRNG so a frozen value never drifts with the
// clock, while a one-shot run passes `Date.now()` for true time ordering.
export function seededUuidV7(rng: () => number, unixMs: number): string {
  const bytes: number[] = new Array(16);
  const ts = Math.max(0, Math.floor(unixMs));
  // 48-bit timestamp, big-endian, across bytes 0..5.
  bytes[0] = Math.floor(ts / 2 ** 40) & 0xff;
  bytes[1] = Math.floor(ts / 2 ** 32) & 0xff;
  bytes[2] = Math.floor(ts / 2 ** 24) & 0xff;
  bytes[3] = Math.floor(ts / 2 ** 16) & 0xff;
  bytes[4] = Math.floor(ts / 2 ** 8) & 0xff;
  bytes[5] = ts & 0xff;
  for (let i = 6; i < 16; i += 1) bytes[i] = Math.floor(rng() * 256) & 0xff;
  bytes[6] = (bytes[6] & 0x0f) | 0x70; // version 7
  bytes[8] = (bytes[8] & 0x3f) | 0x80; // variant 10xx
  return formatUuid(bytes);
}
