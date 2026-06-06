# Functions

Functions take arguments **in parentheses, separated by commas**. Each argument
can itself be an expression.

```hissab
avg(99, 34, 65, 213, 45, 123)
max(10m, 30k, 7.7m)
bayes(0.01, 0.9, 0.05)
derivative(2x^2, x)
```

## Math and number theory

| Function | Description | Example |
| ---------------------- | --------------------------------------- | --------------------- |
| `abs(x)` | Absolute value | `abs(-234)` |
| `sum(...)` | Add all arguments, unit-aware | `sum(12, 23, 52)` |
| `fraction(x)` | Reduced fraction | `fraction(0.625)` |
| `mixed fraction(x)` | Mixed-number fraction | `mixed fraction(7/3)` |
| `isprime(x)` | Primality test | `isprime(91)` |
| `factors(x)` | All positive divisors | `factors(28)` |

## Statistics

| Function | Description | Example |
| ----------------------- | ----------------------------- | ------------------------------- |
| `avg(...)` / `mean(...)` | Arithmetic mean | `avg(70, 80, 90)` |
| `median(...)` | Middle value | `median(2, 4, 4, 6)` |
| `range(...)` | Largest minus smallest | `range(2, 4, 10)` |
| `variance(...)` | Population variance | `variance(2, 4, 4, 6)` |
| `standard deviation(...)` | Population standard deviation | `standard deviation(2, 4, 4)` |
| `harmonic mean(...)` | Harmonic mean | `harmonic mean(8, 12, 15)` |
| `geometric mean(...)` | Geometric mean | `geometric mean(8, 12, 15)` |

## Sets and combinatorics

| Function / operator | Description | Example |
| ------------------- | ------------------------------ | ------------------------------ |
| `max(...)` | Maximum value, unit-aware | `max(10m, 30k, 7.7m)` |
| `min(...)` | Minimum value, unit-aware | `min(12 meters, 12 miles)` |
| `lcm(...)` | Least common multiple | `lcm(12, 15, 18, 25)` |
| `gcd(...)` | Greatest common divisor | `gcd(12, 15, 18, 25)` |
| `perm` | Permutations, order matters | `10 perm 3` |
| `comb` | Combinations, order ignored | `10 comb 3` |

## Probability

| Function | Description | Example |
| ------------------------------ | ---------------------------------------- | ------------------------------ |
| `P(x)` | Probability literal between 0 and 1 | `P(10%)` |
| `conditional(pAandB, pB)` | Conditional probability P(A\|B) | `conditional(0.12, 0.3)` |
| `bayes(prior, likelihood, fp)` | Bayes posterior P(H\|E) | `bayes(0.01, 0.9, 0.05)` |
| `odds(p)` | Odds for a probability | `odds(0.75)` |
| `probability from odds(o)` | Probability implied by odds | `probability from odds(3)` |
| `binomial(n, k, p)` | Exactly k successes in n trials | `binomial(10, 3, 0.5)` |
| `expected value(v1, p1, ...)` | Weighted sum of value/probability pairs | `expected value(10, 0.5, 20, 0.5)` |

## Finance

