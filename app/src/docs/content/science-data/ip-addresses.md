# IP addresses

Hissab understands IPv4 and IPv6 address literals, CIDR blocks, and IPv4 subnet
masks. You can convert formats, offset addresses, mask addresses with bitwise
operators, and calculate subnet details.

```hissab
192.168.1.1 to integer
2001:db8::1 to expanded
network(192.168.1.130/24)
contains(192.168.1.0/24, 192.168.1.5)
```

## Representations

- **IPv4** — `192.168.1.1`
- **IPv6 compressed** — `2001:db8::1`, `fe80::1`, `::1`
- **IPv6 canonical** — `2001:db8:0:0:0:0:0:1`
- **CIDR block** — `192.168.1.0/24`, `2001:db8::/32`
- **IPv4 subnet mask** — `255.255.255.0`
- **IPv4-mapped IPv6** — `::ffff:192.168.1.1`

## Format conversion

Use `to` for address format conversions.

| Target | Example |
| ---------------- | -------------------------------- |
| Integer | `192.168.1.1 to integer` |
| Dotted binary | `192.168.1.1 to binary` |
| Dotted hex | `192.168.1.1 to hex` |
| Expanded IPv6 | `2001:db8::1 to expanded` |
| Compressed IPv6 | `2001:db8:0:0:0:0:0:1 to compressed` |
| CIDR notation | `10.0.0.0/24 to cidr` |

```hissab
192.168.1.1 to integer
192.168.1.1 to binary
192.168.1.1 to hex
2001:db8::1 to expanded
2001:db8:0:0:0:0:0:1 to compressed
```

Use `ipv4(...)` and `ipv6(...)` to build addresses from integers.

```hissab
ipv4(3232235777)
```

## Address arithmetic

Add or subtract a number to offset an address. Subtract one address from another
to get the distance between them.

```hissab
192.168.1.1 + 5
192.168.0.255 + 1
192.168.1.10 - 192.168.1.1
```

## Bitwise masking

IP addresses work with bitwise operators, which makes common mask operations
direct.

```hissab
192.168.1.130 & 255.255.255.0
192.168.1.0 | 0.0.0.255
~255.255.255.0
```

## CIDR and subnet functions

Subnet functions need a CIDR block so Hissab knows the prefix length.

| Function | Description | Example |
| ------------------------- | ------------------------------- | -------------------------------- |
| `network(cidr)` | Network address | `network(192.168.1.130/24)` |
| `broadcast(cidr)` | Broadcast address | `broadcast(192.168.1.0/24)` |
| `netmask(cidr)` | Subnet mask | `netmask(10.0.0.0/24)` |
| `subnetmask(cidr)` | Alias for `netmask` | `subnetmask(10.0.0.0/24)` |
| `wildcard(cidr)` | Inverse mask | `wildcard(192.168.1.0/24)` |
| `firsthost(cidr)` | First usable host | `firsthost(192.168.1.0/24)` |
| `lasthost(cidr)` | Last usable host | `lasthost(192.168.1.0/24)` |
| `hosts(cidr)` | Usable host count | `hosts(192.168.1.0/24)` |
| `addresses(cidr)` | Total address count | `addresses(192.168.1.0/24)` |
| `prefix(maskOrCidr)` | Prefix length | `prefix(255.255.255.0)` |

```hissab
network(192.168.1.130/24)
broadcast(192.168.1.0/24)
netmask(10.0.0.0/24)
wildcard(192.168.1.0/24)
firsthost(192.168.1.0/24)
lasthost(192.168.1.0/24)
hosts(10.0.0.0/26)
addresses(192.168.1.0/24)
prefix(255.255.255.0)
```

## Classification and membership

Classification functions return `true` or `false`, except for `version`, which
returns `4` or `6`.

```hissab
version(2001:db8::1)
contains(192.168.1.0/24, 192.168.1.5)
isprivate(10.1.2.3)
ispublic(8.8.8.8)
isloopback(127.0.0.1)
ismulticast(224.0.0.1)
```

:::note

IPv6 results display in compressed form by default. Use `to expanded` when you
need the full zero-padded form.

:::

## Common mistakes

:::caution

- **`network(192.168.1.130)`** is invalid because network, broadcast, mask, and
  host calculations need a CIDR prefix. Use `network(192.168.1.130/24)`.
- **`3232235777 to ipv4`** is invalid. Use the constructor form:
  `ipv4(3232235777)`.
- **`192.168.1.5 in 192.168.1.0/24`** does not test subnet membership. Use
  `contains(192.168.1.0/24, 192.168.1.5)`.

:::
