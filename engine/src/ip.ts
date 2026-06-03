// IP-address math helpers. Parsing/validation/canonical formatting lean on
// `ipaddr.js` (it gets IPv6 zero-compression right); everything numeric —
// arithmetic, subnetting, masks, host counts — is done here with BigInt so v4
// (32-bit) and v6 (128-bit) share one uniform code path.
import ipaddr from "ipaddr.js";

export type IpVersion = 4 | 6;

const V4_BITS = 32n;
const V6_BITS = 128n;

export function bitWidth(version: IpVersion): bigint {
  return version === 4 ? V4_BITS : V6_BITS;
}

// Largest address in the family: 2^bits - 1 (used as the all-ones mask too).
export function maxAddress(version: IpVersion): bigint {
  return (1n << bitWidth(version)) - 1n;
}

function bytesToBigInt(bytes: number[]): bigint {
  let acc = 0n;
  for (const b of bytes) acc = (acc << 8n) | BigInt(b);
  return acc;
}

function bigIntToBytes(address: bigint, version: IpVersion): number[] {
  const len = version === 4 ? 4 : 16;
  const bytes = new Array<number>(len);
  let acc = address;
  for (let i = len - 1; i >= 0; i--) {
    bytes[i] = Number(acc & 0xffn);
    acc >>= 8n;
  }
  return bytes;
}

export interface ParsedIp {
  version: IpVersion;
  address: bigint;
  prefix: number | null;
}

// Parse an IPv4/IPv6 literal, with optional `/<prefix>` CIDR suffix. Returns
// null when the string isn't a valid address — the lexer/factory turns that
// into an UndefinedToken (the standard "unrecognised input" path). This is
// recognition, not evaluation, so a miss is a soft no-match, not a UserError.
export function parseIp(value: string): ParsedIp | null {
  try {
    if (value.includes("/")) {
      const [addr, prefix] = ipaddr.parseCIDR(value);
      const version = addr.kind() === "ipv4" ? 4 : 6;
      return { version, address: bytesToBigInt(addr.toByteArray()), prefix };
    }
    if (!ipaddr.isValid(value)) return null;
    const addr = ipaddr.parse(value);
    const version = addr.kind() === "ipv4" ? 4 : 6;
    return {
      version,
      address: bytesToBigInt(addr.toByteArray()),
      prefix: null,
    };
  } catch {
    return null;
  }
}

// Canonical text: dotted-decimal (v4) or RFC 5952 compressed (v6).
export function toCanonical(address: bigint, version: IpVersion): string {
  return ipaddr.fromByteArray(bigIntToBytes(address, version)).toString();
}

// Fully expanded text. v4 is already expanded (dotted decimal); v6 → eight
// zero-padded hextets (2001:0db8:0000:…:0001).
export function toExpanded(address: bigint, version: IpVersion): string {
  if (version === 4) return toCanonical(address, 4);
  const groups: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const g = (address >> BigInt(i * 16)) & 0xffffn;
    groups.push(g.toString(16).padStart(4, "0"));
  }
  return groups.join(":");
}

// Per-octet (v4) / per-hextet (v6) binary — the bit-layout view engineers use
// to read a mask. v4: 11000000.10101000.00000001.00000001
export function toBinary(address: bigint, version: IpVersion): string {
  if (version === 4) {
    const parts: string[] = [];
    for (let i = 3; i >= 0; i--) {
      const b = (address >> BigInt(i * 8)) & 0xffn;
      parts.push(b.toString(2).padStart(8, "0"));
    }
    return parts.join(".");
  }
  const parts: string[] = [];
  for (let i = 7; i >= 0; i--) {
    const g = (address >> BigInt(i * 16)) & 0xffffn;
    parts.push(g.toString(2).padStart(16, "0"));
  }
  return parts.join(":");
}

// Per-octet hex (v4 → c0.a8.01.01); v6 reuses the expanded hextets.
export function toHex(address: bigint, version: IpVersion): string {
  if (version === 4) {
    const parts: string[] = [];
    for (let i = 3; i >= 0; i--) {
      const b = (address >> BigInt(i * 8)) & 0xffn;
      parts.push(b.toString(16).padStart(2, "0"));
    }
    return parts.join(".");
  }
  return toExpanded(address, 6);
}

// prefix length → contiguous high-bit mask (24 → 255.255.255.0).
export function maskFromPrefix(prefix: number, version: IpVersion): bigint {
  const bits = bitWidth(version);
  if (prefix <= 0) return 0n;
  return (maxAddress(version) << (bits - BigInt(prefix))) & maxAddress(version);
}

// Count of leading 1-bits in a (contiguous) mask → prefix length.
export function prefixFromMask(mask: bigint, version: IpVersion): number {
  const bits = Number(bitWidth(version));
  let count = 0;
  for (let i = bits - 1; i >= 0; i--) {
    if (((mask >> BigInt(i)) & 1n) === 1n) count++;
    else break;
  }
  return count;
}

export function networkAddress(
  address: bigint,
  prefix: number,
  version: IpVersion,
): bigint {
  return address & maskFromPrefix(prefix, version);
}

export function broadcastAddress(
  address: bigint,
  prefix: number,
  version: IpVersion,
): bigint {
  const mask = maskFromPrefix(prefix, version);
  return (address & mask) | (~mask & maxAddress(version));
}

export function wildcardMask(prefix: number, version: IpVersion): bigint {
  return ~maskFromPrefix(prefix, version) & maxAddress(version);
}

// Total addresses spanned by a /prefix block: 2^(bits-prefix).
export function addressCount(prefix: number, version: IpVersion): bigint {
  return 1n << (bitWidth(version) - BigInt(prefix));
}

// Classification bucket from ipaddr.js (private / loopback / multicast / …).
export function rangeOf(address: bigint, version: IpVersion): string {
  return ipaddr.fromByteArray(bigIntToBytes(address, version)).range();
}
