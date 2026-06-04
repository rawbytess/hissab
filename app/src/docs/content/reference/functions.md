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
