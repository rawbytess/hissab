# Compound units

Hissab understands compound units built with `*`, `/`, integer powers, and
parenthesized groups. Units with the **same dimensional signature** can be
converted even when written differently.

## Forms

- **Literal compounds** — `9.8 meter/second^2`
- **`per` alias** — `60 mile per hour`
- **Shortcuts** — `mph`, `kph`, `fps`, `fpm`, `psi`
- **Conversion** — `60 mile/hour to kilo meter/hour`

```hissab
9.8 meter/second^2
60 mile/hour to meter/second
60 mile per hour to meter/second
1 newton to kilo gram*meter/second^2
1 atmosphere to pascal
5 meter^2 to square meter
```

## Arithmetic

Multiplication and division **propagate units**, cancel dimensions, and can
produce derived units.

```hissab
60 kilo meter/hour * 2 hour
5 kilo meter / 2 meter
10 newton * 5 meter to joule
1 / (5 second) to hertz
```

## Named derived units

- **Force** — newton/N, dyne, pound force/lbf, kilogram force/kgf, kip
- **Energy** — joule/J, calorie/cal, kilocalorie/kcal, BTU, electron volt/eV, erg, watt hour/Wh, kilowatt hour/kWh, foot pound, therm, ton TNT
- **Power** — watt/W, horsepower/hp, metric horsepower, electrical horsepower, BTU per hour, foot pound per second
- **Pressure** — pascal/Pa, bar, atmosphere/atm, psi, torr, mmHg, inHg, pound per square foot
- **Frequency** — hertz/Hz, rpm
- **Speed** — knot/kn, mach, speed of light, mile/hour, kilometer/hour, meter/second, feet/second
- **Acceleration** — standard gravity, galileo, meter/second^2
- **Illuminance** — lux/lx, foot candle, phot
- **Luminous flux** — lumen/lm
- **Radioactivity** — becquerel/Bq, curie/Ci
- **Radiation dose** — gray/Gy, sievert/Sv, rad, rem
- **Catalytic activity** — katal/kat
- **Concentration** — molar, mole/liter
- **Dynamic viscosity** — poise, centipoise/cP, pascal*second
- **Kinematic viscosity** — stokes, centistokes/cSt, meter^2/second
- **Electromagnetism** — coulomb, volt, ohm, farad, henry, weber, tesla, gauss, maxwell, oersted, siemens
- **Dimensionless multipliers** — ppm, ppb, ppt

```hissab
5 ppm
60 rpm to hertz
750 watt to horsepower
```

## Worked examples

**Kinetic energy** for a 1500 kg car at 60 mph:

```hissab
v = 60 mile/hour to meter/second
ke = (1500 kilo gram * v^2) / 2
```

**Pressure** at the bottom of a 10 meter water column:

```hissab
1000 kilo gram/meter^3 * 9.8 meter/second^2 * 10 meter to pascal
```

## Common mistakes

:::caution

- **`9.8 m/s^2`** and **`5 m/s`** are invalid for meters — `m` means million.
  Write `meter`.
- **`5 celsius/meter`** is invalid — use `kelvin` in compound units, because
  Celsius and Fahrenheit are affine temperatures.
- **`5 meter^2`** means five square meters. For five meters squared, write
  `(5 meter)^2`.

:::

```hissab
(5 meter)^2
```
