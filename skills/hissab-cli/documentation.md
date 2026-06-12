# Hissab documentation

Hissab is a natural-language calculator. You give it an expression string
(`"15 km to miles"`, `"5! + 3^2"`, `"today - 1 feb 1990 to years"`) and it
returns the result. This document covers the basics every consumer needs.
Detailed syntax for each category lives in **chunks** — fetch only the ones
you need (see "How to fetch chunks" below).

## Writing expressions

- Numbers are decimals by default (`1234`, `3.14`, `5,000,000` with commas as
  digit grouping). Other bases use prefixes: `0b` binary, `0o` octal, `0x` hex.
- Operators and units can be written naturally with spaces: `15 kilometers to miles`,
  `13 kilograms + 12 pounds`, `25% of 200`.
- Use parentheses `()` to group sub-expressions exactly like in regular math:
  `(5 + 6) * 3`, `256 ^ (1/8)`.
- Functions take comma-separated arguments: `avg(1, 2, 3)`, `max(10m, 7.7m)`,
  `min(99, 34, 65)`.
- `true` and `false` are boolean literals (case-insensitive). They are mostly
  produced by predicate functions (`isprime(7)`, `isprivate(192.168.1.1)`,
  `contains(10.0.0.0/8, 10.1.2.3)`) but can also be written directly.
- One expression per call line. Pass several related expressions together so
  they can share labels and the `prev` keyword (see below).

## Labels and prev

Assign a result to a snake_case label with `=` and reuse it later in the same
batch of expressions.

```
monthly_savings = 4500 - 1200 - 600
yearly_savings = monthly_savings monthly to yearly
```

`prev` refers to the **immediately previous** result in the same batch. For
anything further back, label it.

```
78 kilometers to miles
prev - 45 miles
```

When you have multiple expressions, every expression must be either labelled
or referenced by position — the runner does not auto-name anonymous lines.

## Multi-line scope (line<N>, total<N>)

When expressions are evaluated together (CLI `hissab run`, the app's note
editor), each expression's result is also exposed to later expressions:

- `line<N>` / `l<N>` — the result of expression number N (1-indexed).
- `total<N>` — the running sum of all earlier expressions before line N.
- `prev` — same as `line<N-1>` for the current line; convenience alias.

```
100
200
total3 + line1   # 100 + 200 + 100 = 400
```

## Categories (fetch only what you need)

Hissab supports the following categories of operations. Each has its own
documentation chunk with full grammar, examples, and gotchas. Fetch a chunk
**before** writing expressions for a category you are not already confident
about.

- `arithmetic` — Plain math: +, -, *, /, ^, root, !, abs, mod
- `percentage` — % of value, discounts, percent add/subtract, reverse percent
- `unit_conversion` — `<value> <unit> to <unit>`, mixed-unit math, SI/binary prefixes, multi-target breakdown
- `compound_units` — Compound units like m/s, N*m^2, mph; dimensional arithmetic and conversion
- `set_operations` — max, min, lcm, gcd, permutation (perm), combination (comb)
- `number_theory` — Reduce decimals to fractions / mixed numbers, test primality, list divisors
- `logarithm` — Natural log, log10, log2
- `statistics` — avg, median, range, variance, standard / harmonic / geometric mean
- `probability` — P() probabilities, complement/AND/OR via ~ & |, conditional, Bayes, odds, binomial, expected value
- `finance` — Simple & compound interest, future/present value, loan & mortgage EMI, annuities, CAGR, ROI, APY, profit margin, markup, break-even, runway; tip, discount/sale price, sales tax, NPV, IRR, depreciation
- `health` — BMI, BMR (Mifflin–St Jeor), TDEE, body fat (Deurenberg), ideal weight (Devine), max/target heart rate, calories burned, water intake
- `trigonometry` — sin / cos / tan and inverse + hyperbolic variants; default unit is degree
- `geometry` — Area, perimeter/circumference, surface area & volume of common 2-D and 3-D shapes; slope of a line. Length-unit aware (meter → meter^2/meter^3)
- `date_time` — Date and time formats, date arithmetic, durations, timezones, unix epoch/timestamp
- `number_systems` — Decimal, binary (0b...), octal (0o...), hexadecimal (0x...); conversion and arithmetic
- `bitwise` — NOT (~), AND (&), OR (|), XOR (xor), left/right shifts
- `color` — Hex / rgb / rgba / hsl / named colors; format conversion, mixing, shading, complement, temperature
- `ip_address` — IPv4 & IPv6 addresses and CIDR: format conversion, address arithmetic, bitwise masking, subnet/network/broadcast/host math, classification
- `symbolic` — Free variables (x, y, z), implicit multiplication, simplify / collect like terms; derivative/integral/limit structure captured
- `complex_numbers` — Imaginary unit i and complex arithmetic (+, -, *, /, ^) in a + bi form
- `coordinate_systems` — Points/vectors in cartesian, polar, cylindrical, spherical & minkowski systems; arithmetic, `to`-conversions, distance/dot/cross/angle/magnitude
- `matrix` — Matrix literals [1 2, 3 4] (space=column, comma/semicolon=row); add/subtract/multiply, scalar ops, power/inverse, transpose, determinant, rank, rref, eigenvalues
- `visualization` — Graph expressions and values with draw()/plot(): single-variable curves y=f(x), complex numbers on the Argand plane, and coordinate points/vectors
- `random` — Random values: random() in [0,1)/random(max)/random(min,max), uuid() (v7, or uuid(4)), nanoid(), coin(), randombool(), pick(...), randomcolor(). In the app the value freezes (a managed seed) so it stays put across edits; re-roll for a new one
- `hashing` — Cryptographic & checksum hashes of text (or a number): md5, sha1, sha256, sha384, sha512, sha3 (sha3_256), ripemd160, crc32 — returns a lowercase hex digest
- `labels_and_prev` — Label expressions with `=`, reference earlier results via labels or the `prev` keyword

