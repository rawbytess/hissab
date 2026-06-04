import { Units } from "./unit_types";

const SI_PREFIXES_FULL = [
  "peta",
  "tera",
  "giga",
  "mega",
  "kilo",
  "hecto",
  "deca",
  "deci",
  "centi",
  "milli",
  "micro",
  "nano",
  "pico",
  "femto",
];
const SI_PREFIXES_DATA = ["exa", "peta", "tera", "giga", "mega", "kilo"];

const METRIC_BASES = ["meter", "liter", "gram", "second"];
const DATA_BASES = ["bit", "byte"];

const Plurals = new Set<string>();

for (const key in Units) {
  const plural = Units[key].plural;
  if (plural) Plurals.add(plural);
}

for (const base of METRIC_BASES) {
  const plural = Units[base]?.plural;
  if (!plural) continue;
  for (const p of SI_PREFIXES_FULL) Plurals.add(p + plural);
}
for (const base of DATA_BASES) {
  const plural = Units[base]?.plural;
  if (!plural) continue;
  for (const p of SI_PREFIXES_DATA) Plurals.add(p + plural);
}

// Manual overrides: aliases, common misspellings, and number-word plurals.
const OVERRIDES = [
  "units",
  "lbs",
  "carrats",
  "amus",
  "hundereds",
  "thousands",
  "millions",
  "billions",
  "trillions",
  "quadrallions",
  "kms",
  "hrs",
  // New units (irregulars, aliases, and ones whose `plural` field is identical
  // to the singular but typed in plural form by users)
  "calories",
  "kilocalories",
  "ergs",
  "knots",
  "fathoms",
  "furlongs",
  "leagues",
  "chains",
  "rods",
  "hands",
  "picas",
  "angstroms",
  "ares",
  "barns",
  "fortnights",
  "turns",
  "stones",
  "slugs",
  "grains",
  "drams",
  "tonnes",
  "hogsheads",
  "jiggers",
  "pecks",
  "bushels",
  "minims",
  "horsepowers",
  "dynes",
  "kips",
  "therms",
  "lumens",
  "becquerels",
  "curies",
  "grays",
  "sieverts",
  "rads",
  "rems",
  "katals",
  "poises",
  "phots",
  "maxwells",
  "oersteds",
  "galileos",
  "btus",
];
for (const o of OVERRIDES) Plurals.add(o);

// Irregular plurals where dropping a single trailing character yields the wrong
// singular (e.g. "inches" -> "inche", not "inch"). Keyed by the plural's *last
// word*; token_factory replaces the matched last word with this singular before
// the generic trailing-"s" trim, so multiword forms like "square inches" and
// "cubic inches" resolve too.
export const IrregularPlurals: Record<string, string> = {
  inches: "inch",
};

export default Plurals;
