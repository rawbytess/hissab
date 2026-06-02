# Units & prefixes

A single reference for the unit families, named derived units, prefixes, and
conversion targets Hissab understands. For how conversion works, see **Unit
conversion** and **Compound units**.

## Base unit families

| Family | Units |
| ------------- | ----- |
| **Length** | meter, mile, yard, feet, inch, micron, parsec, astronomical unit, nautical mile, light year, angstrom, fathom, furlong, league, chain, rod, hand, pica, point |
| **Area** | hectare, acre, square mile, square feet, square inch, square yard, square meter, are, barn |
| **Volume** | litre, gallon, quart, pint, cup, tablespoon, teaspoon, barrel, fluid ounce, cubic mile/foot/inch/yard/meter, imperial gallon/quart/pint/fluid ounce, peck, bushel, jigger, hogshead, fluid dram, minim |
| **Temperature** | Celsius, kelvin, Fahrenheit, rankine |
| **Weight** | gram, ton, pound, ounce, carat, amu, tonne / metric ton, long ton, stone, slug, grain, dram, troy ounce, troy pound, hundredweight |
| **Angle** | degree, grad, radian, arcminute, arcsecond, turn |
| **Data** | bit, byte, nibble |
| **Time** | second, minute, hour, day, week, month, year, decade, century, millennium, fortnight |
| **Duration / rate** | secondly, minutely, hourly, daily, weekly, monthly, quarterly, yearly |

## Named derived units

| Family | Units |
| ------------------- | ----- |
| **Force** | newton/N, dyne, pound force/lbf, kilogram force/kgf, kip |
| **Energy** | joule/J, calorie/cal, kilocalorie/kcal, BTU, electron volt/eV, erg, watt hour/Wh, kilowatt hour/kWh, foot pound, therm, ton TNT |
| **Power** | watt/W, horsepower/hp, metric horsepower, electrical horsepower, BTU per hour, foot pound per second |
| **Pressure** | pascal/Pa, bar, atmosphere/atm, psi, torr, mmHg, inHg, pound per square foot |
| **Frequency** | hertz/Hz, rpm |
| **Speed** | knot/kn, mach, speed of light, mile/hour, kilometer/hour, meter/second, feet/second |
| **Acceleration** | standard gravity, galileo, meter/second^2 |
| **Illuminance** | lux/lx, foot candle, phot |
| **Luminous flux** | lumen/lm |
| **Radioactivity** | becquerel/Bq, curie/Ci |
| **Radiation dose** | gray/Gy, sievert/Sv, rad, rem |
| **Catalytic activity** | katal/kat |
| **Concentration** | molar, mole/liter |
| **Dynamic viscosity** | poise, centipoise/cP, pascal*second |
| **Kinematic viscosity** | stokes, centistokes/cSt, meter^2/second |
| **Electromagnetism** | coulomb, volt, ohm, farad, henry, weber, tesla, gauss, maxwell, oersted, siemens |
| **Dimensionless** | ppm, ppb, ppt |

## Prefixes

| Type | Values |
| ------------------------ | ----- |
| **SI** | yocto, zepto, atto, femto, pico, nano, micro, milli, centi, deci, deka, hecto, kilo, mega, giga, tera, peta, exa, zetta, yotta |
| **Numeric multipliers** | septillion … billion, million, thousand, hundred, ten, deca, and fractional forms (tenth, hundredth, … millionth). Short forms `k`, `m`, `b` mean thousand, million, billion. |
| **Binary** (data units) | 1024-based, e.g. `1 kilobyte = 1024 bytes` |

```hissab
5 kilo meter to meter
1 kilobyte to bytes
5 million
```

## Conversion targets

| Target | Syntax | Example |
| --------------------- | --------------------------------------- | ------------------------------- |
| **Units** | any unit name after `to` | `15 kilometers to miles` |
| **Multi-target** | comma-separated targets | `9234 miles to yards, feet, inch` |
| **Number bases** | `binary`, `octal`, `decimal`, `hex` | `0xff to binary` |
| **Color formats** | `rgb/hex/rgba/hsl color`, `color name/number/temperature` | `#ffa2b3 to rgb color` |
| **Dates and times** | `epoch`, `timestamp`, `human date`, `to years`, … | `12 mar 2020 utc to epoch` |

:::note
Multi-target breakdown is **not supported for Temperature or Duration**, and the
hexadecimal base target is `hex`, not `hexadecimal`.
:::

```hissab
0xff to binary
#ffa2b3 to rgb color
12 mar 2020 utc to epoch
```
