export const OPERATION_TAGS = [
  "arithmetic",
  "percentage",
  "unit_conversion",
  "compound_units",
  "set_operations",
  "number_theory",
  "logarithm",
  "statistics",
  "probability",
  "finance",
  "health",
  "trigonometry",
  "geometry",
  "date_time",
  "number_systems",
  "bitwise",
  "color",
  "ip_address",
  "symbolic",
  "complex_numbers",
  "coordinate_systems",
  "matrix",
  "visualization",
  "random",
  "hashing",
  "labels_and_prev",
] as const;

export type OperationTag = (typeof OPERATION_TAGS)[number];

export const tagDescriptions: Record<OperationTag, string> = {
  arithmetic: "Plain math: +, -, *, /, ^, root, !, abs, mod",
  percentage: "% of value, discounts, percent add/subtract, reverse percent",
  unit_conversion:
    "`<value> <unit> to <unit>`, mixed-unit math, SI/binary prefixes, multi-target breakdown",
  compound_units:
    "Compound units like m/s, N*m^2, mph; dimensional arithmetic and conversion",
  set_operations: "max, min, lcm, gcd, permutation (perm), combination (comb)",
  number_theory:
    "Reduce decimals to fractions / mixed numbers, test primality, list divisors",
  logarithm: "Natural log, log10, log2",
  statistics:
    "avg, median, range, variance, standard / harmonic / geometric mean",
  probability:
    "P() probabilities, complement/AND/OR via ~ & |, conditional, Bayes, odds, binomial, expected value",
  finance:
    "Simple & compound interest, future/present value, loan & mortgage EMI, annuities, CAGR, ROI, APY, profit margin, markup, break-even, runway; tip, discount/sale price, sales tax, NPV, IRR, depreciation",
  health:
    "BMI, BMR (Mifflin–St Jeor), TDEE, body fat (Deurenberg), ideal weight (Devine), max/target heart rate, calories burned, water intake",
  trigonometry:
    "sin / cos / tan and inverse + hyperbolic variants; default unit is degree",
  geometry:
    "Area, perimeter/circumference, surface area & volume of common 2-D and 3-D shapes; slope of a line. Length-unit aware (meter → meter^2/meter^3)",
  date_time:
    "Date and time formats, date arithmetic, durations, timezones, unix epoch/timestamp",
  number_systems:
    "Decimal, binary (0b...), octal (0o...), hexadecimal (0x...); conversion and arithmetic",
  bitwise: "NOT (~), AND (&), OR (|), XOR (xor), left/right shifts",
  color:
    "Hex / rgb / rgba / hsl / named colors; format conversion, mixing, shading, complement, temperature",
  ip_address:
    "IPv4 & IPv6 addresses and CIDR: format conversion, address arithmetic, bitwise masking, subnet/network/broadcast/host math, classification",
  symbolic:
    "Free variables (x, y, z), implicit multiplication, simplify / collect like terms; derivative/integral/limit structure captured",
  complex_numbers:
    "Imaginary unit i and complex arithmetic (+, -, *, /, ^) in a + bi form",
  coordinate_systems:
    "Points/vectors in cartesian, polar, cylindrical, spherical & minkowski systems; arithmetic, `to`-conversions, distance/dot/cross/angle/magnitude",
  matrix:
    "Matrix literals [1 2, 3 4] (space=column, comma/semicolon=row); add/subtract/multiply, scalar ops, power/inverse, transpose, determinant, rank, rref, eigenvalues",
  visualization:
    "Graph expressions and values with draw()/plot(): single-variable curves y=f(x), complex numbers on the Argand plane, and coordinate points/vectors",
  random:
    "Random values: random() in [0,1)/random(max)/random(min,max), uuid() (v7, or uuid(4)), nanoid(), coin(), randombool(), pick(...), randomcolor(). In the app the value freezes (a managed seed) so it stays put across edits; re-roll for a new one",
  hashing:
    "Cryptographic & checksum hashes of text (or a number): md5, sha1, sha256, sha384, sha512, sha3 (sha3_256), ripemd160, crc32 — returns a lowercase hex digest",
  labels_and_prev:
    "Label expressions with `=`, reference earlier results via labels or the `prev` keyword",
};
