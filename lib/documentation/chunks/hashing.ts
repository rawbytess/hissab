export const hashing = `
## Hashing

Compute a cryptographic hash or checksum of some text. The argument is a quoted
string; the result is a lowercase hexadecimal digest. Function names are matched
case-insensitively. Unlike \`random\`/\`uuid\`, hashes are deterministic — the same
input always produces the same digest — so they need no seed.

### Functions

- \`md5(text)\` — 128-bit MD5 digest.
- \`sha1(text)\` — 160-bit SHA-1 digest.
- \`sha256(text)\` — 256-bit SHA-256 digest.
- \`sha384(text)\` — 384-bit SHA-384 digest.
- \`sha512(text)\` — 512-bit SHA-512 digest.
- \`sha3(text)\` / \`sha3_256(text)\` — 256-bit SHA3 (Keccak) digest.
- \`ripemd160(text)\` — 160-bit RIPEMD-160 digest.
- \`crc32(text)\` — 32-bit CRC32 checksum (8 hex chars).

The text is a quoted string literal: \`sha256("hello")\`. A number is hashed as its
written form, so \`md5(42)\` hashes the text \`"42"\`.

### Examples

User: sha256 of hello
Expression: \`sha256("hello")\`

User: md5 hash of the string password
Expression: \`md5("password")\`

User: crc32 checksum of "hello world"
Expression: \`crc32("hello world")\`

User: sha3 of my-api-key
Expression: \`sha3("my-api-key")\`

### Notes

- Strings use straight quotes, single or double: \`sha256('hi')\` or
  \`sha256("hi")\`. Quote characters are not part of the hashed text.
- MD5 and SHA-1 are fine as checksums but are not collision-resistant; prefer
  SHA-256 or stronger for security-sensitive work.
- A digest is text, so it can't be used in further arithmetic in the same
  expression.
`;

export default hashing;
