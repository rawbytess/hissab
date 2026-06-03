export const ip_address = `
## IP address operations

Hissab understands IPv4 and IPv6 address literals, CIDR blocks, and subnet mask
addresses, and lets you convert, do address arithmetic, mask with bitwise
operators, and compute subnet/network/host values.

### Representations

- IPv4: \`192.168.1.1\`
- IPv6 (compressed): \`2001:db8::1\`, \`fe80::1\`, \`::1\`
- IPv6 (uncompressed, no leading zeros): \`2001:db8:0:0:0:0:0:1\`
- CIDR block: \`192.168.1.0/24\`, \`2001:db8::/32\`
- Subnet mask (just an IPv4 address): \`255.255.255.0\`
- IPv4-mapped IPv6: \`::ffff:192.168.1.1\`

### Format conversion (\`to ...\`)

- To integer: \`192.168.1.1 to integer\` → \`3232235777\`
- To binary (dotted per-octet): \`192.168.1.1 to binary\` → \`11000000.10101000.00000001.00000001\`
- To hex (dotted per-octet): \`192.168.1.1 to hex\` → \`c0.a8.01.01\`
- Expand IPv6: \`2001:db8::1 to expanded\` → \`2001:0db8:0000:0000:0000:0000:0000:0001\`
- Compress IPv6: \`2001:db8:0:0:0:0:0:1 to compressed\` → \`2001:db8::1\`
- CIDR notation: \`10.0.0.0/24 to cidr\` → \`10.0.0.0/24\`
- Integer → address (functions): \`ipv4(3232235777)\` → \`192.168.1.1\`; \`ipv6(...)\`

### Address arithmetic

- Offset an address: \`192.168.1.1 + 5\` → \`192.168.1.6\`
- Step back: \`192.168.0.255 + 1\` → \`192.168.1.0\`
- Distance between addresses: \`192.168.1.10 - 192.168.1.1\` → \`9\`

### Bitwise masking

- AND with a mask → network: \`192.168.1.130 & 255.255.255.0\` → \`192.168.1.0\`
- OR with a wildcard → broadcast: \`192.168.1.0 | 0.0.0.255\` → \`192.168.1.255\`
- NOT a mask → wildcard: \`~255.255.255.0\` → \`0.0.0.255\`

### Subnet / CIDR functions (take a CIDR block)

- \`network(192.168.1.130/24)\` → \`192.168.1.0/24\`
- \`broadcast(192.168.1.0/24)\` → \`192.168.1.255\`
- \`netmask(10.0.0.0/24)\` (alias \`subnetmask\`) → \`255.255.255.0\`
- \`wildcard(192.168.1.0/24)\` → \`0.0.0.255\`
- \`firsthost(192.168.1.0/24)\` → \`192.168.1.1\`
- \`lasthost(192.168.1.0/24)\` → \`192.168.1.254\`
- \`hosts(192.168.1.0/24)\` → \`254\` (usable); \`addresses(192.168.1.0/24)\` → \`256\` (total)
- \`prefix(255.255.255.0)\` → \`24\` (prefix length of a mask or CIDR)

### Classification & membership (return true / false)

- \`version(2001:db8::1)\` → \`6\`
- \`contains(192.168.1.0/24, 192.168.1.5)\` → \`true\`
- \`isprivate(10.1.2.3)\` → \`true\`; \`ispublic(8.8.8.8)\` → \`true\`
- \`isloopback(127.0.0.1)\` → \`true\`; \`ismulticast(224.0.0.1)\` → \`true\`

### Examples

User: what is the network address of 192.168.1.130/24
Expression: \`network(192.168.1.130/24)\` → \`192.168.1.0/24\`

User: how many usable hosts in a /26
Expression: \`hosts(10.0.0.0/26)\` → \`62\`

User: subnet mask for a /24
Expression: \`netmask(10.0.0.0/24)\` → \`255.255.255.0\`

User: is 10.1.2.3 inside 10.0.0.0/8
Expression: \`contains(10.0.0.0/8, 10.1.2.3)\` → \`true\`

User: turn 3232235777 into an IPv4 address
Expression: \`ipv4(3232235777)\` → \`192.168.1.1\`

### Common mistakes

Incorrect: \`network(192.168.1.130)\`
Result: errors
Correct: \`network(192.168.1.130/24)\`
Why: network / broadcast / netmask / hosts need a CIDR prefix (\`/n\`) to know
the subnet boundary; a bare address has none.

Incorrect: \`3232235777 to ipv4\`
Result: errors
Correct: \`ipv4(3232235777)\`
Why: integer → address is the \`ipv4()\` / \`ipv6()\` function form, not a \`to\`
target.

Incorrect: \`192.168.1.5 in 192.168.1.0/24\`
Result: errors (\`in\` is an alias for the \`to\` conversion keyword)
Correct: \`contains(192.168.1.0/24, 192.168.1.5)\`
Why: subnet membership is the \`contains(subnet, address)\` function.

### Notes

- \`+\`/\`-\` with a number offsets the address; \`address - address\` is the count
  of addresses between them.
- \`to binary\` and \`to hex\` give the dotted per-octet view; \`to integer\` gives
  the single decimal value (exact for both IPv4 and IPv6).
- IPv6 results display compressed (RFC 5952) by default; use \`to expanded\` for
  the full zero-padded form.
- Type IPv6 in compressed or canonical (no leading zeros) form — e.g.
  \`2001:db8::1\` or \`2001:db8:0:0:0:0:0:1\`. The fully zero-padded form
  (\`2001:0db8:0000:...\`) is an output of \`to expanded\`, not an input form.
`;

export default ip_address;