| Function | Description | Example |
| ----------------------------- | -------------------------------- | --------------------------------------------- |
| `simple interest(p, r, t)` | Interest only | `simple interest(10000, 5%, 2 years)` |
| `compound interest(p, r, t, n)` | Compound interest earned | `compound interest(1000, 10%, 2 years)` |
| `future value(p, r, t, n)` | Principal plus compound growth | `future value(1000, 10%, 2 years)` |
| `present value(fv, r, t, n)` | Present value of a future amount | `present value(1210, 10%, 2 years)` |
| `cagr(start, end, t)` | Compound annual growth rate | `cagr(1000, 2000, 10 years)` |
| `emi(p, r, t)` | Monthly amortizing loan payment | `emi(500000, 6.5%, 30 years)` |
| `mortgage(p, r, t)` | Alias for `emi` | `mortgage(500000, 6.5%, 30 years)` |
| `loan payment(p, r, t)` | Alias for `emi` | `loan payment(500000, 6.5%, 30 years)` |
| `loan interest(p, r, t)` | Total interest paid | `loan interest(100000, 12%, 1 year)` |
| `future value annuity(pmt, r, t, n)` | Future value of equal payments | `future value annuity(1000, 10%, 3 years)` |
| `present value annuity(pmt, r, t, n)` | Present value of equal payments | `present value annuity(500, 8%, 10 years, 12)` |
| `roi(initial, final)` | Return on investment | `roi(1000, 1500)` |
| `apy(rate, frequency)` | Effective annual yield | `apy(12%, 12)` |
| `profit margin(revenue, cost)` | Profit as a percent of revenue | `profit margin(200, 150)` |
| `markup(cost, price)` | Markup over cost | `markup(150, 200)` |
| `break even(fixed, price, variable)` | Units needed to break even | `break even(10000, 50, 30)` |
| `runway(cash, burn)` | Months of cash runway | `runway(100000, 8000)` |
| `doubling time(rate)` | Rule-of-72 estimate in years | `doubling time(8%)` |
| `tip(bill, rate)` | Tip amount | `tip(80, 18%)` |
| `tip total(bill, rate)` | Bill including the tip | `tip total(80, 18%)` |
| `discount(price, rate)` | Sale price after a discount (alias `sale price`) | `discount(200, 25%)` |
| `sales tax(price, rate)` | Tax on a price | `sales tax(100, 8%)` |
| `price with tax(price, rate)` | Price including tax | `price with tax(100, 8%)` |
| `npv(rate, cf0, cf1, ...)` | Net present value of a cashflow series | `npv(10%, -1000, 500, 500, 500)` |
| `irr(cf0, cf1, ...)` | Internal rate of return, as a percent | `irr(-1000, 500, 500, 500)` |
| `depreciation(cost, salvage, life)` | Straight-line depreciation per year | `depreciation(10000, 1000, 5)` |

## Health and fitness

Body-composition and fitness metrics. Inputs accept weight/height units. See
**Health & Fitness** for the formula standards.

| Function | Description | Example |
| --- | --- | --- |
| `bmi(weight, height)` | Body Mass Index | `bmi(70, 1.75)` |
| `bmr male(w, h, age)` / `bmr female(...)` | Basal metabolic rate, kcal/day | `bmr male(80, 180, 30)` |
| `tdee(bmr, factor)` | Total daily energy expenditure | `tdee(1780, 1.55)` |
| `body fat male(w, h, age)` / `body fat female(...)` | Body fat % (Deurenberg) | `body fat male(80, 1.8, 30)` |
| `ideal weight male(height)` / `ideal weight female(...)` | Ideal weight, kg (Devine) | `ideal weight male(180 cm)` |
| `max heart rate(age)` | Maximum heart rate, bpm | `max heart rate(30)` |
| `target heart rate(age, intensity)` | Target heart-rate zone, bpm | `target heart rate(30, 70%)` |
| `calories burned(met, weight, minutes)` | Calories for an activity | `calories burned(8, 70, 30)` |
| `water intake(weight)` | Suggested daily water | `water intake(70 kg)` |

## Symbolic algebra

| Function | Description | Example |
| ----------------------------- | ----------------------------- | -------------------------------- |
| `simplify(expr)` | Collect like terms | `simplify(2x^2 - 4x^2)` |
| `derivative(expr, variable)` | Derivative | `derivative(2x^2, x)` |
| `diff(expr, variable)` | Alias for `derivative` | `diff(sin(x), x)` |
| `integrate(expr, variable)` | Indefinite integral | `integrate(2x^2 + 3x, x)` |
| `integral(expr, variable)` | Alias for `integrate` | `integral(2x^2 + 3x, x)` |
| `integrate(expr, variable, a, b)` | Definite integral | `integrate(2x^2, x, 0, 5)` |
| `limit(expr, variable, point)` | Limit | `limit(sin(x)/x, x, 0)` |

