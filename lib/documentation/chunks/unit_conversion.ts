export const unit_conversion = `
## Unit conversion

Convert one unit to another, mix units in arithmetic, and apply SI / binary
prefixes. For compound units (m/s, N*m, mph), see the \`compound_units\` chunk.

### Syntax

\`\`\`
<value> <source_unit> to <target_unit>
\`\`\`

- Conversion: \`15 kilometers to miles\`
- Multi-target breakdown: \`9234 miles to yards, feet, inch\`
- Mixed-unit math: \`13 kilograms + 12 pounds\` (result in the left-hand unit
  family; chain a \`to\` for a specific target: \`13 kilograms + 12 pounds to kg\`)

### Supported unit families

- **Length** — meter, mile, yard, feet, inch, micron, parsec, astronomical unit, nautical mile, light year, angstrom, fathom, furlong, league, chain, rod, hand, pica, point
- **Area** — hectare, acre, square mile, square feet, square inch, square yard, square meter, are, barn
- **Volume** — litre, gallon, quart, pint, cup, tablespoon, teaspoon, barrel, fluid ounce, cubic mile/foot/inch/yard/meter, imperial gallon/quart/pint/fluid ounce, peck, bushel, jigger, hogshead, fluid dram, minim
- **Temperature** — Celsius, kelvin, Fahrenheit, rankine
- **Weight** — gram, ton, pound, ounce, carat, amu, tonne / metric ton, long ton, stone, slug, grain, dram, troy ounce, troy pound, hundredweight
- **Angle** — degree, grad, radian, arcminute, arcsecond, turn
- **Data** — bit, byte, nibble
- **Time** — second, minute, hour, day, week, month, year, decade, century, millennium, fortnight
- **Duration** (rate) — secondly, minutely, hourly, daily, weekly, monthly, quarterly, yearly
- **Force, Energy, Power, Pressure, Frequency, Speed, Acceleration, Illuminance,
  Luminous Flux, Radioactivity, Radiation Dose, Catalytic Activity, Concentration,
  Viscosity, Electromagnetism** — see the \`compound_units\` chunk for the named
  derived units and their compound equivalents.

### Prefixes

SI: yocto, zepto, atto, femto, pico, nano, micro, milli, centi, deci, deka,
hecto, kilo, mega, giga, tera, peta, exa, zetta, yotta.

Numeric multipliers: septillion … billion, million, thousand, hundred, ten,
deca, tenth … septillionth. Used with bare numbers (\`5 million\` → 5,000,000)
or as prefixes on units (\`5 kilo meter\` → \`5 km\`).

Binary prefixes on data units use 1024-based multipliers: \`1 kilobyte = 1024 bytes\`.

### Examples

User: convert 25 °C to Fahrenheit and Kelvin
Expressions: \`[25 Celsius to Fahrenheit, 25 Celsius to Kelvin]\`
(Temperature does not support multi-target breakdown — split into two
expressions.)

User: 5 foot 9 in centimeters
Expression: \`5 feet + 9 inch to centimeter\` → 175.26 centimeter

User: break 502066 meters into km and cm
Expression: \`502066 meter to km, cm\` → 502 kilometer 6,600 centimeter

User: I earn 250 dollars per week. Yearly?
Expression: \`250 weekly to yearly\` → 13,000 yearly

### Common mistakes

Incorrect: \`10 to weekly\`
Result: errors (the value has no source unit)
Correct: \`10 yearly to weekly\` → 0.192 weekly
Why: \`to\` only sets the target. The value being converted must carry its own
unit (\`10 monthly to yearly\`, never \`10 to yearly\`).

Incorrect: \`100 kmh\`
Result: errors (no result — \`kmh\` is not a recognized unit)
Correct: \`100 kph\` (or \`100 kilometer/hour\`)
Why: an unrecognized unit spelling makes the whole expression invalid rather than
being silently discarded. Double-check unit names.

Incorrect: \`50 gram + 12 km\`, \`1 newton to kilo gram\`
Result: errors (incompatible dimensions: mass vs length, force vs mass)
Correct: stay within one dimension (\`50 gram + 12 kg\`,
\`1 newton to kilo gram*meter/second^2\`)
Why: Hissab refuses to mix or convert across incompatible physical dimensions.

Incorrect: \`5 m to miles\`
Result: errors (\`5 m\` is the dimensionless number 5,000,000)
Correct: \`5 meter to miles\` → 0.00311 miles
Why: \`m\` is the million multiplier, not meter. Spell out \`meter\`.

- **Currency is not converted automatically.** \`100 usd to eur\` will not fetch
  a rate; pass the rate inline (e.g. \`100 * 0.92\`) or use the cloud server's
  currency-rate feature where available.
`;

export default unit_conversion;
