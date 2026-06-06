# Hashing

Compute a cryptographic hash or checksum of some text. Pass a quoted string; the
result is a lowercase hexadecimal digest. Function names are case-insensitive.

```hissab
sha256("hello")
md5("hello")
crc32("hello world")
```

Hashes are **deterministic** — the same input always gives the same digest — so
(unlike `random` and `uuid`) they take no seed and never change between runs.

## Functions

| Function | Digest | Example |
| -------------- | ------------------------ | ------------------- |
| `md5(text)` | MD5 (128-bit) | `md5("hello")` |
| `sha1(text)` | SHA-1 (160-bit) | `sha1("hello")` |
| `sha256(text)` | SHA-256 (256-bit) | `sha256("hello")` |
| `sha384(text)` | SHA-384 (384-bit) | `sha384("hello")` |
| `sha512(text)` | SHA-512 (512-bit) | `sha512("hello")` |
| `sha3(text)` | SHA3-256 (alias `sha3_256`) | `sha3("hello")` |
| `ripemd160(text)` | RIPEMD-160 (160-bit) | `ripemd160("hello")` |
| `crc32(text)` | CRC32 checksum (8 hex chars) | `crc32("hello")` |

Strings use straight quotes, single or double — the quotes are not part of the
hashed text:

```hissab
sha256('hello')
sha256("hello world")
```

A number is hashed as its written form, so `md5(42)` hashes the text `"42"`:

```hissab
md5(42)
```

## Common mistakes

:::caution

- **Quote the input.** `sha256(hello)` treats `hello` as an unknown word and
  errors — write `sha256("hello")`.
- **MD5 and SHA-1** are fine as checksums but are not collision-resistant; prefer
  SHA-256 or stronger for anything security-sensitive.
- A digest is **text**, so it can't be fed into further arithmetic in the same
  expression.

:::
