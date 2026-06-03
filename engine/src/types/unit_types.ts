import chroma from "chroma-js";
import spacetime from "spacetime";
import { UnhandledError } from "../exceptions";
import TokenBaseType, { type TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import {
  ColorToken,
  type colorTypes,
  DateToken,
  IpToken,
  type ipFormat,
  NumberToken,
  type UnitToken,
} from "../tokens/tokens";
import UnitTypes from "./unit_enum";

export interface ConstantIF {
  [constant: string]: {
    value: number;
    unit: null;
  };
}
const Constants: ConstantIF = {
  pi: { value: Math.PI, unit: null },
  e: { value: Math.E, unit: null },
};

export type DimensionVector = Record<string, number>;

export interface UnitsTypeIF {
  type: UnitTypes;
  description: string;
  plural?: string;
  factor?: number;
  factors?: {
    [key: string]: number;
  };
  convertTo?: string[];
  datafactor?: number;
  kelvin?: (value: number) => number;
  fahrenheit?: (value: number) => number;
  rankine?: (value: number) => number;
  celsius?: (value: number) => number;
  timezone?: string;
  func?: (token: TokenType) => any;
  // Explicit dimensional vector for derived units (newton, joule, pascal, etc.).
  // When set, `factor` is the multiplier from this unit into the canonical SI
  // product expressed by `dim`. Simple units omit this — their dim is derived
  // from `type` via dimOfType().
  dim?: DimensionVector;
}

export interface UnitsIF {
  [unit: string]: UnitsTypeIF;
}
const metricFamily = ["kilo", "_", "centi", "milli", "micro", "nano"];
const milesFamily = ["mile", "yard", "feet", "inch"];
const areaFamily = [
  "acre",
  "square mile",
  "square yard",
  "square feet",
  "square inch",
];
const volumeFamily = ["cubic mile", "cubic yard", "cubic feet", "cubic inch"];
const gallonFamily = ["gallon", "quart", "pint", "fluid ounce"];
const cupFamily = ["cup", "tablespoon", "teaspoon"];
const poundFamily = ["pound", "ounce"];
const angleFamily = ["arcminute", "arcsecond", "degree"];
const dataFamily = ["exa", "peta", "tera", "giga", "mega", "kilo", "_"];
const timeFamily = [
  "century",
  "year",
  "week",
  "day",
  "hour",
  "minute",
  "second",
];

const Units: UnitsIF = {
  meter: {
    plural: "meters",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 1,
    convertTo: metricFamily,
    factors: {
      meter: 1,
      mile: 0.0006213712,
      yard: 1.0936132983,
      feet: 3.280839895,
      inch: 39.37007874,
      micron: 1000000,
      parsec: 3.240779289e-17,
      "astronomical unit": 6.684587122e-12,
      "nautical mile": 0.0005399568,
      "light year": 1.057000834e-16,
    },
  },
  mile: {
    plural: "miles",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 1609.3,
    convertTo: milesFamily,
    factors: {
      meter: 1609.344,
      mile: 1,
      yard: 1760,
      feet: 5280,
      inch: 63360,
      micron: 1609344000,
      parsec: 5.215528705e-14,
      "astronomical unit": 1.075780017e-8,
      "nautical mile": 0.8689762419,
      "light year": 1.70107795e-13,
    },
  },
  yard: {
    plural: "yards",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 0.9144,
    convertTo: milesFamily,
    factors: {
      meter: 0.9144,
      mile: 0.0005682,
      yard: 1,
      feet: 3,
      inch: 36,
      micron: 914400,
      parsec: 2.963368582e-17,
      "astronomical unit": 6.112386464e-12,
      "nautical mile": 0.0004937365,
      "light year": 9.665215626e-17,
    },
  },
  feet: {
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 0.3048,
    convertTo: milesFamily,
    factors: {
      meter: 0.3048,
      mile: 0.0001893939,
      yard: 0.3333333333,
      feet: 1,
      inch: 12,
      micron: 304800,
      parsec: 9.877895274e-18,
      "astronomical unit": 2.037462154e-12,
      "nautical mile": 0.0001645788,
      "light year": 3.221738542e-17,
    },
  },
  inch: {
    plural: "inches",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 0.0254,
    convertTo: milesFamily,
    factors: {
      meter: 0.0254,
      mile: 0.0000157828,
      yard: 0.0277777778,
      feet: 0.0833333333,
      inch: 1,
      micron: 25400,
      parsec: 8.231579395e-19,
      "astronomical unit": 1.697885129e-13,
      "nautical mile": 0.0000137149,
      "light year": 2.684782118e-18,
    },
  },
  micron: {
    plural: "microns",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 1e-6,
    factors: {
      meter: 0.000001,
      mile: 6.213711922e-10,
      yard: 0.0000010936,
      feet: 0.0000032808,
      inch: 0.0000393701,
      micron: 1,
      parsec: 3.240779289e-23,
      "astronomical unit": 6.684587122e-18,
      "nautical mile": 5.399568034e-10,
      "light year": 1.057000834e-22,
    },
  },
  parsec: {
    plural: "parsecs",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 30856775812799588,
    factors: {
      meter: 30856775812799588,
      mile: 19173511575399,
      yard: 33745380372702720,
      feet: 101236141118108160,
      inch: 1214833693417291800,
      micron: 3.085677581e22,
      parsec: 1,
      "astronomical unit": 206264.80625,
      "nautical mile": 16661326032829,
      "light year": 3.2615637769,
    },
  },
  "astronomical unit": {
    plural: "astronomical units",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 149597870691,
    factors: {
      meter: 149597870691,
      mile: 92955807.267,
      yard: 163602220791,
      feet: 490806662372,
      inch: 5889679948464,
      micron: 149597870690999970,
      parsec: 0.0000048481,
      "astronomical unit": 1,
      "nautical mile": 80776388.062,
      "light year": 0.0000158125,
    },
  },
  "nautical mile": {
    plural: "nautical miles",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 1852,
    factors: {
      meter: 1852,
      mile: 1.150779448,
      yard: 2025.3718285,
      feet: 6076.1154856,
      inch: 72913.385827,
      micron: 1852000000,
      parsec: 6.001923244e-14,
      "astronomical unit": 1.237985535e-8,
      "nautical mile": 1,
      "light year": 1.957565544e-13,
    },
  },
  "light year": {
    plural: "light years",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 9460730472580800,
    factors: {
      meter: 9460730472580044,
      mile: 5878625373183,
      yard: 10346380656802248,
      feet: 31039141970406748,
      inch: 372469703644879100,
      micron: 9.460730472e21,
      parsec: 0.3066013938,
      "astronomical unit": 63241.077088,
      "nautical mile": 5108385784330,
      "light year": 1,
    },
  },
  angstrom: {
    plural: "angstroms",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 1e-10,
    factors: { meter: 1e-10 },
  },
  fathom: {
    plural: "fathoms",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 1.8288,
    factors: { meter: 1.8288, feet: 6, yard: 2 },
  },
  furlong: {
    plural: "furlongs",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 201.168,
    factors: { meter: 201.168, feet: 660, yard: 220, mile: 0.125 },
  },
  league: {
    plural: "leagues",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 4828.032,
    factors: { meter: 4828.032, mile: 3 },
  },
  chain: {
    plural: "chains",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 20.1168,
    factors: { meter: 20.1168, feet: 66, yard: 22 },
  },
  rod: {
    plural: "rods",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 5.0292,
    factors: { meter: 5.0292, feet: 16.5, yard: 5.5 },
  },
  hand: {
    plural: "hands",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 0.1016,
    factors: { meter: 0.1016, inch: 4 },
  },
  pica: {
    plural: "picas",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 0.0042333,
    factors: { meter: 0.0042333, inch: 0.16666667 },
  },
  point: {
    plural: "points",
    type: UnitTypes.LENGTH,
    description: "Unit of Length",
    factor: 0.0003528,
    factors: { meter: 0.0003528, inch: 0.01388889 },
  },

  hectare: {
    plural: "hectares",
    type: UnitTypes.AREA,
    description: "Unit of Area",
    factor: 10000,
    factors: {
      hectare: 1,
      acre: 2.4710538147,
      "square mile": 0.0038610216,
      "square feet": 107639.10417,
      "square inch": 15500031,
      "square yard": 11959.900463,
      "square meter": 10000,
    },
  },
  acre: {
    plural: "acres",
    type: UnitTypes.AREA,
    description: "Unit of Area",
    factor: 4046.8564224,
    convertTo: areaFamily,
    factors: {
      hectare: 0.4046856422,
      acre: 1,
      "square mile": 0.0015625,
      "square feet": 43560,
      "square inch": 6272640,
      "square yard": 4840,
      "square meter": 4046.8564224,
    },
  },
  "square mile": {
    plural: "square miles",
    type: UnitTypes.AREA,
    description: "Unit of Area",
    factor: 2589988.110336,
    convertTo: areaFamily,
    factors: {
      hectare: 258.99881103,
      acre: 640,
      "square mile": 1,
      "square feet": 27878400,
      "square inch": 4014489600,
      "square yard": 3097600,
      "square meter": 2589988.1103,
    },
  },
  "square feet": {
    type: UnitTypes.AREA,
    description: "Unit of Area",
    factor: 0.09290304,
    convertTo: areaFamily,
    factors: {
      hectare: 0.0000092903,
      acre: 0.0000229568,
      "square mile": 3.587006427e-8,
      "square feet": 1,
      "square inch": 144,
      "square yard": 0.1111111111,
      "square meter": 0.09290304,
    },
  },
  "square inch": {
    plural: "square inches",
    type: UnitTypes.AREA,
    description: "Unit of Area",
    factor: 0.00064516,
    convertTo: areaFamily,
    factors: {
      hectare: 6.4516e-8,
      acre: 1.594225079e-7,
      "square mile": 2.490976686e-10,
      "square feet": 0.0069444444,
      "square inch": 1,
      "square yard": 0.0007716049,
      "square meter": 0.00064516,
    },
  },
  "square yard": {
    plural: "square yards",
    type: UnitTypes.AREA,
    description: "Unit of Area",
    factor: 0.83612736,
    convertTo: areaFamily,
    factors: {
      hectare: 0.0000836127,
      acre: 0.0002066116,
      "square mile": 3.228305785e-7,
      "square feet": 9,
      "square inch": 1296,
      "square yard": 1,
      "square meter": 0.83612736,
    },
  },

  "square meter": {
    plural: "square meters",
    type: UnitTypes.AREA,
    description: "Unit of Area",
    factor: 1,
    convertTo: metricFamily,
    factors: {
      hectare: 0.0001,
      acre: 0.0002471054,
      "square mile": 3.861021585e-7,
      "square feet": 10.763910417,
      "square inch": 1550.0031,
      "square yard": 1.1959900463,
      "square meter": 1,
    },
  },
  are: {
    plural: "ares",
    type: UnitTypes.AREA,
    description: "Unit of Area",
    factor: 100,
    factors: { "square meter": 100, hectare: 0.01 },
  },
  barn: {
    plural: "barns",
    type: UnitTypes.AREA,
    description: "Unit of Area (nuclear physics cross section)",
    factor: 1e-28,
    factors: { "square meter": 1e-28 },
  },

  liter: {
    plural: "liters",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 1,
    convertTo: metricFamily,
    factors: {
      liter: 1,
      gallon: 0.2641720524,
      quart: 1.0566882094,
      pint: 2.1133764189,
      cup: 4.2267528377,
      tablespoon: 67.628045404,
      teaspoon: 202.88413621,
      barrel: 0.0083864144,
      "fluid ounce": 33.814022702,
      "cubic mile": 2.399127585e-13,
      "cubic foot": 0.0353146667,
      "cubic feet": 0.0353146667,
      "cubic inch": 61.023744095,
      "cubic yard": 0.0013079506,
      "cubic meter": 0.001,
    },
  },
  gallon: {
    plural: "gallons",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 3.785411784,
    convertTo: gallonFamily,
    factors: {
      liter: 3.785411784,
      gallon: 1,
      quart: 4,
      pint: 8,
      cup: 16,
      tablespoon: 256,
      teaspoon: 768,
      barrel: 0.0317460317,
      "fluid ounce": 128,
      "cubic mile": 9.081685834e-13,
      "cubic foot": 0.1336805556,
      "cubic feet": 0.1336805556,
      "cubic inch": 231,
      "cubic yard": 0.0049511317,
      "cubic meter": 0.0037854118,
    },
  },
  quart: {
    plural: "quarts",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 0.946352946,
    convertTo: gallonFamily,
    factors: {
      liter: 0.946352946,
      gallon: 0.25,
      quart: 1,
      pint: 2,
      cup: 4,
      tablespoon: 64,
      teaspoon: 192,
      barrel: 0.0079365079,
      "fluid ounce": 32,
      "cubic mile": 2.270421458e-13,
      "cubic foot": 0.0334201389,
      "cubic feet": 0.0334201389,
      "cubic inch": 57.75,
      "cubic yard": 0.0012377829,
      "cubic meter": 0.0009463529,
    },
  },
  pint: {
    plural: "pints",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 0.473176473,
    convertTo: gallonFamily,
    factors: {
      liter: 0.473176473,
      gallon: 0.125,
      quart: 0.5,
      pint: 1,
      cup: 2,
      tablespoon: 32,
      teaspoon: 96,
      barrel: 0.003968254,
      "fluid ounce": 16,
      "cubic mile": 1.135210729e-13,
      "cubic foot": 0.0167100694,
      "cubic feet": 0.0167100694,
      "cubic inch": 28.875,
      "cubic yard": 0.0006188915,
      "cubic meter": 0.0004731765,
    },
  },
  cup: {
    plural: "cups",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 0.2365882365,
    convertTo: cupFamily,
    factors: {
      liter: 0.2365882365,
      gallon: 0.0625,
      quart: 0.25,
      pint: 0.5,
      cup: 1,
      tablespoon: 16,
      teaspoon: 48,
      barrel: 0.001984127,
      "fluid ounce": 8,
      "cubic mile": 5.676053646e-14,
      "cubic foot": 0.0083550347,
      "cubic feet": 0.0083550347,
      "cubic inch": 14.4375,
      "cubic yard": 0.0003094457,
      "cubic meter": 0.0002365882,
    },
  },
  tablespoon: {
    plural: "tablespoons",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 0.0147867648,
    convertTo: cupFamily,
    factors: {
      liter: 0.0147867648,
      gallon: 0.00390625,
      quart: 0.015625,
      pint: 0.03125,
      cup: 0.0625,
      tablespoon: 1,
      teaspoon: 3,
      barrel: 0.0001240079,
      "fluid ounce": 0.5,
      "cubic mile": 3.547533529e-15,
      "cubic foot": 0.0005221897,
      "cubic feet": 0.0005221897,
      "cubic inch": 0.90234375,
      "cubic yard": 0.0000193404,
      "cubic meter": 1,
    },
  },
  teaspoon: {
    plural: "teaspoons",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 0.0049289216,
    convertTo: cupFamily,
    factors: {
      liter: 0.0049289216,
      gallon: 0.0013020833,
      quart: 0.0052083333,
      pint: 0.0104166667,
      cup: 0.0208333333,
      tablespoon: 0.3333333333,
      teaspoon: 1,
      barrel: 0.000041336,
      "fluid ounce": 0.1666666667,
      "cubic mile": 1.182511176e-15,
      "cubic foot": 0.0001740632,
      "cubic feet": 0.0001740632,
      "cubic inch": 0.30078125,
      "cubic yard": 0.0000064468,
      "cubic meter": 0.0000049289,
    },
  },
  barrel: {
    plural: "barrels",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 119.2404712,
    factors: {
      liter: 119.2404712,
      gallon: 31.5,
      quart: 126,
      pint: 252,
      cup: 504,
      tablespoon: 8064,
      teaspoon: 24192,
      barrel: 1,
      "fluid ounce": 4032,
      "cubic mile": 2.860731037e-11,
      "cubic foot": 4.2109375,
      "cubic feet": 4.2109375,
      "cubic inch": 7276.5,
      "cubic yard": 0.1559606481,
      "cubic meter": 0.1192404712,
    },
  },
  "fluid ounce": {
    plural: "fluid ounces",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 0.0295735296,
    convertTo: gallonFamily,
    factors: {
      liter: 0.0295735296,
      gallon: 0.0078125,
      quart: 0.03125,
      pint: 0.0625,
      cup: 0.125,
      tablespoon: 2,
      teaspoon: 6,
      barrel: 0.0002480159,
      "fluid ounce": 1,
      "cubic mile": 7.095067058e-15,
      "cubic foot": 0.0010443793,
      "cubic feet": 0.0010443793,
      "cubic inch": 1.8046875,
      "cubic yard": 0.0000386807,
      "cubic meter": 0.0000295735,
    },
  },

  "cubic mile": {
    plural: "cubic miles",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 4168181825441,
    convertTo: metricFamily,
    factors: {
      liter: 4168181825441,
      gallon: 1101117147429,
      quart: 4404468589714,
      pint: 8808937179429,
      cup: 17617874358857,
      tablespoon: 281885989741712,
      teaspoon: 845657969225143,
      barrel: 34956099918,
      "fluid ounce": 140942994870856,
      "cubic mile": 1,
      "cubic foot": 147197952000,
      "cubic feet": 147197952000,
      "cubic inch": 254358061055996,
      "cubic yard": 5451776000,
      "cubic meter": 4168181825.4,
    },
  },
  "cubic foot": {
    plural: "cubic feet",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 28.316846592,
    convertTo: volumeFamily,
    factors: {
      liter: 28.316846592,
      gallon: 7.4805194805,
      quart: 29.922077922,
      pint: 59.844155844,
      cup: 119.68831169,
      tablespoon: 1915.012987,
      teaspoon: 5745.038961,
      barrel: 0.2374768089,
      "fluid ounce": 957.50649351,
      "cubic mile": 6.79357278e-12,
      "cubic foot": 1,
      "cubic feet": 1,
      "cubic inch": 1728,
      "cubic yard": 0.037037037,
      "cubic meter": 0.0283168466,
    },
  },
  "cubic feet": {
    plural: "cubic feet",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 28.316846592,
    convertTo: volumeFamily,
    factors: {
      liter: 28.316846592,
      gallon: 7.4805194805,
      quart: 29.922077922,
      pint: 59.844155844,
      cup: 119.68831169,
      tablespoon: 1915.012987,
      teaspoon: 5745.038961,
      barrel: 0.2374768089,
      "fluid ounce": 957.50649351,
      "cubic mile": 6.79357278e-12,
      "cubic foot": 1,
      "cubic feet": 1,
      "cubic inch": 1728,
      "cubic yard": 0.037037037,
      "cubic meter": 0.0283168466,
    },
  },
  "cubic inch": {
    plural: "cubic inches",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 0.016387064,
    convertTo: volumeFamily,
    factors: {
      liter: 0.016387064,
      gallon: 0.0043290043,
      quart: 0.0173160173,
      pint: 0.0346320346,
      cup: 0.0692640693,
      tablespoon: 1.1082251082,
      teaspoon: 3.3246753247,
      barrel: 0.0001374287,
      "fluid ounce": 0.5541125541,
      "cubic mile": 3.931465729e-15,
      "cubic foot": 0.0005787037,
      "cubic feet": 0.0005787037,
      "cubic inch": 1,
      "cubic yard": 0.0000214335,
      "cubic meter": 0.0000163871,
    },
  },
  "cubic yard": {
    plural: "cubic yards",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 764.55485798,
    convertTo: volumeFamily,
    factors: {
      liter: 764.55485798,
      gallon: 201.97402597,
      quart: 807.8961039,
      pint: 1615.7922078,
      cup: 3231.5844156,
      tablespoon: 51705.350649,
      teaspoon: 155116.05195,
      barrel: 6.4118738404,
      "fluid ounce": 25852.675325,
      "cubic mile": 1.83426465e-10,
      "cubic foot": 27,
      "cubic feet": 27,
      "cubic inch": 46656,
      "cubic yard": 1,
      "cubic meter": 0.764554858,
    },
  },

  "cubic meter": {
    plural: "cubic meters",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 1000,
    convertTo: metricFamily,
    factors: {
      liter: 1000,
      gallon: 264.17205236,
      quart: 1056.6882094,
      pint: 2113.3764189,
      cup: 4226.7528377,
      tablespoon: 67628.045404,
      teaspoon: 202884.13621,
      barrel: 8.3864143606,
      "fluid ounce": 33814.022702,
      "cubic mile": 2.399127585e-10,
      "cubic foot": 35.314666721,
      "cubic feet": 35.314666721,
      "cubic inch": 61023.744095,
      "cubic yard": 1.3079506193,
      "cubic meter": 1,
    },
  },
  "imperial gallon": {
    plural: "imperial gallons",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume (UK)",
    factor: 4.54609,
    factors: { liter: 4.54609, gallon: 1.20095, "imperial gallon": 1 },
  },
  "imperial quart": {
    plural: "imperial quarts",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume (UK)",
    factor: 1.1365225,
    factors: { liter: 1.1365225, "imperial gallon": 0.25 },
  },
  "imperial pint": {
    plural: "imperial pints",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume (UK)",
    factor: 0.56826125,
    factors: { liter: 0.56826125, "imperial gallon": 0.125 },
  },
  "imperial fluid ounce": {
    plural: "imperial fluid ounces",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume (UK)",
    factor: 0.0284130625,
    factors: { liter: 0.0284130625, "imperial gallon": 0.00625 },
  },
  peck: {
    plural: "pecks",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume (US dry)",
    factor: 8.80976754,
    factors: { liter: 8.80976754, bushel: 0.25 },
  },
  bushel: {
    plural: "bushels",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume (US dry)",
    factor: 35.2390704,
    factors: { liter: 35.2390704, peck: 4 },
  },
  jigger: {
    plural: "jiggers",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume (bartending)",
    factor: 0.0443602943,
    factors: { liter: 0.0443602943, "fluid ounce": 1.5 },
  },
  hogshead: {
    plural: "hogsheads",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 238.48094239,
    factors: { liter: 238.48094239, gallon: 63 },
  },
  "fluid dram": {
    plural: "fluid drams",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 0.0036966912,
    factors: { liter: 0.0036966912, "fluid ounce": 0.125 },
  },
  minim: {
    plural: "minims",
    type: UnitTypes.VOLUME,
    description: "Unit of Volume",
    factor: 0.00006161152,
    factors: { liter: 0.00006161152, "fluid ounce": 0.00208333 },
  },

  gram: {
    plural: "grams",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight",
    factor: 1,
    convertTo: metricFamily,
    factors: {
      gram: 1,
      ton: 1000,
      pound: 0.0022046226,
      ounce: 0.0352739619,
      carat: 5,
      amu: 6.022136651e23,
    },
  },
  ton: {
    plural: "tons",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight",
    factor: 907185,
    factors: {
      gram: 1000000,
      ton: 1,
      pound: 2204.6226218,
      ounce: 35273.96195,
      carat: 5000000,
      amu: 6.022136651e29,
    },
  },
  pound: {
    plural: "pounds",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight",
    factor: 453.59237,
    convertTo: poundFamily,
    factors: {
      gram: 453.59237,
      ton: 0.0004535924,
      pound: 1,
      ounce: 16,
      carat: 2267.96185,
      amu: 2.731595236e26,
    },
  },
  ounce: {
    plural: "ounces",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight",
    factor: 28.349523125,
    convertTo: poundFamily,
    factors: {
      gram: 28.349523125,
      ton: 0.0000283495,
      pound: 0.0625,
      ounce: 1,
      carat: 141.74761563,
      amu: 1.707247022e25,
    },
  },
  carat: {
    plural: "carats",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight",
    factor: 0.2,
    factors: {
      gram: 0.2,
      ton: 2e-7,
      pound: 0.0004409245,
      ounce: 0.0070547924,
      carat: 1,
      amu: 1.20442733e23,
    },
  },
  amu: {
    plural: "atomic mass units",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight",
    factor: 1.660540199e-24,
    factors: {
      gram: 1.660540199e-24,
      ton: 1.660540199e-30,
      pound: 3.660864489e-27,
      ounce: 5.857383183e-26,
      carat: 8.302700999e-24,
      amu: 1,
    },
  },
  tonne: {
    plural: "tonnes",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight (metric ton)",
    factor: 1000000,
    factors: {
      gram: 1000000,
      ton: 1.10231131,
      pound: 2204.6226218,
      "long ton": 0.984206528,
      tonne: 1,
    },
  },
  "long ton": {
    plural: "long tons",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight (imperial)",
    factor: 1016046.9088,
    factors: {
      gram: 1016046.9088,
      ton: 1.12,
      pound: 2240,
      tonne: 1.0160469088,
      "long ton": 1,
    },
  },
  stone: {
    plural: "stones",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight (UK)",
    factor: 6350.29318,
    factors: { gram: 6350.29318, pound: 14, ounce: 224, stone: 1 },
  },
  slug: {
    plural: "slugs",
    type: UnitTypes.WEIGHT,
    description: "Unit of Mass (imperial)",
    factor: 14593.903,
    factors: { gram: 14593.903, pound: 32.17404856, slug: 1 },
  },
  grain: {
    plural: "grains",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight",
    factor: 0.06479891,
    factors: {
      gram: 0.06479891,
      pound: 0.00014285714,
      ounce: 0.00228571429,
      grain: 1,
    },
  },
  dram: {
    plural: "drams",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight (avoirdupois)",
    factor: 1.7718451953,
    factors: { gram: 1.7718451953, pound: 0.00390625, ounce: 0.0625, dram: 1 },
  },
  "troy ounce": {
    plural: "troy ounces",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight (precious metals)",
    factor: 31.1034768,
    factors: {
      gram: 31.1034768,
      pound: 0.06857142857,
      ounce: 1.09714286,
      "troy ounce": 1,
    },
  },
  "troy pound": {
    plural: "troy pounds",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight (precious metals)",
    factor: 373.2417216,
    factors: { gram: 373.2417216, "troy ounce": 12, "troy pound": 1 },
  },
  hundredweight: {
    plural: "hundredweights",
    type: UnitTypes.WEIGHT,
    description: "Unit of Weight (US short cwt)",
    factor: 45359.237,
    factors: { gram: 45359.237, pound: 100, ton: 0.05, hundredweight: 1 },
  },

  degree: {
    plural: "degrees",
    type: UnitTypes.ANGLE,
    description: "Unit of Angle",
    factor: 1,
    factors: {
      degree: 1,
      grad: 1.1111111111,
      radian: 0.0174532925,
      arcminute: 60,
      arcsecond: 3600,
    },
  },
  grad: {
    plural: "grads",
    type: UnitTypes.ANGLE,
    description: "Unit of Angle",
    factor: 0.9,
    factors: {
      degree: 0.9,
      grad: 1,
      radian: 0.0157079633,
      arcminute: 54,
      arcsecond: 3240,
    },
  },
  radian: {
    plural: "radians",
    type: UnitTypes.ANGLE,
    description: "Unit of Angle",
    factor: 57.295779513,
    factors: {
      degree: 57.295779513,
      grad: 63.661977237,
      radian: 1,
      arcminute: 3437.7467708,
      arcsecond: 206264.80625,
    },
  },
  arcminute: {
    plural: "arcminutes",
    type: UnitTypes.ANGLE,
    description: "Unit of Angle",
    factor: 0.0166666667,
    convertTo: angleFamily,
    factors: {
      degree: 0.0166666667,
      grad: 0.0185185185,
      radian: 0.0002908882,
      arcminute: 1,
      arcsecond: 60,
    },
  },
  arcsecond: {
    plural: "arcseconds",
    type: UnitTypes.ANGLE,
    description: "Unit of Angle",
    factor: 0.0002777778,
    convertTo: angleFamily,
    factors: {
      degree: 0.0002777778,
      grad: 0.000308642,
      radian: 0.0000048481,
      arcminute: 0.0166666667,
      arcsecond: 1,
    },
  },
  turn: {
    plural: "turns",
    type: UnitTypes.ANGLE,
    description: "Unit of Angle (one full revolution)",
    factor: 360,
    factors: {
      degree: 360,
      grad: 400,
      radian: 6.28318530717958,
      arcminute: 21600,
      arcsecond: 1296000,
      turn: 1,
    },
  },

  celsius: {
    type: UnitTypes.TEMPERATURE,
    description: "Unit of Temperature",
    kelvin: (value: number) => value + 273.15,
    fahrenheit: (value: number) => value * 1.8 + 32,
    rankine: (value: number) => value * 1.8 + 491.67,
    celsius: (value: number) => value,
  },
  kelvin: {
    type: UnitTypes.TEMPERATURE,
    description: "Unit of Temperature",
    kelvin: (value: number) => value,
    fahrenheit: (value: number) => value * 1.8 - 459.67,
    rankine: (value: number) => value * 1.8,
    celsius: (value: number) => value - 273.15,
  },
  fahrenheit: {
    type: UnitTypes.TEMPERATURE,
    description: "Unit of Temperature",
    kelvin: (value: number) => (value + 459.67) * (5 / 9),
    fahrenheit: (value: number) => value,
    rankine: (value: number) => value + 459.67,
    celsius: (value: number) => (value - 32) * (5 / 9),
  },
  rankine: {
    type: UnitTypes.TEMPERATURE,
    description: "Unit of Temperature",
    kelvin: (value: number) => value * (5 / 9),
    fahrenheit: (value: number) => value - 459.67,
    rankine: (value: number) => value,
    celsius: (value: number) => value * (5 / 9) - 273.15,
  },

  bit: {
    plural: "bits",
    type: UnitTypes.DATA,
    description: "Unit of Data",
    factor: 1,
    convertTo: dataFamily,
    factors: {
      bit: 1,
      byte: 0.125,
      nibble: 0.25,
    },
  },
  byte: {
    plural: "bytes",
    type: UnitTypes.DATA,
    description: "Unit of Data",
    factor: 8,
    convertTo: dataFamily,
    factors: {
      bit: 8,
      byte: 1,
      nibble: 2,
    },
  },
  nibble: {
    plural: "nibbles",
    type: UnitTypes.DATA,
    description: "Unit of Data",
    factor: 4,
    factors: {
      bit: 4,
      byte: 0.5,
      nibble: 1,
    },
  },

  second: {
    plural: "seconds",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 1,
    convertTo: timeFamily,
    factors: {
      second: 1,
      minute: 1 / 60,
      hour: 1 / 3600,
      day: 1 / 86400,
      week: 1 / 604800,
      month: 3.805175038e-7,
      year: 3.168808781e-8,
      decade: 3.168808781e-9,
      century: 3.168808781e-10,
      millennium: 3.168808781e-11,
    },
  },
  minute: {
    plural: "minutes",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 60,
    convertTo: timeFamily,
    factors: {
      second: 60,
      minute: 1,
      hour: 1 / 60,
      day: 1 / 1440,
      week: 1 / 10080,
      month: 0.0000228311,
      year: 0.0000019013,
      decade: 1.901285268e-7,
      century: 1.901285268e-8,
      millennium: 1.901285268e-9,
    },
  },
  hour: {
    plural: "hours",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 3600,
    convertTo: timeFamily,
    factors: {
      second: 3600,
      minute: 60,
      hour: 1,
      day: 1 / 24,
      week: 1 / 168,
      month: 0.001369863,
      year: 0.0001140771,
      decade: 0.0000114077,
      century: 0.0000011408,
      millennium: 1.140771161e-7,
    },
  },
  day: {
    plural: "days",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 86400,
    convertTo: timeFamily,
    factors: {
      second: 86400,
      minute: 1440,
      hour: 24,
      day: 1,
      week: 1 / 7,
      month: 0.0328767123,
      year: 0.0027378508,
      decade: 0.0002737851,
      century: 0.0000273785,
      millennium: 0.0000027379,
    },
  },
  week: {
    plural: "weeks",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 604800,
    convertTo: timeFamily,
    factors: {
      second: 604800,
      minute: 10080,
      hour: 168,
      day: 7,
      week: 1,
      month: 0.2301369863,
      year: 0.0191649555,
      decade: 0.0019164956,
      century: 0.0001916496,
      millennium: 0.000019165,
    },
  },
  month: {
    plural: "months",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 2.628e6,
    convertTo: timeFamily,
    factors: {
      second: 2628000,
      minute: 43800,
      hour: 730,
      day: 30.41667,
      week: 4.345,
      month: 1,
      year: 1 / 12,
      decade: 1 / 120,
      century: 1 / 1200,
      millennium: 1 / 12000,
    },
  },
  year: {
    plural: "years",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 3.154e7,
    convertTo: timeFamily,
    factors: {
      second: 31557600,
      minute: 525960,
      hour: 8766,
      day: 365,
      week: 52,
      month: 12,
      year: 1,
      decade: 0.1,
      century: 0.01,
      millennium: 0.001,
    },
  },
  decade: {
    plural: "decades",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 3.154e8,
    convertTo: timeFamily,
    factors: {
      second: 315576000,
      minute: 5259600,
      hour: 87660,
      day: 3652,
      week: 521,
      month: 120,
      year: 10,
      decade: 1,
      century: 0.1,
      millennium: 0.01,
    },
  },
  century: {
    plural: "centuries",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 3.154e9,
    convertTo: timeFamily,
    factors: {
      second: 3155760000,
      minute: 52596000,
      hour: 876600,
      day: 36525,
      week: 5217,
      month: 1200,
      year: 100,
      decade: 10,
      century: 1,
      millennium: 0.1,
    },
  },
  millennium: {
    plural: "millenniums",
    type: UnitTypes.TIME,
    description: "Unit of Time",
    factor: 3.154e10,
    convertTo: timeFamily,
    factors: {
      second: 31557600000,
      minute: 525960000,
      hour: 8766000,
      day: 365250,
      week: 52178,
      month: 12000,
      year: 1000,
      decade: 100,
      century: 10,
      millennium: 1,
    },
  },
  fortnight: {
    plural: "fortnights",
    type: UnitTypes.TIME,
    description: "Unit of Time (two weeks)",
    factor: 1209600,
    factors: {
      second: 1209600,
      minute: 20160,
      hour: 336,
      day: 14,
      week: 2,
      fortnight: 1,
    },
  },

  secondly: {
    type: UnitTypes.DURATION,
    description: "Unit of Relative time",
    factor: 31536000,
    convertTo: ["minutely"],
    factors: {
      secondly: 1,
      minutely: 60,
      hourly: 3600,
      daily: 86400,
      weekly: 604800,
      monthly: 2628000,
      quarterly: 10512000,
      yearly: 31557600,
    },
  },
  minutely: {
    type: UnitTypes.DURATION,
    description: "Unit of Relative time",
    factor: 525600,
    convertTo: ["hourly"],
    factors: {
      secondly: 1 / 60,
      minutely: 1,
      hourly: 60,
      daily: 1440,
      weekly: 10080,
      monthly: 43800,
      quarterly: 175200,
      yearly: 525960,
    },
  },
  hourly: {
    type: UnitTypes.DURATION,
    description: "Unit of Relative time",
    factor: 8760,
    convertTo: ["minutely"],
    factors: {
      secondly: 1 / 3600,
      minutely: 1 / 60,
      hourly: 1,
      daily: 24,
      weekly: 168,
      monthly: 730,
      quarterly: 2920,
      yearly: 8766,
    },
  },
  daily: {
    type: UnitTypes.DURATION,
    description: "Unit of Relative time",
    factor: 365,
    convertTo: ["weekly"],
    factors: {
      secondly: 1 / 86400,
      minutely: 1 / 1440,
      hourly: 1 / 24,
      daily: 1,
      weekly: 7,
      monthly: 30,
      quarterly: 120,
      yearly: 365,
    },
  },
  weekly: {
    type: UnitTypes.DURATION,
    description: "Unit of Relative time",
    factor: 52,
    convertTo: ["monthly"],
    factors: {
      secondly: 1 / 604800,
      minutely: 1 / 10080,
      hourly: 1 / 168,
      daily: 1 / 7,
      weekly: 1,
      monthly: 4.3452380952,
      quarterly: 17.381,
      yearly: 52,
    },
  },
  monthly: {
    type: UnitTypes.DURATION,
    description: "Unit of Relative time",
    factor: 12,
    convertTo: ["yearly"],
    factors: {
      secondly: 3.805175038e-7,
      minutely: 0.0000228311,
      hourly: 0.001369863,
      daily: 0.0328767123,
      weekly: 0.2301369863,
      monthly: 1,
      quarterly: 4,
      yearly: 12,
    },
  },
  quarterly: {
    type: UnitTypes.DURATION,
    description: "Unit of Relative time",
    factor: 4,
    convertTo: ["yearly"],
    factors: {
      secondly: 9.51293759e-8,
      minutely: 0.00000570777,
      hourly: 0.00034246575,
      daily: 0.00821917807,
      weekly: 0.05753424657,
      monthly: 0.25,
      quarterly: 1,
      yearly: 4,
    },
  },
  yearly: {
    type: UnitTypes.DURATION,
    description: "Unit of Relative time",
    factor: 1,
    convertTo: ["monthly"],
    factors: {
      secondly: 1 / 31536000,
      minutely: 1 / 525600,
      hourly: 1 / 8760,
      daily: 1 / 365,
      weekly: 1 / 52,
      monthly: 1 / 12,
      quarterly: 0.25,
      yearly: 1,
    },
  },

  january: { type: UnitTypes.MONTH, description: "Month", factor: 1 },
  february: { type: UnitTypes.MONTH, description: "Month", factor: 2 },
  march: { type: UnitTypes.MONTH, description: "Month", factor: 3 },
  april: { type: UnitTypes.MONTH, description: "Month", factor: 4 },
  may: { type: UnitTypes.MONTH, description: "Month", factor: 5 },
  june: { type: UnitTypes.MONTH, description: "Month", factor: 6 },
  july: { type: UnitTypes.MONTH, description: "Month", factor: 7 },
  august: { type: UnitTypes.MONTH, description: "Month", factor: 8 },
  september: { type: UnitTypes.MONTH, description: "Month", factor: 9 },
  october: { type: UnitTypes.MONTH, description: "Month", factor: 10 },
  november: { type: UnitTypes.MONTH, description: "Month", factor: 11 },
  december: { type: UnitTypes.MONTH, description: "Month", factor: 12 },

  am: { type: UnitTypes.AMPM, description: "Ante Meridiem", factor: 1 },
  pm: { type: UnitTypes.AMPM, description: "Post Meridiem", factor: 2 },

  yocto: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e-24,
  },
  zepto: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e-21,
  },
  atto: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e-18,
  },
  femto: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e-15,
  },
  pico: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e-12,
  },
  nano: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e-9,
  },
  micro: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e-6,
  },
  milli: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 0.001,
  },
  centi: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 0.01,
  },
  deci: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 0.1,
  },
  _: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1,
    datafactor: 1,
  },
  deka: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 10,
  },
  hecto: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 100,
  },
  kilo: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1000,
    datafactor: 1024,
  },
  mega: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e6,
    datafactor: 1048576,
  },
  giga: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e9,
    datafactor: 1073741824,
  },
  tera: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e12,
    datafactor: 1099511627776,
  },
  peta: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e15,
    datafactor: 1125899906842631,
  },
  exa: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e18,
    datafactor: 1152921504606851600,
  },
  zetta: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e21,
  },
  yotta: {
    type: UnitTypes.POSTFIX,
    description: "Postfix Unit",
    factor: 1e24,
  },
  ppm: {
    type: UnitTypes.POSTFIX,
    description: "Parts per million (1e-6)",
    factor: 1e-6,
  },
  ppb: {
    type: UnitTypes.POSTFIX,
    description: "Parts per billion (1e-9)",
    factor: 1e-9,
  },
  ppt: {
    type: UnitTypes.POSTFIX,
    description: "Parts per trillion (1e-12)",
    factor: 1e-12,
  },

  hex: {
    type: UnitTypes.FUNCTION,
    description: "Convert color, number or IP to hexadecimal (base 16)",
    func: (token) => {
      if (token instanceof ColorToken) {
        token.unit = "HEX";
        return token;
      }
      if (token instanceof IpToken) return toIpFormat(token, "HEX");
      if (token instanceof NumberToken) {
        return tokenFactory(
          token.formatString(token.toNumber(), TokenBaseType.HEX),
          TokenBaseType.HEX,
        );
      }
      throw new UnhandledError(534);
    },
  },

  binary: {
    type: UnitTypes.FUNCTION,
    description: "Convert number or IP to binary (base 2)",
    func: (token) => {
      if (token instanceof IpToken) return toIpFormat(token, "BINARY");
      if (token instanceof NumberToken) {
        return tokenFactory(
          token.formatString(token.toNumber(), TokenBaseType.BINARY),
          TokenBaseType.BINARY,
        );
      }
      throw new UnhandledError(534);
    },
  },
  octal: {
    type: UnitTypes.FUNCTION,
    description: "Convert number to octal (base 8)",
    func: (token) => {
      if (token instanceof NumberToken) {
        return tokenFactory(
          token.formatString(token.toNumber(), TokenBaseType.OCTAL),
          TokenBaseType.OCTAL,
        );
      }
      throw new UnhandledError(534);
    },
  },
  decimal: {
    type: UnitTypes.FUNCTION,
    description: "Convert number to decimal (base 10), or IP to its integer",
    func: (token) => {
      if (token instanceof IpToken) return toIpFormat(token, "INTEGER");
      if (token instanceof NumberToken) {
        return tokenFactory(
          token.formatString(token.toNumber(), TokenBaseType.DECIMAL),
          TokenBaseType.DECIMAL,
        );
      }
      throw new UnhandledError(534);
    },
  },
  integer: {
    type: UnitTypes.FUNCTION,
    description: "Convert an IP address to its integer value (32/128-bit)",
    func: (token) => toIpFormat(token, "INTEGER"),
  },
  expanded: {
    type: UnitTypes.FUNCTION,
    description: "Expand an IPv6 address to its full zero-padded form",
    func: (token) => toIpFormat(token, "EXPANDED"),
  },
  compressed: {
    type: UnitTypes.FUNCTION,
    description: "Compress an IPv6 address to its canonical RFC 5952 form",
    func: (token) => toIpFormat(token, "COMPRESSED"),
  },
  cidr: {
    type: UnitTypes.FUNCTION,
    description: "Render an IP address in CIDR notation (address/prefix)",
    func: (token) => toIpFormat(token, "CIDR"),
  },

  "rgb color": {
    type: UnitTypes.FUNCTION,
    description: "Convert color to rgb format",
    func: (token) => toColors(token, "RGB"),
  },
  "rgba color": {
    type: UnitTypes.FUNCTION,
    description: "Convert color to rgba format",
    func: (token) => toColors(token, "RGBA"),
  },
  "color name": {
    type: UnitTypes.FUNCTION,
    description: "Convert color to name",
    func: (token) => toColors(token, "NAME"),
  },
  "hsl color": {
    type: UnitTypes.FUNCTION,
    description: "Convert color to hsl format",
    func: (token) => toColors(token, "HSL"),
  },
  "color number": {
    type: UnitTypes.FUNCTION,
    description: "Convert color to number",
    func: (token) => toColors(token, "NUMBER"),
  },
  "color temperature": {
    type: UnitTypes.FUNCTION,
    description: "Get temperature of a color",
    func: (token) => {
      const color = toColors(token, "NUMBER");
      const colorTemp = chroma(color.color).temperature();
      return tokenFactory(colorTemp.toString(), TokenBaseType.DECIMAL);
    },
  },
  epoch: {
    type: UnitTypes.FUNCTION,
    description: "Convert date to unix epoch in seconds",
    func: (token) => {
      if (!(token instanceof DateToken)) throw new UnhandledError(534);
      if (!token.spacetime) throw new UnhandledError(534);

      const epoch = Math.round(token.spacetime.epoch / 1000);
      const epochNumber = tokenFactory(
        epoch.toString(),
        TokenBaseType.DECIMAL,
      ) as NumberToken;
      epochNumber.unit = tokenFactory(
        "seconds",
        TokenBaseType.STRING,
      ) as UnitToken;
      return epochNumber;
    },
  },
  timestamp: {
    type: UnitTypes.FUNCTION,
    description: "Convert date to unix timestamp in milliseconds",
    func: (token) => {
      if (!(token instanceof DateToken)) throw new UnhandledError(534);
      if (!token.spacetime) throw new UnhandledError(534);

      const epochNumber = tokenFactory(
        token.spacetime.epoch.toString(),
        TokenBaseType.DECIMAL,
      ) as NumberToken;
      epochNumber.unit = tokenFactory(
        "milliseconds",
        TokenBaseType.STRING,
      ) as UnitToken;
      return epochNumber;
    },
  },
  ampere: {
    plural: "amperes",
    type: UnitTypes.CURRENT,
    description: "Unit of Electric Current",
    factor: 1,
    factors: { ampere: 1 },
  },
  mole: {
    plural: "moles",
    type: UnitTypes.AMOUNT,
    description: "Unit of Amount of Substance",
    factor: 1,
    factors: { mole: 1 },
  },
  candela: {
    plural: "candelas",
    type: UnitTypes.LUMINOSITY,
    description: "Unit of Luminous Intensity",
    factor: 1,
    factors: { candela: 1 },
  },

  newton: {
    plural: "newtons",
    type: UnitTypes.FORCE,
    description: "Unit of Force",
    factor: 1000,
    dim: { gram: 1, meter: 1, second: -2 },
  },
  dyne: {
    plural: "dynes",
    type: UnitTypes.FORCE,
    description: "Unit of Force (cgs)",
    factor: 0.01,
    dim: { gram: 1, meter: 1, second: -2 },
  },
  "pound force": {
    type: UnitTypes.FORCE,
    description: "Unit of Force (imperial)",
    factor: 4448.22162,
    dim: { gram: 1, meter: 1, second: -2 },
  },
  "kilogram force": {
    type: UnitTypes.FORCE,
    description: "Unit of Force",
    factor: 9806.65,
    dim: { gram: 1, meter: 1, second: -2 },
  },
  kip: {
    plural: "kips",
    type: UnitTypes.FORCE,
    description: "Unit of Force (1000 lbf)",
    factor: 4448221.62,
    dim: { gram: 1, meter: 1, second: -2 },
  },
  joule: {
    plural: "joules",
    type: UnitTypes.ENERGY,
    description: "Unit of Energy",
    factor: 1000,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  calorie: {
    plural: "calories",
    type: UnitTypes.ENERGY,
    description: "Unit of Energy (thermochemical)",
    factor: 4184,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  kilocalorie: {
    plural: "kilocalories",
    type: UnitTypes.ENERGY,
    description: "Unit of Energy (food calorie)",
    factor: 4184000,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  btu: {
    plural: "btus",
    type: UnitTypes.ENERGY,
    description: "British Thermal Unit",
    factor: 1055060,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  "electron volt": {
    plural: "electron volts",
    type: UnitTypes.ENERGY,
    description: "Unit of Energy (atomic / particle physics)",
    factor: 1.602176634e-16,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  erg: {
    plural: "ergs",
    type: UnitTypes.ENERGY,
    description: "Unit of Energy (cgs)",
    factor: 1e-4,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  "watt hour": {
    plural: "watt hours",
    type: UnitTypes.ENERGY,
    description: "Unit of Energy",
    factor: 3.6e6,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  "foot pound": {
    plural: "foot pounds",
    type: UnitTypes.ENERGY,
    description: "Unit of Energy / Work",
    factor: 1355.818,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  therm: {
    plural: "therms",
    type: UnitTypes.ENERGY,
    description: "Unit of Energy (natural gas)",
    factor: 1.055e11,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  "ton tnt": {
    plural: "tons tnt",
    type: UnitTypes.ENERGY,
    description: "Unit of Energy (explosive yield)",
    factor: 4.184e12,
    dim: { gram: 1, meter: 2, second: -2 },
  },
  watt: {
    plural: "watts",
    type: UnitTypes.POWER,
    description: "Unit of Power",
    factor: 1000,
    dim: { gram: 1, meter: 2, second: -3 },
  },
  horsepower: {
    type: UnitTypes.POWER,
    description: "Unit of Power (mechanical hp)",
    factor: 745699.872,
    dim: { gram: 1, meter: 2, second: -3 },
  },
  "metric horsepower": {
    type: UnitTypes.POWER,
    description: "Unit of Power (PS / metric hp)",
    factor: 735498.75,
    dim: { gram: 1, meter: 2, second: -3 },
  },
  "electrical horsepower": {
    type: UnitTypes.POWER,
    description: "Unit of Power (electrical hp)",
    factor: 746000,
    dim: { gram: 1, meter: 2, second: -3 },
  },
  "btu per hour": {
    type: UnitTypes.POWER,
    description: "Unit of Power (HVAC)",
    factor: 293.07107,
    dim: { gram: 1, meter: 2, second: -3 },
  },
  "foot pound per second": {
    type: UnitTypes.POWER,
    description: "Unit of Power",
    factor: 1355.818,
    dim: { gram: 1, meter: 2, second: -3 },
  },
  pascal: {
    plural: "pascals",
    type: UnitTypes.PRESSURE,
    description: "Unit of Pressure",
    factor: 1000,
    dim: { gram: 1, meter: -1, second: -2 },
  },
  bar: {
    plural: "bars",
    type: UnitTypes.PRESSURE,
    description: "Unit of Pressure",
    factor: 1e8,
    dim: { gram: 1, meter: -1, second: -2 },
  },
  atmosphere: {
    plural: "atmospheres",
    type: UnitTypes.PRESSURE,
    description: "Unit of Pressure",
    factor: 101325000,
    dim: { gram: 1, meter: -1, second: -2 },
  },
  psi: {
    type: UnitTypes.PRESSURE,
    description: "Unit of Pressure (pound per square inch)",
    factor: 6894757.293,
    dim: { gram: 1, meter: -1, second: -2 },
  },
  torr: {
    type: UnitTypes.PRESSURE,
    description: "Unit of Pressure",
    factor: 133322.4,
    dim: { gram: 1, meter: -1, second: -2 },
  },
  mmhg: {
    type: UnitTypes.PRESSURE,
    description: "Unit of Pressure (millimeter of mercury)",
    factor: 133322.4,
    dim: { gram: 1, meter: -1, second: -2 },
  },
  inhg: {
    type: UnitTypes.PRESSURE,
    description: "Unit of Pressure (inch of mercury)",
    factor: 3386389,
    dim: { gram: 1, meter: -1, second: -2 },
  },
  "pound per square foot": {
    type: UnitTypes.PRESSURE,
    description: "Unit of Pressure",
    factor: 47880.26,
    dim: { gram: 1, meter: -1, second: -2 },
  },
  hertz: {
    type: UnitTypes.FREQUENCY,
    description: "Unit of Frequency",
    factor: 1,
    dim: { second: -1 },
  },
  rpm: {
    type: UnitTypes.FREQUENCY,
    description: "Unit of Frequency (revolutions per minute)",
    factor: 0.0166666667,
    dim: { second: -1 },
  },
  coulomb: {
    plural: "coulombs",
    type: UnitTypes.CURRENT,
    description: "Unit of Electric Charge",
    factor: 1,
    dim: { ampere: 1, second: 1 },
  },
  volt: {
    plural: "volts",
    type: UnitTypes.CURRENT,
    description: "Unit of Electric Potential",
    factor: 1000,
    dim: { gram: 1, meter: 2, second: -3, ampere: -1 },
  },
  ohm: {
    plural: "ohms",
    type: UnitTypes.CURRENT,
    description: "Unit of Electrical Resistance",
    factor: 1000,
    dim: { gram: 1, meter: 2, second: -3, ampere: -2 },
  },
  farad: {
    plural: "farads",
    type: UnitTypes.CURRENT,
    description: "Unit of Electrical Capacitance",
    factor: 0.001,
    dim: { gram: -1, meter: -2, second: 4, ampere: 2 },
  },
  henry: {
    plural: "henries",
    type: UnitTypes.CURRENT,
    description: "Unit of Inductance",
    factor: 1000,
    dim: { gram: 1, meter: 2, second: -2, ampere: -2 },
  },
  weber: {
    plural: "webers",
    type: UnitTypes.CURRENT,
    description: "Unit of Magnetic Flux",
    factor: 1000,
    dim: { gram: 1, meter: 2, second: -2, ampere: -1 },
  },
  tesla: {
    plural: "teslas",
    type: UnitTypes.CURRENT,
    description: "Unit of Magnetic Flux Density",
    factor: 1000,
    dim: { gram: 1, second: -2, ampere: -1 },
  },
  gauss: {
    type: UnitTypes.CURRENT,
    description: "Unit of Magnetic Flux Density (cgs)",
    factor: 0.1,
    dim: { gram: 1, second: -2, ampere: -1 },
  },
  maxwell: {
    plural: "maxwells",
    type: UnitTypes.CURRENT,
    description: "Unit of Magnetic Flux (cgs)",
    factor: 1e-5,
    dim: { gram: 1, meter: 2, second: -2, ampere: -1 },
  },
  oersted: {
    plural: "oersteds",
    type: UnitTypes.CURRENT,
    description: "Unit of Magnetic Field Strength (cgs)",
    factor: 79.57747,
    dim: { meter: -1, ampere: 1 },
  },
  siemens: {
    type: UnitTypes.CURRENT,
    description: "Unit of Electrical Conductance",
    factor: 0.001,
    dim: { gram: -1, meter: -2, second: 3, ampere: 2 },
  },

  knot: {
    plural: "knots",
    type: UnitTypes.SPEED,
    description: "Unit of Speed (nautical / aeronautical)",
    factor: 0.5144444444,
    dim: { meter: 1, second: -1 },
  },
  mach: {
    type: UnitTypes.SPEED,
    description: "Unit of Speed (multiples of sound speed at sea level)",
    factor: 343,
    dim: { meter: 1, second: -1 },
  },
  "speed of light": {
    type: UnitTypes.SPEED,
    description: "Unit of Speed (c, in vacuum)",
    factor: 299792458,
    dim: { meter: 1, second: -1 },
  },

  "standard gravity": {
    type: UnitTypes.ACCELERATION,
    description: "Unit of Acceleration (Earth surface gravity)",
    factor: 9.80665,
    dim: { meter: 1, second: -2 },
  },
  galileo: {
    plural: "galileos",
    type: UnitTypes.ACCELERATION,
    description: "Unit of Acceleration (cgs, geodesy)",
    factor: 0.01,
    dim: { meter: 1, second: -2 },
  },

  lux: {
    type: UnitTypes.ILLUMINANCE,
    description: "Unit of Illuminance (lumen per square meter)",
    factor: 1,
    dim: { candela: 1, meter: -2 },
  },
  "foot candle": {
    plural: "foot candles",
    type: UnitTypes.ILLUMINANCE,
    description: "Unit of Illuminance (imperial)",
    factor: 10.7639104,
    dim: { candela: 1, meter: -2 },
  },
  phot: {
    plural: "phots",
    type: UnitTypes.ILLUMINANCE,
    description: "Unit of Illuminance (cgs)",
    factor: 10000,
    dim: { candela: 1, meter: -2 },
  },

  lumen: {
    plural: "lumens",
    type: UnitTypes.LUMINOUS_FLUX,
    description: "Unit of Luminous Flux",
    factor: 1,
    dim: { candela: 1 },
  },

  becquerel: {
    plural: "becquerels",
    type: UnitTypes.RADIOACTIVITY,
    description: "Unit of Radioactivity (decays per second)",
    factor: 1,
    dim: { second: -1 },
  },
  curie: {
    plural: "curies",
    type: UnitTypes.RADIOACTIVITY,
    description: "Unit of Radioactivity",
    factor: 3.7e10,
    dim: { second: -1 },
  },

  gray: {
    plural: "grays",
    type: UnitTypes.RADIATION_DOSE,
    description: "Unit of Absorbed Radiation Dose",
    factor: 1,
    dim: { meter: 2, second: -2 },
  },
  sievert: {
    plural: "sieverts",
    type: UnitTypes.RADIATION_DOSE,
    description: "Unit of Equivalent Radiation Dose",
    factor: 1,
    dim: { meter: 2, second: -2 },
  },
  rad: {
    plural: "rads",
    type: UnitTypes.RADIATION_DOSE,
    description: "Unit of Absorbed Radiation Dose (cgs)",
    factor: 0.01,
    dim: { meter: 2, second: -2 },
  },
  rem: {
    plural: "rems",
    type: UnitTypes.RADIATION_DOSE,
    description: "Unit of Equivalent Radiation Dose (cgs)",
    factor: 0.01,
    dim: { meter: 2, second: -2 },
  },

  katal: {
    plural: "katals",
    type: UnitTypes.CATALYTIC_ACTIVITY,
    description: "Unit of Catalytic Activity (mole per second)",
    factor: 1,
    dim: { mole: 1, second: -1 },
  },

  molar: {
    type: UnitTypes.CONCENTRATION,
    description: "Unit of Concentration (mole per liter)",
    factor: 1000,
    dim: { mole: 1, meter: -3 },
  },

  poise: {
    plural: "poises",
    type: UnitTypes.VISCOSITY_DYNAMIC,
    description: "Unit of Dynamic Viscosity (cgs)",
    factor: 100,
    dim: { gram: 1, meter: -1, second: -1 },
  },

  stokes: {
    type: UnitTypes.VISCOSITY_KINEMATIC,
    description: "Unit of Kinematic Viscosity (cgs)",
    factor: 1e-4,
    dim: { meter: 2, second: -1 },
  },

  "human date": {
    type: UnitTypes.FUNCTION,
    description: "Convert unix timestamp to date",
    func: (token) => {
      if (!(token instanceof NumberToken)) throw new UnhandledError(534);
      let secs = token.toNumber();
      if (token.unit?.value === "second") secs *= 1000;

      const dtObj = spacetime(secs);
      if (!dtObj.isValid()) throw new UnhandledError(534);

      return new DateToken(
        dtObj.toNativeDate().toString(),
        token.toNumber().toString(),
      )
        .setObject(dtObj)
        .set({
          year: dtObj.year(),
          month: dtObj.month(),
          date: dtObj.date(),
          hour: dtObj.hour(),
          minute: dtObj.minute(),
          second: dtObj.second(),
          millisecond: dtObj.millisecond(),
        });
    },
  },
};

function toColors(token: TokenType, unit: colorTypes) {
  if (token instanceof ColorToken) {
    token.unit = unit;
    return token;
  }
  if (token instanceof NumberToken) {
    const color = chroma(token.toNumber());
    const colorToken: ColorToken = tokenFactory(
      color.hex(),
      TokenBaseType.COLOR,
    ) as ColorToken;
    colorToken.unit = unit;
    return colorToken;
  }
  throw new UnhandledError(534);
}

// `to <form>` for IP addresses just retags the output format (mirrors
// toColors), since the address value is unchanged. Number → IP (the inverse)
// is the `ipv4()` / `ipv6()` functions instead, since a digit-suffixed unit
// name can't survive the lexer's multi-word handling after `to`.
function toIpFormat(token: TokenType, unit: ipFormat) {
  if (token instanceof IpToken) {
    token.unit = unit;
    return token;
  }
  throw new UnhandledError(534);
}

const BASE_UNIT_BY_TYPE: { [K in UnitTypes]?: string } = {
  [UnitTypes.LENGTH]: "meter",
  [UnitTypes.AREA]: "square meter",
  [UnitTypes.VOLUME]: "liter",
  [UnitTypes.WEIGHT]: "gram",
  [UnitTypes.ANGLE]: "degree",
  [UnitTypes.DATA]: "bit",
  [UnitTypes.TIME]: "second",
  [UnitTypes.DURATION]: "secondly",
  [UnitTypes.TEMPERATURE]: "kelvin",
  [UnitTypes.CURRENT]: "ampere",
  [UnitTypes.AMOUNT]: "mole",
  [UnitTypes.LUMINOSITY]: "candela",
  [UnitTypes.LUMINOUS_FLUX]: "lumen",
  [UnitTypes.ILLUMINANCE]: "lux",
  [UnitTypes.SPEED]: "knot",
  [UnitTypes.ACCELERATION]: "standard gravity",
  [UnitTypes.RADIOACTIVITY]: "becquerel",
  [UnitTypes.RADIATION_DOSE]: "gray",
  [UnitTypes.CATALYTIC_ACTIVITY]: "katal",
  [UnitTypes.CONCENTRATION]: "molar",
  [UnitTypes.VISCOSITY_DYNAMIC]: "poise",
  [UnitTypes.VISCOSITY_KINEMATIC]: "stokes",
};

// How many SI base units in 1 of the given unit (e.g. mile → 1609.344, kilo → 1000).
function unitToBase(unitName: string): number {
  const data = Units[unitName];
  if (!data) return 1;
  const base = BASE_UNIT_BY_TYPE[data.type];
  if (base && data.factors) return data.factors[base];
  return data.factor ?? 1;
}

// Conversion factor: 1 fromUnit = (returned value) toUnits. Same family required.
// Prefers the hand-tuned pairwise factor when present, then derives from canonical base.
function linearFactor(fromUnit: string, toUnit: string): number {
  const direct = Units[fromUnit]?.factors?.[toUnit];
  if (direct !== undefined) return direct;
  return unitToBase(fromUnit) / unitToBase(toUnit);
}

// Dimension vector for a unit type *without* explicit `dim`. AREA → meter^2,
// VOLUME → meter^3 (cross-family compatibility with `m^2` / `m^3` compounds).
// DURATION is given its own dimension axis so compound math with it stays
// isolated — the existing factors[] table is the only correct conversion path
// there. Types without a meaningful dimension (CITY, MONTH, AMPM, FUNCTION,
// POSTFIX, …) return an empty vector.
function dimOfType(type: UnitTypes): DimensionVector {
  switch (type) {
    case UnitTypes.LENGTH:
      return { meter: 1 };
    case UnitTypes.AREA:
      return { meter: 2 };
    case UnitTypes.VOLUME:
      return { meter: 3 };
    case UnitTypes.WEIGHT:
      return { gram: 1 };
    case UnitTypes.TIME:
      return { second: 1 };
    case UnitTypes.ANGLE:
      return { degree: 1 };
    case UnitTypes.DATA:
      return { bit: 1 };
    case UnitTypes.TEMPERATURE:
      return { kelvin: 1 };
    case UnitTypes.CURRENT:
      return { ampere: 1 };
    case UnitTypes.AMOUNT:
      return { mole: 1 };
    case UnitTypes.LUMINOSITY:
      return { candela: 1 };
    case UnitTypes.DURATION:
      return { duration: 1 };
    case UnitTypes.FORCE:
      return { gram: 1, meter: 1, second: -2 };
    case UnitTypes.ENERGY:
      return { gram: 1, meter: 2, second: -2 };
    case UnitTypes.POWER:
      return { gram: 1, meter: 2, second: -3 };
    case UnitTypes.PRESSURE:
      return { gram: 1, meter: -1, second: -2 };
    case UnitTypes.FREQUENCY:
      return { second: -1 };
    case UnitTypes.SPEED:
      return { meter: 1, second: -1 };
    case UnitTypes.ACCELERATION:
      return { meter: 1, second: -2 };
    case UnitTypes.ILLUMINANCE:
      return { candela: 1, meter: -2 };
    case UnitTypes.LUMINOUS_FLUX:
      return { candela: 1 };
    case UnitTypes.RADIOACTIVITY:
      return { second: -1 };
    case UnitTypes.RADIATION_DOSE:
      return { meter: 2, second: -2 };
    case UnitTypes.CATALYTIC_ACTIVITY:
      return { mole: 1, second: -1 };
    case UnitTypes.CONCENTRATION:
      return { mole: 1, meter: -3 };
    case UnitTypes.VISCOSITY_DYNAMIC:
      return { gram: 1, meter: -1, second: -1 };
    case UnitTypes.VISCOSITY_KINEMATIC:
      return { meter: 2, second: -1 };
    default:
      return {};
  }
}

function dimOfUnitData(data: UnitsTypeIF): DimensionVector {
  if (data.dim) return { ...data.dim };
  return dimOfType(data.type);
}

// Base (no-prefix) siFactor: multiplier from 1 of this unit into the canonical
// SI product expressed by its dim. Prefer the hand-tuned pairwise factor to
// the base unit (e.g., `mile.factors.meter = 1609.344`) when present —
// `data.factor` can be the rounded display value (`mile.factor = 1609.3`) and
// would cost precision for compound math. For VOLUME-without-dim, factor is
// stored in liters so multiply by 0.001 to land in m³. For explicit-dim units
// (newton, pascal, …), `data.factor` is already canonical.
function baseSiFactor(data: UnitsTypeIF): number {
  if (data.dim) return data.factor ?? 1;
  const base = BASE_UNIT_BY_TYPE[data.type];
  const pairwise = base !== undefined ? data.factors?.[base] : undefined;
  const f = pairwise ?? data.factor ?? 1;
  if (data.type === UnitTypes.VOLUME) return f * 0.001;
  return f;
}

function dimEquals(a: DimensionVector, b: DimensionVector): boolean {
  for (const k of Object.keys(a)) if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  for (const k of Object.keys(b)) if ((a[k] ?? 0) !== (b[k] ?? 0)) return false;
  return true;
}

function dimIsEmpty(d: DimensionVector): boolean {
  for (const k of Object.keys(d)) if (d[k] !== 0) return false;
  return true;
}

function dimSignature(d: DimensionVector): string {
  const keys = Object.keys(d)
    .filter((k) => d[k] !== 0)
    .sort();
  return keys.map((k) => `${k}:${d[k]}`).join(",");
}

function addDim(a: DimensionVector, b: DimensionVector): DimensionVector {
  const out: DimensionVector = { ...a };
  for (const k of Object.keys(b)) {
    out[k] = (out[k] ?? 0) + b[k];
    if (out[k] === 0) delete out[k];
  }
  return out;
}

function scaleDim(a: DimensionVector, k: number): DimensionVector {
  if (k === 0) return {};
  const out: DimensionVector = {};
  for (const key of Object.keys(a)) out[key] = a[key] * k;
  return out;
}

function negateDim(a: DimensionVector): DimensionVector {
  return scaleDim(a, -1);
}

export {
  addDim,
  baseSiFactor,
  Constants,
  dimEquals,
  dimIsEmpty,
  dimOfType,
  dimOfUnitData,
  dimSignature,
  linearFactor,
  negateDim,
  scaleDim,
  Units,
  UnitTypes,
  unitToBase,
};