## How to fetch chunks

The way to fetch a chunk depends on the consumer:

- **Hissab CLI**: `hissab docs <tag>` (e.g. `hissab docs compound_units`).
  Run `hissab docs --list` to see every tag. For LLMs with very large context
  windows, run `hissab docs --all` to dump the base reference plus every chunk
  at once.
- **App agentic harness**: call the `fetch_hissab_docs` tool with
  `{ tags: ["<tag>", ...] }` — returns one or more chunks in a single call.

Skip the fetch for plain arithmetic. For anything else, pull the relevant
chunk(s) first, then write expressions.

## Common syntax pitfalls

These trip up agents most often. Two failure modes matter. Most mistakes now
**error** (you find out immediately) — in particular, any unrecognized word or
misspelled unit makes the whole expression invalid; Hissab does not drop it and
compute on the rest. The remaining trap is input that is **valid syntax but
means something other than you intended** (a date read as subtraction, an
unparenthesized exponent) — that still returns a wrong number with no warning.
Verify these before sending.

Incorrect: `10 to weekly`
Result: errors (the value being converted has no source unit)
Correct: `10 yearly to weekly` → 0.192 weekly
Why: `to` only names the *target*. The value must carry its own unit
(`10 monthly to yearly`, `5 mile to km`).

Incorrect: `2020-08-07` or `08/07/2020`
Result: `2,005` / `0.000566` (no error — `-` is subtraction, `/` is division)
Correct: `2020.08.07`, or unambiguously `7 aug 2020`
Why: dates use `.` separators or written-out months. Dashes and slashes are
read as arithmetic and silently produce a wrong number.

Incorrect: `100 kmh`, `5 apples + 3 apples`, `what is 10 + 10`
Result: all error (no result)
Correct: `100 kph` / `100 kilometer/hour`, `5 + 3`, `10 + 10`
Why: any unrecognized word, misspelled unit, or filler text makes the whole
expression invalid — Hissab does NOT silently drop it and compute on the rest
(a wrong number is worse than no result). Strip filler words yourself and
double-check unit spellings before sending.

Incorrect: `9.8 m/s^2`
Result: errors
Correct: `9.8 meter/second^2`
Why: `m` is the million multiplier, not meter. Spell out unit names in
compound units (`meter`, `second`, `kilo gram`).

Incorrect: `256 ^ 1/8`
Result: `32` (no error — parsed as `(256 ^ 1) / 8`)
Correct: `256 ^ (1/8)` → 2
Why: `^` binds tighter than `/`. Parenthesize fractional exponents (roots).

## Important limits

- **No currency conversion.** Hissab does not fetch exchange rates. If the
  user needs currency conversion, ask for the rate or look it up yourself,
  then build the expression with the literal rate.
- **Temperature and Duration units don't support multi-target breakdown** —
  use a separate expression per target unit (e.g. write two expressions for
  Celsius → Fahrenheit and Celsius → Kelvin instead of one combined).
- **`m` is the million multiplier** (`5 m` = 5,000,000), not the meter.
  When writing compound units, spell out `meter` (e.g. `9.8 meter/second^2`,
  not `9.8 m/s^2`).
