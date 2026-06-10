// biome-ignore-all assist/source/organizeImports: ./tokens/compound must be
// imported after the unit_types/token_factory/plurals modules below; alphabetical
// sorting would pull it earlier and break the engine's module-init order
// (plurals.ts reads Units before unit_types finishes). Keep compound's import last.
import chroma from "chroma-js";
import {
  combination,
  decimalToFraction,
  divisors,
  isPrime,
} from "../arithmetic_functions";
import {
  angleBetween,
  angularAxes,
  type CoordSystem,
  cross,
  dot,
  euclidean,
  expectedArity,
  magnitude,
  midpoint,
  minkowskiInterval,
  normalize,
  radToDeg,
} from "../coordinates";
import { UserError } from "../exceptions";
import * as ip from "../ip";
import * as mat from "../matrix";
import { hashText, type HashName } from "../hash";
import { mulberry32, nanoidId, seededUuidV4, seededUuidV7 } from "../random";
import TokenBaseType, { type TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import {
  BooleanToken,
  ColorToken,
  ComplexToken,
  convertPointToken,
  type expressionUnit,
  FractionToken,
  IpToken,
  ListToken,
  MatrixToken,
  NumberToken,
  type PlotSeries,
  PlotToken,
  PointToken,
  SeedToken,
  TextToken,
  type UnitToken,
} from "../tokens/tokens";
import UnitTypes from "../types/unit_enum";
import ProcessConversions from "../units_processor";

// New calculator domains, kept as a separate trailing import group (the blank
// line above stops the import organizer from folding them into the block above
// and re-sorting them). The engine graph has a unit_types ↔ token_factory ↔
// plurals load-order cycle; pulling ./tokens/compound in *after* the modules
// above ensures `Units` is defined before plurals.ts reads it. geometry/health
// otherwise depend only on ./exceptions.
import {
  boxVolume,
  circleArea,
  circleCircumference,
  coneSurfaceArea,
  coneVolume,
  cubeSurfaceArea,
  cubeVolume,
  cylinderSurfaceArea,
  cylinderVolume,
  ellipseArea,
  heronArea,
  lineSlope,
  parallelogramArea,
  pyramidVolume,
  rectangleArea,
  rectanglePerimeter,
  sphereSurfaceArea,
  sphereVolume,
  squareArea,
  squarePerimeter,
  trapezoidArea,
  triangleArea,
} from "../geometry_functions";
import {
  bmi,
  bmrFemale,
  bmrMale,
  bodyFatFemale,
  bodyFatMale,
  caloriesBurned,
  devineFemale,
  devineMale,
  maxHeartRate,
  waterIntakeLiters,
} from "../health_functions";
import { scaleUnit } from "../tokens/compound";
import type { FunctionDef } from "./types";
import { money, need, pct, plain, type SetExplicit } from "./util";

export const randomFunctions: Record<string, FunctionDef> = {
  // ---- Random / entropy-drawing (impure) --------------------------------
  // The only functions whose output isn't a pure function of the written
  // expression. They stay reproducible *given a seed*: an editor-injected
  // trailing `@seed` arg pins the PRNG so the value is stable across the app's
  // evaluate-on-every-keystroke loop. With no seed they draw fresh entropy (the
  // natural behaviour for a one-shot CLI / AI evaluation). See random.ts.
  random: {
    run: randomFn,
    description:
      "Random number: random() in [0,1), random(max) integer in [0,max], random(min,max) integer in [min,max]",
    isRaw: true,
    impure: true,
  },
  uuid: {
    run: uuidFn,
    description:
      "Generate a UUID: uuid() (v7, time-ordered), uuid(4) (random), or uuid(7)",
    isRaw: true,
    impure: true,
  },
  nanoid: {
    run: nanoidFn,
    description:
      "Generate a URL-safe random id: nanoid() (21 chars) or nanoid(length)",
    isRaw: true,
    impure: true,
  },
  coin: {
    run: coinFn,
    description: 'Flip a coin: coin() → "heads" or "tails"',
    isRaw: true,
    impure: true,
  },
  randombool: {
    run: randomBoolFn,
    description: "Random boolean: randombool() → true or false",
    isRaw: true,
    impure: true,
  },
  pick: {
    run: pickFn,
    description:
      'Pick one option at random: pick("a", "b", "c") or pick(1, 2, 3)',
    isRaw: true,
    impure: true,
  },
  randomcolor: {
    run: randomColorFn,
    description: "Generate a random colour: randomcolor()",
    isRaw: true,
    impure: true,
  },

  // ---- Hashing (pure) -----------------------------------------------------
  // Deterministic digests of a text (or number) argument, returned as lowercase
  // hex. Not impure — no seed machinery — just functions that take a string.
  md5: {
    run: makeHashFn("md5"),
    description: 'MD5 digest of text: md5("hello")',
    isRaw: true,
  },
  sha1: {
    run: makeHashFn("sha1"),
    description: 'SHA-1 digest of text: sha1("hello")',
    isRaw: true,
  },
  sha256: {
    run: makeHashFn("sha256"),
    description: 'SHA-256 digest of text: sha256("hello")',
    isRaw: true,
  },
  sha384: {
    run: makeHashFn("sha384"),
    description: 'SHA-384 digest of text: sha384("hello")',
    isRaw: true,
  },
  sha512: {
    run: makeHashFn("sha512"),
    description: 'SHA-512 digest of text: sha512("hello")',
    isRaw: true,
  },
  sha3: {
    run: makeHashFn("sha3_256"),
    description: 'SHA3-256 digest of text: sha3("hello")',
    isRaw: true,
  },
  sha3_256: {
    run: makeHashFn("sha3_256"),
    description: 'SHA3-256 digest of text: sha3_256("hello")',
    isRaw: true,
  },
  ripemd160: {
    run: makeHashFn("ripemd160"),
    description: 'RIPEMD-160 digest of text: ripemd160("hello")',
    isRaw: true,
  },
  crc32: {
    run: makeHashFn("crc32"),
    description: 'CRC32 checksum of text (hex): crc32("hello")',
    isRaw: true,
  },
};

// ---- Random / entropy-drawing -------------------------------------------

// Pull the (optional) trailing `@seed` arg out of a raw arg list and return a
// PRNG plus the remaining args and whether a seed was present. A SeedToken makes
// the generator reproducible; its absence draws fresh entropy via Math.random.
// `seeded` lets callers that also depend on the clock (uuid v7) stay reproducible
// when seeded. The editor always appends the seed last, but we scan defensively.
function takeSeed(args: TokenType[]): {
  rng: () => number;
  rest: TokenType[];
  seeded: boolean;
} {
  const seedTok = args.find((a): a is SeedToken => a instanceof SeedToken);
  const rest = args.filter((a) => !(a instanceof SeedToken));
  return {
    rng: seedTok ? mulberry32(seedTok.seed) : Math.random,
    rest,
    seeded: Boolean(seedTok),
  };
}

// random() → real in [0,1); random(max) → integer in [0,max]; random(min,max)
// → integer in [min,max]. Integer bounds yield an inclusive integer (so
// `random(10,100)` reads as "between 10 and 100"); non-integer bounds yield a
// real in the half-open interval.
function randomFn(args: TokenType[]): NumberToken {
  const { rng, rest } = takeSeed(args);
  for (const a of rest)
    if (!(a instanceof NumberToken)) throw new UserError(7960);
  const nums = (rest as NumberToken[]).map((n) => n.toNumber());
  if (nums.length > 2) throw new UserError(7960);

  let lo = 0;
  let hi = 1;
  if (nums.length === 1) hi = nums[0];
  else if (nums.length === 2) {
    lo = nums[0];
    hi = nums[1];
  }
  if (lo > hi) [lo, hi] = [hi, lo];

  const value =
    nums.length > 0 && nums.every((n) => Number.isInteger(n))
      ? lo + Math.floor(rng() * (hi - lo + 1))
      : lo + rng() * (hi - lo);
  return plain(value);
}

// uuid() → v7 (time-ordered, the modern default); uuid(4) → v4 (random);
// uuid(7) → v7 explicitly. When seeded, v7's timestamp is derived from the PRNG
// (not the clock) so a frozen editor value never drifts; unseeded v7 uses the
// real time for genuine ordering.
function uuidFn(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: (isExplicit: boolean) => void,
): TextToken {
  const { rng, rest, seeded } = takeSeed(args);
  let version = 7;
  if (rest.length === 1 && rest[0] instanceof NumberToken)
    version = rest[0].toNumber();
  else if (rest.length > 0) throw new UserError(7961);
  if (version !== 4 && version !== 7) throw new UserError(7963);
  setIsExplicit(true);
  if (version === 4) return new TextToken(seededUuidV4(rng));
  const unixMs = seeded ? Math.floor(rng() * 2 ** 48) : Date.now();
  return new TextToken(seededUuidV7(rng, unixMs));
}

// nanoid() → a 21-char URL-safe id (nanoid's default alphabet); nanoid(n) → n
// chars. The entropy is the seeded PRNG when frozen, else the platform CSPRNG
// (Web Crypto `getRandomValues`, available in browsers and Node ≥18) for a
// cryptographically strong id. See nanoidId in random.ts.
function nanoidFn(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: (isExplicit: boolean) => void,
): TextToken {
  const { rng, rest, seeded } = takeSeed(args);
  let size = 21;
  if (rest.length === 1 && rest[0] instanceof NumberToken) {
    size = rest[0].toNumber();
    if (!Number.isInteger(size) || size < 1 || size > 512)
      throw new UserError(7962);
  } else if (rest.length > 0) throw new UserError(7962);
  const nextByte = seeded
    ? () => Math.floor(rng() * 256) & 0xff
    : () => globalThis.crypto.getRandomValues(new Uint8Array(1))[0];
  setIsExplicit(true);
  return new TextToken(nanoidId(nextByte, size));
}

// coin() → "heads" or "tails".
function coinFn(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: (isExplicit: boolean) => void,
): TextToken {
  const { rng, rest } = takeSeed(args);
  if (rest.length > 0) throw new UserError(7966);
  setIsExplicit(true);
  return new TextToken(rng() < 0.5 ? "heads" : "tails");
}

// randombool() → true or false.
function randomBoolFn(args: TokenType[]): BooleanToken {
  const { rng, rest } = takeSeed(args);
  if (rest.length > 0) throw new UserError(7966);
  return new BooleanToken(rng() < 0.5);
}

// pick(a, b, c, ...) → one of the arguments at random (any token type). Raw so it
// receives the option tokens directly rather than their numeric values.
function pickFn(args: TokenType[]): TokenType {
  const { rng, rest } = takeSeed(args);
  if (rest.length === 0) throw new UserError(7965);
  return rest[Math.floor(rng() * rest.length)];
}

// randomcolor() → a random opaque colour (hex), rendered as a swatch in the app.
function randomColorFn(args: TokenType[]): ColorToken {
  const { rng, rest } = takeSeed(args);
  if (rest.length > 0) throw new UserError(7966);
  const channel = () =>
    (Math.floor(rng() * 256) & 0xff).toString(16).padStart(2, "0");
  const hex = `#${channel()}${channel()}${channel()}`;
  return new ColorToken(hex, hex, hex, "HEX");
}

// Build the raw function for a hash algorithm. Pure (no seed): hashes a single
// text (or number, hashed as its written form) argument to a lowercase hex
// digest. Async because hash-wasm instantiates wasm on first use.
function makeHashFn(name: HashName) {
  return async (
    args: TokenType[],
    _exprUnit: expressionUnit,
    setIsExplicit: (isExplicit: boolean) => void,
  ): Promise<TextToken> => {
    if (args.length !== 1) throw new UserError(7964);
    const a = args[0];
    const input =
      a instanceof TextToken
        ? a.text
        : a instanceof NumberToken
          ? a.toNumber().toString()
          : null;
    if (input === null) throw new UserError(7964);
    setIsExplicit(true);
    return new TextToken(await hashText(name, input));
  };
}
