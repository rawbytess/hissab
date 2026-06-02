import TokenBaseType from "../tokens/token_basetypes";

type SynonymEntry = string | { value: string; basetype: TokenBaseType };
type SynonymsType = { [syn: string]: SynonymEntry };

const raw: SynonymsType = {
  times: { value: "*", basetype: TokenBaseType.SYMBOL },
  time: "now",
  date: "today",
  in: "to",
  into: "to",
  as: "to",
  add: "sum",
  of: { value: "*", basetype: TokenBaseType.SYMBOL },
  "**": { value: "^", basetype: TokenBaseType.SYMBOL },
  per: { value: "/", basetype: TokenBaseType.SYMBOL },

  // Compound abbreviations — expanded via `per` into a unit expression
  // that the parser absorbs as a compound UnitToken.
  mph: "mile per hour",
  kph: "kilo meter per hour",
  fps: "feet per second",
  fpm: "feet per minute",

  // SI-derived single-letter symbols. Only the ones that don't collide with
  // existing aliases (`m → mega`, `k → kilo`, `b → giga`, `t → tera`,
  // `c → celsius via cel`) — the rest stay accessible by full name.
  n: "newton",
  j: "joule",
  w: "watt",
  pa: "pascal",
  hz: "hertz",

  // Energy
  cal: "calorie",
  kcal: "kilo calorie",
  kj: "kilo joule",
  mj: "mega joule",
  ev: "electron volt",
  kev: "kilo electron volt",
  mev: "mega electron volt",
  gev: "giga electron volt",
  wh: "watt hour",
  kwh: "kilo watt hour",
  mwh: "mega watt hour",
  gwh: "giga watt hour",
  "ft lb": "foot pound",
  "ft lbf": "foot pound",

  // Power
  hp: "horsepower",
  kw: "kilo watt",
  mw: "mega watt",
  gw: "giga watt",
  "btu/h": "btu per hour",
  "btu/hr": "btu per hour",
  "btu per hr": "btu per hour",

  // Force
  lbf: "pound force",
  kgf: "kilogram force",

  // Pressure
  kpa: "kilo pascal",
  mpa: "mega pascal",
  gpa: "giga pascal",
  mbar: "milli bar",
  psf: "pound per square foot",
  "mm hg": "mmhg",
  "in hg": "inhg",

  // Speed
  kn: "knot",
  kt: "knot",

  // Length
  ang: "angstrom",

  // Weight
  "metric ton": "tonne",
  "short ton": "ton",
  "troy oz": "troy ounce",
  cwt: "hundredweight",

  // Volume
  "imp gal": "imperial gallon",
  "imp qt": "imperial quart",
  "imp pt": "imperial pint",
  "imp fl oz": "imperial fluid ounce",

  // Frequency
  bpm: "rpm",

  // Radiation
  bq: "becquerel",
  ci: "curie",
  gy: "gray",
  sv: "sievert",

  // Illuminance / luminous flux
  lx: "lux",
  fc: "foot candle",
  lm: "lumen",

  // Viscosity / concentration
  cp: "centi poise",
  cst: "centi stokes",

  // Catalytic
  kat: "katal",

  // Magnetism
  mx: "maxwell",
  oe: "oersted",

  inches: "inch",
  centuries: "century",
  km: "kilo meter",
  cm: "centi meter",
  mm: "milli meter",
  nm: "nano meter",
  lb: "pound",

  foot: "feet",
  "'": "feet",
  '"': "inch",
  metre: "meter",
  mtr: "meter",
  au: "astronomical unit",
  sq: "square",

  "cu km": "cubic kilometer",
  "sq km": "square kilometer",

  ml: "milliliter",
  litre: "liter",
  ltr: "liter",
  tsp: "teaspoon",
  tbsp: "tablespoon",
  "fl oz": "fluid ounce",
  cu: "cubic",
  cc: "cubic centimeter",
  oz: "ounce",

  kg: "kilo gram",
  mg: "milli gram",
  "atomic mass unit": "amu",

  cel: "celsius",
  fah: "fahrenheit",

  kb: "kilo byte",
  mb: "mega byte",
  gb: "giga byte",
  tb: "tera byte",
  kbit: "kilo bit",
  mbit: "mega bit",
  gbit: "giga bit",
  tbit: "tera bit",

  hr: "hour",

  jan: "january",
  feb: "february",
  mar: "march",
  apr: "april",
  jun: "june",
  jul: "july",
  aug: "august",
  sep: "september",
  oct: "october",
  nov: "november",
  dec: "december",

  septillion: "yotta",
  sextillion: "zetta",
  quintillion: "exa",
  quadrillion: "peta",
  trillion: "tera",
  billion: "giga",
  million: "mega",
  thousand: "kilo",
  hundred: "hecto",
  ten: "deka",
  deca: "deka",
  tenth: "deci",
  hundredth: "centi",
  thousandth: "milli",
  millionth: "micro",
  billionth: "nano",
  trillionth: "pico",
  quadrillionth: "femto",
  quintillionth: "atto",
  sextillionth: "zepto",
  septillionth: "yocto",

  k: "kilo",
  m: "mega",
  b: "giga",
  t: "tera",

  log: "loge",

  annually: "yearly",

  "color temp": "color temperature",
  "hex color": "hex",
  "unix time": "epoch",
  "arithmetic mean": "avg",
  mean: "avg",
  absolute: "abs",
  minimum: "min",
  maximum: "max",
  rgba: "rgb",
  "std dev": "standard deviation",

  arctan: "atan",
  arccos: "acos",
  arcsin: "asin",
  arcsec: "asec",
  arccsc: "acsc",
  arccot: "acot",
  arctanh: "atanh",
  arccosh: "acosh",
  arcsinh: "asinh",
  arcsech: "asech",
  arccsch: "acsch",
  arccoth: "acoth",
};

type ResolvedSynonyms = {
  [syn: string]: { value: string; basetype: TokenBaseType };
};

const Synonyms: ResolvedSynonyms = {};
for (const key in raw) {
  const entry = raw[key];
  Synonyms[key] =
    typeof entry === "string"
      ? { value: entry, basetype: TokenBaseType.STRING }
      : entry;
}

export default Synonyms;