## IP addresses

| Function | Description | Example |
| ------------------- | ------------------------------- | -------------------------------- |
| `ipv4(n)` | Build IPv4 address from integer | `ipv4(3232235777)` |
| `ipv6(n)` | Build IPv6 address from integer | `ipv6(1)` |
| `network(cidr)` | Network address | `network(192.168.1.130/24)` |
| `broadcast(cidr)` | Broadcast address | `broadcast(192.168.1.0/24)` |
| `netmask(cidr)` | Subnet mask | `netmask(10.0.0.0/24)` |
| `subnetmask(cidr)` | Alias for `netmask` | `subnetmask(10.0.0.0/24)` |
| `wildcard(cidr)` | Inverse mask | `wildcard(192.168.1.0/24)` |
| `firsthost(cidr)` | First usable host | `firsthost(192.168.1.0/24)` |
| `lasthost(cidr)` | Last usable host | `lasthost(192.168.1.0/24)` |
| `hosts(cidr)` | Usable host count | `hosts(192.168.1.0/24)` |
| `addresses(cidr)` | Total address count | `addresses(192.168.1.0/24)` |
| `prefix(maskOrCidr)` | Prefix length | `prefix(255.255.255.0)` |
| `version(address)` | IP version, `4` or `6` | `version(2001:db8::1)` |
| `contains(cidr, address)` | Subnet membership | `contains(192.168.1.0/24, 192.168.1.5)` |
| `isprivate(address)` | Private address test | `isprivate(10.1.2.3)` |
| `ispublic(address)` | Public address test | `ispublic(8.8.8.8)` |
| `isloopback(address)` | Loopback test | `isloopback(127.0.0.1)` |
| `ismulticast(address)` | Multicast test | `ismulticast(224.0.0.1)` |

## Trigonometry and logarithms

These take the value **after the name**, and parentheses are optional for plain
numeric arguments. See **Trigonometry** and **Logarithms** for details.

| Group | Names |
| ------------------- | --------------------------------------------- |
| Basic trig | `sin`, `cos`, `tan`, `sec`, `csc`, `cot` |
| Inverse | `asin`, `acos`, `atan`, `asec`, `acsc`, `acot` |
| Hyperbolic | `sinh`, `cosh`, `tanh`, `sech`, `csch`, `coth` |
| Inverse hyperbolic | `asinh`, `acosh`, `atanh`, `asech`, `acsch`, `acoth` |
| Logarithms | `log` / `loge` (natural), `log10`, `log2` |

## Geometry

Shape area, perimeter/circumference, surface area, volume, and line slope.
Length units on the arguments carry into the result. See **Geometry**.

| Function | Description | Example |
| --- | --- | --- |
| `circle area(r)` | π·r² | `circle area(5)` |
| `circle circumference(r)` | 2·π·r (alias `circle perimeter`) | `circle circumference(5)` |
| `square area(s)` / `square perimeter(s)` | Square area / perimeter | `square area(4)` |
| `rectangle area(w, h)` / `rectangle perimeter(w, h)` | Rectangle area / perimeter | `rectangle area(3, 4)` |
| `triangle area(base, height)` | ½·base·height (or Heron from three sides) | `triangle area(3, 4, 5)` |
| `trapezoid area(a, b, h)` | ½·(a + b)·h | `trapezoid area(4, 6, 3)` |
| `parallelogram area(base, height)` | base × height | `parallelogram area(5, 3)` |
| `ellipse area(a, b)` | π·a·b | `ellipse area(3, 2)` |
| `sphere volume(r)` / `sphere surface area(r)` | Sphere volume / area (alias `sphere area`) | `sphere volume(3)` |
| `cube volume(s)` / `cube surface area(s)` | Cube volume / surface area | `cube volume(3)` |
| `cylinder volume(r, h)` / `cylinder surface area(r, h)` | Cylinder volume / surface area | `cylinder volume(2, 5)` |
| `cone volume(r, h)` / `cone surface area(r, h)` | Cone volume / surface area | `cone volume(2, 6)` |
| `rectangular prism volume(l, w, h)` | Box volume (alias `box volume`) | `box volume(2, 3, 4)` |
| `pyramid volume(l, w, h)` | 1/3·l·w·h | `pyramid volume(3, 3, 9)` |
| `slope(x1, y1, x2, y2)` | Slope of a line | `slope(0, 0, 2, 4)` |

