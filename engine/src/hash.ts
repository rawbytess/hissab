// Cryptographic + checksum hash functions over text input.
//
// Unlike the entropy-drawing functions (random/uuid/nanoid in function.ts),
// hashes are *pure*: the digest is a deterministic function of the input, so
// they need none of the seed machinery — they are ordinary functions that
// happen to take a string argument and return a hex string.
//
// Backed by `hash-wasm`: a self-contained (wasm embedded as base64, no separate
// fetch) and browser-safe library with no Node built-in imports, so it bundles
// cleanly into the engine dist the app loads. The hashers are async (wasm is
// instantiated on first use, then cached); the engine already awaits function
// results in parsetree.solve, so async wrappers are fine. All outputs are
// lowercase hex.

import {
  crc32,
  md5,
  ripemd160,
  sha1,
  sha3,
  sha256,
  sha384,
  sha512,
} from "hash-wasm";

export type HashName =
  | "md5"
  | "sha1"
  | "sha256"
  | "sha384"
  | "sha512"
  | "sha3_256"
  | "ripemd160"
  | "crc32";

export async function hashText(name: HashName, text: string): Promise<string> {
  switch (name) {
    case "md5":
      return md5(text);
    case "sha1":
      return sha1(text);
    case "sha256":
      return sha256(text);
    case "sha384":
      return sha384(text);
    case "sha512":
      return sha512(text);
    case "sha3_256":
      return sha3(text, 256);
    case "ripemd160":
      return ripemd160(text);
    case "crc32":
      return crc32(text);
  }
}
