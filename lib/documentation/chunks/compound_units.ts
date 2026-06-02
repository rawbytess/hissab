export const compound_units = `
## Compound units

Hissab understands compound units built with \`*\`, \`/\`, \`^<integer>\`, and
parenthesised groups. Two compound units with the same dimensional signature
are interchangeable across rearrangement and naming.

### Forms

- Literals: \`9.8 meter/second^2\`, \`60 mile/hour\`, \`5 newton*meter^2/kilo gram^2\`
- "per" alias: \`60 mile per hour\`, \`5 pound per square inch\`
- Single-word shortcuts: \`mph\`, \`kph\`, \`fps\`, \`fpm\`, \`psi\` — expand to their
  compound forms (\`60 mph\` → \`60 mile/hour\`).
- Conversion: \`60 mile/hour to kilo meter/hour\`, \`1 newton to kilo gram*meter/second^2\`,
  \`1 atmosphere to pascal\`, \`5 meter^2 to square meter\`.

### Arithmetic

Unit-aware multiplication and division propagate compound units:

- \`60 kilo meter/hour * 2 hour\` → \`120 kilometer\` (hours cancel)
- \`5 kilo meter / 2 meter\` → \`2,500\` (dimensions cancel; result is a plain number)
- \`10 newton * 5 meter to joule\` → \`50 joule\`
- \`1 / (5 second) to hertz\` → \`0.2 hertz\`

### Named derived units (already compound)

- **Force**: newton/N, dyne, pound force/lbf, kilogram force/kgf, kip
- **Energy**: joule/J, calorie/cal, kilocalorie/kcal, BTU, electron volt/eV, erg, watt hour/Wh, kilowatt hour/kWh, foot pound, therm, ton TNT
- **Power**: watt/W, horsepower/hp, metric horsepower, electrical horsepower, BTU per hour, foot pound per second
- **Pressure**: pascal/Pa, bar, atmosphere/atm, psi, torr, mmHg, inHg, pound per square foot
- **Frequency**: hertz/Hz, rpm
- **Speed**: knot/kn, mach, speed of light — plus compounds (mile/hour, kilometer/hour, meter/second, feet/second)
- **Acceleration**: standard gravity, galileo — plus compounds (meter/second^2)
- **Illuminance**: lux/lx, foot candle, phot
- **Luminous Flux**: lumen/lm
- **Radioactivity**: becquerel/Bq, curie/Ci
- **Radiation Dose**: gray/Gy, sievert/Sv, rad, rem
- **Catalytic Activity**: katal/kat
- **Concentration**: molar — plus compounds (mole/liter)
- **Dynamic Viscosity**: poise, centipoise/cP — plus compounds (pascal*second)
- **Kinematic Viscosity**: stokes, centistokes/cSt — plus compounds (meter^2/second)
- **Electromagnetism**: coulomb, volt, ohm, farad, henry, weber, tesla, gauss, maxwell, oersted, siemens
- **Dimensionless multipliers**: ppm (1e-6), ppb (1e-9), ppt (1e-12); usable as a postfix on a number, e.g. \`5 ppm\`.

### Examples

User: 60 mph in m/s
Expression: \`60 mile/hour to meter/second\`

User: kinetic energy of a 1500 kg car at 60 mph (½ m v²)
Expressions:
\`\`\`
v = 60 mile/hour to meter/second
ke = (1500 kilo gram * v^2) / 2
\`\`\`

User: pressure in pascals at the bottom of a 10 m water column (ρ g h)
Expression: \`1000 kilo gram/meter^3 * 9.8 meter/second^2 * 10 meter to pascal\`

### Common mistakes

Incorrect: \`9.8 m/s^2\`, \`5 m/s\`
Result: errors
Correct: \`9.8 meter/second^2\`, \`5 meter/second\`
Why: \`m\` is the million multiplier (\`5 m\` = 5,000,000), not meter. Always
spell out unit names in compound units. Single-letter symbols that don't
collide (\`N\`, \`J\`, \`W\`, \`Pa\`, \`Hz\`) do work.

Incorrect: \`5 celsius/meter\`
Result: errors
Correct: use kelvin in compounds: \`5 kelvin/meter\`
Why: affine temperatures (celsius, fahrenheit) can't appear in a compound;
only \`kelvin\` and \`rankine\` are linear and allowed. Currency is also rejected.

Incorrect: \`5 meter^2\` when you meant "5 meters, squared"
Result: \`5 meter^2\` (the \`^2\` attaches to the unit, not the number)
Correct: \`(5 meter)^2\` → 25 meter
Why: a bare \`^<integer>\` after a unit-bearing number builds the compound unit.
Parenthesise the value to square the number instead.
`;

export default compound_units;
