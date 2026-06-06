export const finance = `
## Finance

Time-value-of-money and everyday business math, written as functions with
comma-separated arguments: \`simple interest(10000, 5%, 2 years)\`,
\`emi(500000, 6.5%, 30 years)\`, \`cagr(1000, 2000, 10 years)\`.

### Argument conventions

These apply to every finance function:

- **Rate** — write a percentage: \`5%\` or just \`5\` both mean five percent
  (\`0.05\`). Do **not** write the decimal \`0.05\` (it would be read as 0.05%).
- **Term / time** — a number with a time unit (\`2 years\`, \`18 months\`,
  \`30 years 12 months\`) or a bare number read as **years** (\`2\` = 2 years).
- **Compounding frequency** — for compound functions, a bare number = times
  compounded per year (\`12\` monthly, \`4\` quarterly, \`365\` daily). Defaults to
  **1** (annual). The term is recognized by its time unit, so the frequency and
  term can appear in either order.
- **Money in** — \`$\`, \`€\` and other currency glyphs are stripped, so
  \`$10000\` is the same as \`10000\`. Write the plain number.
- **Rate out** — functions that return a rate (CAGR, ROI, APY, profit margin,
  markup) return a **percentage value**: \`12.5\` means 12.5%.

### Interest & growth

- Simple interest (interest only): \`simple interest(principal, rate, time)\`
  → \`simple interest(10000, 5%, 2 years)\` → 1,000
- Compound interest (interest earned): \`compound interest(principal, rate, time, [frequency])\`
  → \`compound interest(1000, 10%, 2 years)\` → 210
  → \`compound interest(1000, 12%, 24 months, 12)\` → 269.7346 (monthly)
- Future value / compound amount: \`future value(principal, rate, time, [frequency])\`
  → \`future value(1000, 10%, 2 years)\` → 1,210
- Present value of a future amount: \`present value(futureValue, rate, time, [frequency])\`
  → \`present value(1210, 10%, 2 years)\` → 1,000
- Compound annual growth rate: \`cagr(beginValue, endValue, time)\`
  → \`cagr(1000, 2000, 10 years)\` → 7.1773 (i.e. 7.1773%)

### Loans & mortgage

- Monthly payment on an amortizing loan: \`emi(principal, annualRate, time)\`
  (aliases \`mortgage\`, \`loan payment\`)
  → \`emi(500000, 6.5%, 30 years)\` → 3,160.3401
- Total interest paid over the loan: \`loan interest(principal, annualRate, time)\`
  → \`loan interest(100000, 12%, 1 year)\` → 6,618.5464

### Annuities

Equal payments made every period.

- Future value: \`future value annuity(payment, rate, time, [frequency])\`
  → \`future value annuity(1000, 10%, 3 years)\` → 3,310
- Present value: \`present value annuity(payment, rate, time, [frequency])\`
  → \`present value annuity(500, 8%, 10 years, 12)\` → present value of monthly deposits

### Returns & banking

- Return on investment: \`roi(initialValue, finalValue)\`
  → \`roi(1000, 1500)\` → 50 (i.e. 50%)
- Annual percentage yield (effective rate): \`apy(nominalRate, frequency)\`
  → \`apy(12%, 12)\` → 12.6825

### Business & startup

- Profit margin: \`profit margin(revenue, cost)\` → \`profit margin(200, 150)\` → 25
- Markup: \`markup(cost, price)\` → \`markup(150, 200)\` → 33.3333
- Break-even units: \`break even(fixedCost, pricePerUnit, variableCostPerUnit)\`
  → \`break even(10000, 50, 30)\` → 500
- Cash runway in months: \`runway(cash, monthlyBurn)\`
  → \`runway(100000, 8000)\` → 12.5
- Years to double (Rule of 72): \`doubling time(rate)\`
  → \`doubling time(8%)\` → 9

### Consumer

- Tip amount: \`tip(bill, rate)\` → \`tip(80, 18%)\` → 14.4
- Bill including tip: \`tip total(bill, rate)\` → \`tip total(80, 18%)\` → 94.4
- Sale price after a discount: \`discount(price, rate)\` (alias \`sale price\`)
  → \`discount(200, 25%)\` → 150
- Tax on a price: \`sales tax(price, rate)\` → \`sales tax(100, 8%)\` → 8
- Price including tax: \`price with tax(price, rate)\`
  → \`price with tax(100, 8%)\` → 108

### Investment appraisal

- Net present value of a cashflow series at a discount rate:
  \`npv(rate, cf0, cf1, …)\` — the first cashflow is at t = 0
  → \`npv(10%, -1000, 500, 500, 500)\` → 243.426
- Internal rate of return (the rate where NPV = 0), as a percentage:
  \`irr(cf0, cf1, …)\` → \`irr(-1000, 500, 500, 500)\` → 23.3752. Needs a sign
  change (at least one negative and one positive cashflow).
- Straight-line depreciation per year: \`depreciation(cost, salvage, life)\`
  → \`depreciation(10000, 1000, 5)\` → 1,800

### Examples

User: I deposit 10,000 at 5% for 2 years simple interest — how much interest?
Expression: \`simple interest(10000, 5%, 2 years)\` → 1,000

User: what does $500k at 6.5% over 30 years cost per month?
Expression: \`emi(500000, 6.5%, 30 years)\` → 3,160.3401

User: my SaaS has $2M in the bank and burns 150k/month — how long do I have?
Expression: \`runway(2000000, 150000)\` → 13.3333 (months)

User: revenue grew from 50k to 75k over 5 years, what's the CAGR?
Expression: \`cagr(50000, 75000, 5 years)\` → 8.4472 (i.e. 8.4472%)

### Common mistakes

Incorrect: \`simple interest(10000, 0.05, 2 years)\` (expecting a 5% rate)
Result: a tiny number — \`0.05\` is read as **0.05%**, not 5%.
Correct: \`simple interest(10000, 5%, 2 years)\` or \`simple interest(10000, 5, 2 years)\`.
Why: rates are percentages. Write \`5\` or \`5%\`, never the decimal fraction.

Incorrect: \`rule of 72(8%)\`
Result: errors — the \`72\` lexes as its own number, so the name doesn't resolve.
Correct: \`doubling time(8%)\` → 9
Why: function names can't contain digits. \`doubling time\` is the Rule-of-72 helper.

Incorrect: \`compound interest(1000, 10%, 5)\` and expecting monthly compounding
Result: 610.51 — with no frequency it compounds **annually** (default 1).
Correct: \`compound interest(1000, 10%, 5 years, 12)\` for monthly.

### Notes

- A multi-part term like \`30 years 12 months\` is fine — it is added up first
  (31 years) and then used.
- \`simple interest\`, \`compound interest\`, \`future value\`, \`present value\`,
  \`emi\`, \`loan interest\`, and the annuities return an **amount of money**;
  \`cagr\`, \`roi\`, \`apy\`, \`profit margin\`, \`markup\` return a **percentage
  value**; \`break even\` returns **units** and \`runway\` / \`doubling time\`
  return a count of **months / years**.
- To get the total of principal **plus** simple interest, add them:
  \`10000 + simple interest(10000, 5%, 2 years)\` → 11,000.
`;

export default finance;
