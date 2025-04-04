const documentation = `
# Hissab documentation and syntax guide
## Basic Arithmetic
- Addition: 13+44+23+5645.43
- Subtraction: 100-25
- Multiplication: 10*5
- Division: 100/5
- Power: 10^5
- Root: 256^(1/8)
- Factorial: 5!
- Modulo: 10 mod 7
- Absolute value: abs(-234)

User: 5 squared plus 3 cubed
Expression: 5^2 + 3^3

User: what is the result of this expression: 14+88/11 * 23.56 - 17
Expression: 14+88/11 * 23.56 - 17

## Percentage Operations
- Percentage of value: 25% of 200
- Discount: 2478 - 30%
- Percent addition: 78% + 873
- Finding total from percentage: 33% of what is 3000

## Unit Conversion Operations
The syntax for unit conversion is:
<value> <source_unit> to <target_unit>

- Conversion: 15 kilometers to miles
- Multiple target units breakdown: 9234 miles to yards, feet, inches
- Mixed unit math (addition or substraction): 13 kilograms + 12 pounds

Hissab understands the following conversion units -
* Length (meter, miles, yard, feet, inches, micron, parsec, astronomical unit, nautical miles, light year)
* Area (hectare, acre, square mile, square feet, square inch, square yard, square meter)
* Volume (litre, gallon, quart, pint, cup, tablespoon, teaspoon, barrel, fluid ounce, cubic mile, cubic foot, cubic inch, cubic yard, cubit meter)
* Temperature (Celsius, kelvin, Fahrenheit, rankine)
* Weight (gram, ton, pound, ounce, carat, amu)
* Angle (degree, grad, radian, arcminute, arcsecond)
* Data (bit, byte, nibble)
* Time (minute, second, day, week, month, year, decade, century, millennium)
* Duration (secondly, minutely, hourly, daily, weekly, monthly, quarterly, yearly)

Hissab also supports prefixes for these units -
yocto, zepto, atto, femto, pico, nano, micro, milli, centi, deci, deka, hecto, kilo, mega, giga, tera, peta, exa, zetta, yotta
septillion, sextillion, quintillion, quadrillion, trillion, billion, million , thousand, hundred, ten, deca, tenth, hundredth,
thousandth, millionth, billionth, trillionth, quadrillionth, quintillionth, sextillionth, septillionth

## Set Operations
- Maximum: max(10m,30k,7.7m,123123121234)
- Minimum: min(10m,30k,7.7m,123123121234)
- LCM or least common multiple: lcm(12,15,18,25)
- GCD or greatest common divisor: gcd(12,15,18,25)
- Permutation: 10 perm 3
- Combination: 10 comb 3

User: how many ways can I pick 3 people from a group of 10
Hissab Expression: 10 comb 3

User: how many ways can I pick a captain, pitcher and shortstop from a group of 10
Hissab Expression: 10 perm 3

User: what is the highest of these numbers - 10 million, 30k, 7.7 million, 123123121234
Hissab Expression: max(10m,30k,7.7m,123123121234)

User: what is the smallest of these numbers - 10 million, 30k, 7.7 million, 123123121234
Hissab Expression: min(10m,30k,7.7m,123123121234)

## Logarithmic Functions
- Natural log: log 20
- Log base 10: log10 20
- Log base 2: log2 20

## Statistical Functions
- Average: avg(99,34,65,213,45,123)
- Harmonic mean: harmonic mean(99,34,65,213,45,123)
- Geometric mean: geometric mean(99,34,65,213,45,123)
- Standard deviation: standard deviation(99,34,65,213,45,123)
- Variance: variance(99,34,65,213,45,123)
- Median: median(99,34,65,213,45,123)
- Range: range(99,34,65,213,45,123)

## Trigonometric Functions
- Sin: sin 45
- Cos: cos 60
- Tan: tan 30
- With units: sec 0.785 radian
[Other trig functions: sec, csc, cot, atan, acos, asin, asec, acsc, acot, tanh, cosh, sinh, sech, csch, coth, atanh, acosh, asinh, asech, acsch, acoth]
You can use any value with unit of angle. if no unit is provided, default is degree.

## Date and Time
Hissab supports following date and time formats -
- dd.mm.yyyy: 07.08.2020
- mm.dd.yyyy: 08.07.2020
- yyyy.mm.dd: 2020.08.07
- dd mmm yyyy: 07 aug 2020
- yyyy mmm dd: 2020 aug 07
- hh:mm:ss:ms: 3:30:15:500
- hh:mm am/pm: 3:30 pm
- hh:mm: 3:30
- Date with time (time must always follow date): 2020.08.07 3:30 pm
- Time with timezone: 3:30 pm pst

Hissab supports the following date and time operations -
- Add duration: 2020.08.07 + 5 days
- Subtract duration: 2020.08.07 - 5 days
- Duration between dates: 2020.08.07 - 9 sep 2020 to minutes
- Age calculation: today - 1 feb 1990 to years
- Date/time to unix epoch: 6 mar 2022 7:23:30 pm to epoch 
- Date/time to unix timestamp: 6 mar 2022 7:23:30 pm to timestamp
- Unix epoch/timestamp to date/time: 1646480610 to human date
- Current time in timezone: now in beijing
- Time conversion: 3:42 am pst in beijing

User: what date is 5 days past aug 7th 2020
Hissab Expression: 2020.08.07 + 5 days

User: what date is 5 days before aug 7th 2020
Hissab Expression: 2020.08.07 - 5 days

User: how many minutes between 2020.08.07 and 9th sep 2020
Hissab Expression: 2020.08.07 - 9 sep 2020 to minutes

Hissab supports the following keywords to get current, past or future dates and times
now - get current date and time
today - get current date
tomorrow - get tomorrow's date
yesterday - get yesterday's date

Hissab supports the following duration units and conversion -
secondly, minutely, hourly, daily, weekly, monthly, quarterly, yearly

User: what is 0.21 per hour monthly?
Hissab Expression: 0.21 hourly to monthly

User: I am earning 250 dollars per week. What is my yearly income?
Hissab Expression: 250 weekly to yearly

User: if I was born on 1st feb 1990, what is my age?
Hissab Expression: today - 1 feb 1990 to years

User: find unix time for 2022 march 6th at 7:23:30 pm
Hissab Expression: 6 mar 2022 7:23:30 pm to unix

## Number Systems
- Decimal: 1234
- Binary: 0b10011010
- Octal: 0o12341
- Hexadecimal: 0x12ab2e4
- Number system conversion: 0b10011010 to decimal
- Number system arithmetic operations: 0b10011010 + 0x12ab2e4 - 0o12341 to binary

## Bitwise Operations
- NOT: ~0b011010
- AND: 123123 & 0b100101
- OR: 0b1011010 | 0x123abe23
- XOR: 0o1024123 xor 0b0101101001
- Right shift: 12342 >> 5
- Left shift: 72318379 << 3

Hissab supports various color representations -
Hex (with or without alpha/transparency) - #1c1c1c
rgb - rgb(12,124,201)
rgba - rgba(12,124,201,0.5)
hsl - hsl(60, 0.03703, 0.1058)
Color names - pink
Color numbers - 1842202

## Color Operations
- Format conversion: #ffa2b3 to rgb color
- Mixing: #ff0000 + #0000ff
- Temperature: #8100ff to color temperature
- Darker shade: #ffa2b3 + 1.3
- Lighter shade: #ffa2b3 - 0.3
- Complimentary/Inverse color: ~red

User: convert #ffa2b3 to rbg color
Hissab Expression: #ffa2b3 to rbg color

## Label expressions and Reference previous result
You can label an expression using the = sign. This will allow you to refer to the result of the expression later in the 
conversation. The label should be followed by the expression. If there are multiple expressions in the array, you must 
label them all appropriately. Use snake case for label names.

Example: 
User: "My monthly income is 1000, expenses are 200 and savings are 50. What is my yearly expense?"
Response: {"expressions": ["monthly_expense = 1000 + 200 - 50", "yearly expense = monthly expense to yearly"]}

You can also refer to the result of the previous calculation using the keyword "prev". "prev" will only refer to the 
immediate previous expression in the array. Thus for any further previous expressions, you must use the label.

User: "Convert 78 kilometers to miles and compare with 45 miles"
Response: {"expressions": ["78 kilometers to miles", "prev - 45 miles"]}

`;
// TODO: Add documentation for monthly, quarterly, yearly

export default documentation;
