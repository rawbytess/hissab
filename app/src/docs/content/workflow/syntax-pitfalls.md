# Common syntax pitfalls

Hissab is **strict by design** — most mistakes error immediately. The subtle
cases are expressions that are *valid syntax* but mean something different from
what you intended.

## The value needs a source unit

**`10 to weekly`** is invalid because `to` only names a target unit. Write the
source unit on the value.

```hissab
10 yearly to weekly
```

## Dates do not use dashes or slashes

**`2020-08-07`** is subtraction, and **`08/07/2020`** is division — both can
return numbers instead of dates. Use dot-separated dates or written months.

```hissab
2020.08.07
7 aug 2020
```

## Unknown words are not ignored

Expressions such as **`what is 10 + 10`**, **`5 apples + 3 apples`**, and
**`100 kmh`** are invalid because of unknown words or units. Strip filler words
and check unit spellings.

```hissab
10 + 10
100 kph
100 kilometer/hour
```

## m means million

**`m` is the million multiplier, not meter.** Spell out `meter`, especially in
compound units.

```hissab
5 meter to miles
9.8 meter/second^2
```

## Parenthesize fractional exponents

**`256 ^ 1/8`** means `(256 ^ 1) / 8`, not the eighth root. Write:

```hissab
256 ^ (1/8)
```

## Functions need parentheses

**`abs -5`**, **`max 1, 2`**, and **`avg 1, 2, 3`** are invalid — function
arguments go in parentheses.

```hissab
abs(-5)
max(1, 2)
avg(1, 2, 3)
```

## Percent with plus or minus is not a literal decimal

**`10% + 50`** means "add 10 percent of 50 to 50". If you need the bare decimal,
write it as a decimal.

```hissab
0.1 + 50
```

## Hexadecimal conversion target is hex

Use **`hex`** as the base conversion target, not `hexadecimal`.

```hissab
255 to hex
```

## Color conversions need color

Color format conversions require the **`color`** keyword.

```hissab
#8100ff to rgb color
#8100ff to hex color
```

## Currency rates are not fetched locally

The local calculator engine **does not fetch currency rates**. Include the rate
as a literal value, or use the AI assistant with realtime search when available.
