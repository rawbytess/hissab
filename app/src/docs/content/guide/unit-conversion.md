# Unit conversion

Convert one unit to another, mix units in arithmetic, and use SI, binary, and
numeric prefixes. For compound units such as `meter/second`, `newton*meter`, or
`mph`, see **Compound units**.

## Syntax

Use this form:

```text
<value> <source_unit> to <target_unit>
```

```hissab
15 kilometers to miles
9234 miles to yards, feet, inch
13 kilograms + 12 pounds to kg
```

The `to` keyword names the target. The value being converted **must already
have a source unit**.

## Supported unit families

- **Length** — meter, mile, yard, feet, inch, micron, parsec, astronomical unit, nautical mile, light year, angstrom, fathom, furlong, league, chain, rod, hand, pica, point
- **Area** — hectare, acre, square mile, square feet, square inch, square yard, square meter, are, barn
- **Volume** — litre, gallon, quart, pint, cup, tablespoon, teaspoon, barrel, fluid ounce, cubic mile/foot/inch/yard/meter, imperial gallon/quart/pint/fluid ounce, peck, bushel, jigger, hogshead, fluid dram, minim
- **Temperature** — Celsius, kelvin, Fahrenheit, rankine
- **Weight** — gram, ton, pound, ounce, carat, amu, tonne / metric ton, long ton, stone, slug, grain, dram, troy ounce, troy pound, hundredweight
- **Angle** — degree, grad, radian, arcminute, arcsecond, turn
- **Data** — bit, byte, nibble
- **Time** — second, minute, hour, day, week, month, year, decade, century, millennium, fortnight
- **Duration / rate** — secondly, minutely, hourly, daily, weekly, monthly, quarterly, yearly

Named derived physical units (force, energy, power, pressure, speed, frequency)
are covered in **Compound units**.

## Prefixes

- **SI prefixes** — `yocto`, `zepto`, `atto`, `femto`, `pico`, `nano`, `micro`, `milli`, `centi`, `deci`, `deka`, `hecto`, `kilo`, `mega`, `giga`, `tera`, `peta`, `exa`, `zetta`, `yotta`
- **Numeric multipliers** — `septillion` through `thousand`, `hundred`, `ten`, plus fractional forms such as `tenth`, `hundredth`, and `millionth`
- **Binary prefixes** on data units use **1024-based** multipliers

```hissab
5 kilo meter to meter
1 kilobyte to bytes
5 million
```

## Common examples

:::note

Temperature does **not** support multi-target breakdown — split it into separate
expressions.

:::

```hissab
25 Celsius to Fahrenheit
25 Celsius to Kelvin
```

Mixed units are added before conversion.

```hissab
5 feet + 9 inch to centimeter
502066 meter to km, cm
250 weekly to yearly
```

## Common mistakes

:::caution

- **`10 to weekly`** is invalid — `10` has no source unit. Use `10 yearly to weekly`.
- **`100 kmh`** is invalid — `kmh` is not a recognized unit. Use `100 kph` or `100 kilometer/hour`.
- **`50 gram + 12 km`** is invalid — mass and length are incompatible.
- **`5 m to miles`** fails because `m` means million. Use `5 meter to miles`.

:::

Currency is **not** converted by the local calculator engine. Provide the rate
explicitly when you need currency math.