## Coordinate systems

Constructors build points; a single point argument converts it. See
**Coordinate Systems** for `to`-conversions and arithmetic.

| Function | Description | Example |
| ------------------------ | --------------------------------------------- | -------------------------------------- |
| `point(...)` | Cartesian point/vector (also `cartesian`, `vector`) | `point(1, 2, 3)` |
| `polar(r, θ)` | 2-D polar point (θ in degrees) | `polar(5, 90)` |
| `cylindrical(r, θ, z)` | 3-D cylindrical point | `cylindrical(2, 90, 5)` |
| `spherical(ρ, θ, φ)` | 3-D spherical point | `spherical(1, 90, 0)` |
| `minkowski(t, x, y, z)` | Spacetime point (−,+,+,+) | `minkowski(1, 2, 3, 4)` |
| `distance(a, b)` | Distance between two points | `distance(point(0,0), point(3,4))` |
| `magnitude(v)` / `norm(v)` | Length from the origin | `magnitude(point(3,4))` |
| `midpoint(a, b)` | Midpoint of two points | `midpoint(point(0,0), point(4,6))` |
| `dot(a, b)` | Dot product (scalar) | `dot(point(1,2,3), point(4,5,6))` |
| `cross(a, b)` | Cross product of two 3-D vectors | `cross(point(1,0,0), point(0,1,0))` |
| `angle(a, b)` | Angle between two vectors (degrees) | `angle(point(1,0), point(0,1))` |
| `normalize(v)` | Unit vector | `normalize(point(3,4))` |
| `interval(p, q)` | Signed Minkowski interval s² | `interval(minkowski(5,0,0,0), minkowski(0,3,0,0))` |
| `atan2(y, x)` | Two-argument arctangent (degrees) | `atan2(1, 1)` |
| `hypot(...)` | Euclidean norm √(x²+y²+…) | `hypot(3, 4)` |

## Matrices

Take a matrix literal `[1 2, 3 4]` (space = column, comma/semicolon = row). See
**Matrices** for arithmetic and the full set.

