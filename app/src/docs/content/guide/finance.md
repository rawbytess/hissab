# Finance

Finance functions cover interest, growth, loans, annuities, returns, and common
business calculations.

```hissab
simple interest(10000, 5%, 2 years)
compound interest(1000, 12%, 24 months, 12)
emi(500000, 6.5%, 30 years)
cagr(1000, 2000, 10 years)
```

## Argument conventions

Finance functions use parentheses and comma-separated arguments.

| Argument | How to write it |
| --------------------- | ---------------------------------------------------------------- |
| Rate | `5%` or `5`; both mean five percent |
| Term / time | `2 years`, `18 months`, `30 years 12 months`, or bare years |
| Compounding frequency | A bare number of periods per year, such as `12` for monthly |
| Money | Currency symbols are ignored, so `$10000` and `10000` are equivalent |

:::note

Rates are percentage values. Write `5%` or `5` for five percent. Do not write
`0.05` unless you mean 0.05%.

:::

## Interest and growth

| Function | Description | Example |
| ----------------------------- | -------------------------------- | --------------------------------------------- |
| `simple interest(p, r, t)` | Interest only | `simple interest(10000, 5%, 2 years)` |
| `compound interest(p, r, t, n)` | Compound interest earned | `compound interest(1000, 10%, 2 years)` |
| `future value(p, r, t, n)` | Principal plus compound growth | `future value(1000, 10%, 2 years)` |
| `present value(fv, r, t, n)` | Present value of a future amount | `present value(1210, 10%, 2 years)` |
| `cagr(start, end, t)` | Compound annual growth rate | `cagr(1000, 2000, 10 years)` |

The compounding frequency is optional for compound functions. If you omit it,
Hissab compounds annually.

```hissab
compound interest(1000, 10%, 2 years)
compound interest(1000, 12%, 24 months, 12)
future value(1000, 10%, 2 years)
present value(1210, 10%, 2 years)
cagr(50000, 75000, 5 years)
```

## Loans and mortgage

`emi`, `mortgage`, and `loan payment` calculate the monthly payment for an
amortizing loan.

```hissab
emi(500000, 6.5%, 30 years)
mortgage(500000, 6.5%, 30 years)
loan interest(100000, 12%, 1 year)
```

Use `loan interest` when you need the total interest paid over the life of the
loan.

## Annuities

Annuity functions work with equal payments made each period.

```hissab
future value annuity(1000, 10%, 3 years)
present value annuity(500, 8%, 10 years, 12)
```

## Returns and business math

| Function | Description | Example |
| ---------------------------- | ------------------------------------ | ------------------------------ |
| `roi(initial, final)` | Return on investment | `roi(1000, 1500)` |
| `apy(rate, frequency)` | Effective annual yield | `apy(12%, 12)` |
| `profit margin(revenue, cost)` | Profit as a percent of revenue | `profit margin(200, 150)` |
| `markup(cost, price)` | Markup over cost | `markup(150, 200)` |
| `break even(fixed, price, variable)` | Units needed to break even | `break even(10000, 50, 30)` |
| `runway(cash, burn)` | Months of cash runway | `runway(100000, 8000)` |
| `doubling time(rate)` | Rule-of-72 estimate in years | `doubling time(8%)` |

```hissab
roi(1000, 1500)
apy(12%, 12)
profit margin(200, 150)
markup(150, 200)
break even(10000, 50, 30)
runway(2000000, 150000)
doubling time(8%)
```

## Consumer

Everyday money math for tips, discounts, and tax.

| Function | Description | Example |
| ----------------------------- | ------------------------------- | --------------------------- |
| `tip(bill, rate)` | Tip amount | `tip(80, 18%)` |
| `tip total(bill, rate)` | Bill including the tip | `tip total(80, 18%)` |
| `discount(price, rate)` | Sale price after a discount (alias `sale price`) | `discount(200, 25%)` |
| `sales tax(price, rate)` | Tax on a price | `sales tax(100, 8%)` |
| `price with tax(price, rate)` | Price including tax | `price with tax(100, 8%)` |

```hissab
tip(80, 18%)
tip total(80, 18%)
discount(200, 25%)
sales tax(100, 8%)
price with tax(100, 8%)
```

## Investment appraisal

| Function | Description | Example |
| ------------------------------------ | ------------------------------------------ | -------------------------------- |
| `npv(rate, cf0, cf1, ...)` | Net present value of a cashflow series; the first cashflow is at t = 0 | `npv(10%, -1000, 500, 500, 500)` |
| `irr(cf0, cf1, ...)` | Internal rate of return, as a percent | `irr(-1000, 500, 500, 500)` |
| `depreciation(cost, salvage, life)` | Straight-line depreciation per year | `depreciation(10000, 1000, 5)` |

`irr` needs at least one negative and one positive cashflow (a sign change).
`life` may be a bare number of years or carry the `years` unit.

```hissab
npv(10%, -1000, 500, 500, 500)
irr(-1000, 500, 500, 500)
depreciation(10000, 1000, 5)
depreciation(10000, 1000, 5 years)
```

## Return values

- Amount functions return money-like numbers: `simple interest`,
  `compound interest`, `future value`, `present value`, `emi`, `loan interest`,
  and the annuity functions.
- Rate functions return percentage values: `cagr`, `roi`, `apy`,
  `profit margin`, and `markup`.
- `break even` returns units. `runway` returns months. `doubling time` returns
  years.
- Consumer and investment functions return money (`tip`, `tip total`,
  `discount`, `sales tax`, `price with tax`, `npv`, `depreciation`); `irr`
  returns a percentage.

To get principal plus simple interest, add the principal yourself.

```hissab
10000 + simple interest(10000, 5%, 2 years)
```

## Common mistakes

:::caution

- **`simple interest(10000, 0.05, 2 years)`** reads the rate as 0.05%, not 5%.
  Use `simple interest(10000, 5%, 2 years)`.
- **`rule of 72(8%)`** is invalid because function names cannot contain digits.
  Use `doubling time(8%)`.
- **`compound interest(1000, 10%, 5)`** uses five years and annual compounding.
  Add a frequency, such as `compound interest(1000, 10%, 5 years, 12)`, for
  monthly compounding.

:::
