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
  "trigonometry",
  "date_time",
  "number_systems",
  "bitwise",
  "color",
  "ip_address",
  "symbolic",
  "complex_numbers",
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
    "Simple & compound interest, future/present value, loan & mortgage EMI, annuities, CAGR, ROI, APY, profit margin, markup, break-even, runway",
  trigonometry:
    "sin / cos / tan and inverse + hyperbolic variants; default unit is degree",
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
  labels_and_prev:
    "Label expressions with `=`, reference earlier results via labels or the `prev` keyword",
};