| Function | Description | Example |
| --- | --- | --- |
| `transpose(A)` | Transpose | `transpose([1 2 3, 4 5 6])` |
| `determinant(A)` / `det(A)` | Determinant of a square matrix | `determinant([1 2, 3 4])` |
| `inverse(A)` / `inv(A)` | Inverse of an invertible matrix | `inverse([4 7, 2 6])` |
| `adjugate(A)` / `adj(A)` | Classical adjoint | `adjugate([1 2, 3 4])` |
| `trace(A)` | Sum of the diagonal | `trace([1 2, 3 4])` |
| `rank(A)` | Rank | `rank([1 2, 2 4])` |
| `rref(A)` | Reduced row-echelon form | `rref([1 2 3, 4 5 6, 7 8 9])` |
| `minor(A, i, j)` | (i, j) minor (1-indexed) | `minor([1 2 3, 4 5 6, 7 8 10], 1, 1)` |
| `cofactor(A, i, j)` | (i, j) cofactor (1-indexed) | `cofactor([1 2 3, 4 5 6, 7 8 10], 1, 2)` |
| `identity(n)` / `eye(n)` | n×n identity | `identity(3)` |
| `zeros(n)` / `zeros(r, c)` | Zero matrix | `zeros(2, 3)` |
| `ones(n)` / `ones(r, c)` | All-ones matrix | `ones(2, 2)` |
| `diag(...)` / `diag(A)` | Build / extract a diagonal | `diag(1, 2, 3)` |
| `size(A)` / `shape(A)` | Dimensions `[rows cols]` | `size([1 2 3, 4 5 6])` |
| `rows(A)` / `cols(A)` | Row / column count | `rows([1 2 3, 4 5 6])` |
| `hadamard(A, B)` | Element-wise product | `hadamard([1 2, 3 4], [10 20, 30 40])` |
| `linsolve(A, b)` | Solve A·x = b | `linsolve([2 1, 1 3], [5, 10])` |
| `eigenvalues(A)` / `eigvals(A)` | Eigenvalues (approximate) | `eigenvalues([2 1, 1 2])` |
| `eigenvectors(A)` / `eigvecs(A)` | Eigenvectors as columns | `eigenvectors([2 0, 0 3])` |

## Visualization

Produce a graph rendered below the editor. See **Graphing**.

| Function | Description | Example |
| --- | --- | --- |
| `draw(...)` | Graph curves `y=f(x)`, complex numbers, or points (alias `plot`) | `draw(x^2)` |
| `plot(...)` | Alias for `draw` | `plot(sin(x), cos(x))` |

## Random

Draw random values. In the app the result freezes (a hidden managed seed) so it
stays stable across edits; hover the function name to reveal the seed and
re-roll. See **Random & IDs**.

| Function | Description | Example |
| --- | --- | --- |
| `random()` | Real number in `[0, 1)` | `random()` |
| `random(max)` | Whole number from `0` to `max` | `random(6)` |
| `random(min, max)` | Whole number from `min` to `max` | `random(10, 100)` |
| `uuid()` | UUID — v7 by default; `uuid(4)` / `uuid(7)` | `uuid()` |
| `nanoid()` | URL-safe id; `nanoid(n)` sets length | `nanoid()` |
| `coin()` | `"heads"` or `"tails"` | `coin()` |
| `randombool()` | `true` or `false` | `randombool()` |
| `pick(...)` | One argument chosen at random | `pick(1, 2, 3)` |
| `randomcolor()` | A random colour | `randomcolor()` |

## Hashing

Deterministic hashes and checksums of a quoted string (or a number). Returns a
lowercase hex digest. See **Hashing**.

| Function | Description | Example |
| --- | --- | --- |
| `md5(text)` | MD5 (128-bit) | `md5("hello")` |
| `sha1(text)` | SHA-1 (160-bit) | `sha1("hello")` |
| `sha256(text)` | SHA-256 (256-bit) | `sha256("hello")` |
| `sha384(text)` | SHA-384 (384-bit) | `sha384("hello")` |
| `sha512(text)` | SHA-512 (512-bit) | `sha512("hello")` |
| `sha3(text)` | SHA3-256 (alias `sha3_256`) | `sha3("hello")` |
| `ripemd160(text)` | RIPEMD-160 (160-bit) | `ripemd160("hello")` |
| `crc32(text)` | CRC32 checksum | `crc32("hello")` |

## Color constructors

`rgb(...)`, `rgba(...)`, and `hsl(...)` build colors. See **Colors**.

```hissab
rgb(12, 124, 201)
rgba(12, 124, 201, 0.5)
hsl(60, 0.03703, 0.1058)
```

## Constants and special values

`pi`, `e`, and `i` can be used anywhere a compatible number is expected. `i` is
the imaginary unit for complex arithmetic.

```hissab
2 * pi
e ^ 2
i^2
```

:::note

Function names are generally case-insensitive. Labels are case-sensitive.

:::
