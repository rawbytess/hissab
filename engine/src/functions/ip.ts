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

export const ipFunctions: Record<string, FunctionDef> = {
  // ---- IP addresses -----------------------------------------------------
  // All raw: they read the argument *token* so they can see an IpToken's
  // version + CIDR prefix. Subnet math lives in ./ip.ts (BigInt, v4+v6).
  network: {
    run: ipNetwork,
    description: "Network address of a CIDR block (e.g. network(10.0.5.9/24))",
    isRaw: true,
  },
  broadcast: {
    run: ipBroadcast,
    description: "Broadcast address of a CIDR block",
    isRaw: true,
  },
  netmask: {
    run: ipNetmask,
    description: "Subnet mask for a CIDR block (e.g. netmask(10.0.0.0/24))",
    isRaw: true,
  },
  subnetmask: {
    run: ipNetmask,
    description: "Subnet mask for a CIDR block (alias of netmask)",
    isRaw: true,
  },
  wildcard: {
    run: ipWildcard,
    description: "Wildcard (inverse) mask for a CIDR block",
    isRaw: true,
  },
  firsthost: {
    run: ipFirstHost,
    description: "First usable host address in a CIDR block",
    isRaw: true,
  },
  lasthost: {
    run: ipLastHost,
    description: "Last usable host address in a CIDR block",
    isRaw: true,
  },
  hosts: {
    run: ipHosts,
    description: "Number of usable hosts in a CIDR block",
    isRaw: true,
  },
  addresses: {
    run: ipAddresses,
    description: "Total number of addresses in a CIDR block",
    isRaw: true,
  },
  prefix: {
    run: ipPrefixLen,
    description: "Prefix length of a CIDR block or a subnet mask",
    isRaw: true,
  },
  version: {
    run: ipVersion,
    description: "IP version of an address (4 or 6)",
    isRaw: true,
  },
  contains: {
    run: ipContains,
    description:
      "Whether a subnet contains an address: contains(net/prefix, ip)",
    isRaw: true,
  },
  isprivate: {
    run: ipIsPrivate,
    description:
      "Whether an IP is in a private (RFC 1918 / unique-local) range",
    isRaw: true,
  },
  ispublic: {
    run: ipIsPublic,
    description: "Whether an IP is a global unicast (public) address",
    isRaw: true,
  },
  isloopback: {
    run: ipIsLoopback,
    description: "Whether an IP is a loopback address",
    isRaw: true,
  },
  ismulticast: {
    run: ipIsMulticast,
    description: "Whether an IP is a multicast address",
    isRaw: true,
  },
  ipv4: {
    run: ipFromNumberV4,
    description:
      "Convert a 32-bit integer to an IPv4 address: ipv4(3232235777)",
    isRaw: true,
  },
  ipv6: {
    run: ipFromNumberV6,
    description: "Convert an integer to an IPv6 address",
    isRaw: true,
  },
};

// ---- IP address helpers -------------------------------------------------

function ipArg(args: TokenType[]): IpToken {
  const a = args[0];
  if (!(a instanceof IpToken)) throw new UserError(7310);
  return a;
}

// Subnet operations need a CIDR prefix; a bare address (no `/n`) can't define a
// network/broadcast/host range.
function requirePrefix(token: IpToken): number {
  if (token.prefix === null) throw new UserError(7311);
  return token.prefix;
}

function ipCount(n: bigint): NumberToken {
  return tokenFactory(n.toString(), TokenBaseType.DECIMAL) as NumberToken;
}

function ipRangeIs(args: TokenType[], wanted: string[]): BooleanToken {
  const a = ipArg(args);
  return new BooleanToken(wanted.includes(ip.rangeOf(a.address, a.version)));
}

// ---- IP address functions -----------------------------------------------

function ipNetwork(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  // Keep the prefix so the result round-trips as a subnet (10.0.5.0/24).
  return a.withAddress(ip.networkAddress(a.address, p, a.version), p);
}

function ipBroadcast(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.broadcastAddress(a.address, p, a.version), null);
}

function ipNetmask(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.maskFromPrefix(p, a.version), null);
}

function ipWildcard(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.wildcardMask(p, a.version), null);
}

function ipFirstHost(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.networkAddress(a.address, p, a.version) + 1n, null);
}

function ipLastHost(args: TokenType[]): IpToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  return a.withAddress(ip.broadcastAddress(a.address, p, a.version) - 1n, null);
}

function ipHosts(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): NumberToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  const total = ip.addressCount(p, a.version);
  // IPv4 reserves network + broadcast; IPv6 has no broadcast.
  const usable = a.version === 4 && total > 2n ? total - 2n : total;
  setIsExplicit(true);
  return ipCount(usable);
}

function ipAddresses(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): NumberToken {
  const a = ipArg(args);
  const p = requirePrefix(a);
  setIsExplicit(true);
  return ipCount(ip.addressCount(p, a.version));
}

function ipPrefixLen(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): NumberToken {
  const a = ipArg(args);
  // From an explicit CIDR prefix, else derive it from a subnet-mask address.
  const p =
    a.prefix !== null ? a.prefix : ip.prefixFromMask(a.address, a.version);
  setIsExplicit(true);
  return ipCount(BigInt(p));
}

function ipVersion(
  args: TokenType[],
  _exprUnit: expressionUnit,
  setIsExplicit: SetExplicit,
): NumberToken {
  const a = ipArg(args);
  setIsExplicit(true);
  return ipCount(BigInt(a.version));
}

function ipContains(args: TokenType[]): BooleanToken {
  const subnet = args[0];
  const target = args[1];
  if (!(subnet instanceof IpToken) || !(target instanceof IpToken))
    throw new UserError(7312);
  if (subnet.version !== target.version) return new BooleanToken(false);
  const p = subnet.prefix ?? Number(ip.bitWidth(subnet.version));
  const net = ip.networkAddress(subnet.address, p, subnet.version);
  const broadcast = ip.broadcastAddress(subnet.address, p, subnet.version);
  return new BooleanToken(target.address >= net && target.address <= broadcast);
}

function ipIsPrivate(args: TokenType[]): BooleanToken {
  return ipRangeIs(args, ["private", "uniqueLocal"]);
}

function ipIsPublic(args: TokenType[]): BooleanToken {
  return ipRangeIs(args, ["unicast"]);
}

function ipIsLoopback(args: TokenType[]): BooleanToken {
  return ipRangeIs(args, ["loopback"]);
}

function ipIsMulticast(args: TokenType[]): BooleanToken {
  return ipRangeIs(args, ["multicast"]);
}

// Integer → IP address. Reads the literal's digits exactly (so 128-bit IPv6
// values survive — a JS number can't hold them); falls back to the numeric
// value for non-decimal literals (e.g. ipv4(0xc0a80101)).
function ipFromNumber(args: TokenType[], version: 4 | 6): IpToken {
  const t = args[0];
  if (t instanceof IpToken) return t;
  if (!(t instanceof NumberToken)) throw new UserError(7313);
  const raw = t.value.replaceAll(",", "");
  const address = /^-?\d+$/.test(raw)
    ? BigInt(raw)
    : BigInt(Math.trunc(t.toNumber()));
  if (address < 0n || address > ip.maxAddress(version))
    throw new UserError(7314);
  const str = address.toString();
  return new IpToken(str, str, version, address, null);
}

function ipFromNumberV4(args: TokenType[]): IpToken {
  return ipFromNumber(args, 4);
}

function ipFromNumberV6(args: TokenType[]): IpToken {
  return ipFromNumber(args, 6);
}
