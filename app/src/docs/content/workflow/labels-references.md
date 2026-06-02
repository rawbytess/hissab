# Labels and references

Use **labels**, **`prev`**, **`line<N>`**, and **`total<N>`** to chain related
expressions when they are evaluated together.

## Labels

Assign a result to a label with `=`.

```hissab
monthly_expense = 1000 + 200 - 50
yearly_expense = monthly_expense monthly to yearly
```

Labels are available to later expressions in the same batch. A label **must
start with a letter or underscore** and may contain letters, digits, and
underscores. Labels are **case-sensitive**, so `total` and `Total` are different.

:::tip

`snake_case` is the recommended convention for label names.

:::

A label can hold any kind of result — a plain number, a value with units, or a
date or time — and you can keep operating on it on later lines.

```hissab
distance = 5 miles
distance to kilometers
```

## prev

**`prev`** refers to the immediately previous result.

```hissab
78 kilometers to miles
prev - 45 miles
```

Use a label when you need to refer farther back than one line.

## line<N> and l<N>

Each evaluated line is exposed by its **one-indexed line number**.

```hissab
100
200
line1 + line2
```

`l<N>` is a shorter alias.

```hissab
100
200
l1 + l2
```

## total<N>

**`total<N>`** is the running sum of all earlier expressions before line `N`.

```hissab
100
200
total3 + line1
```

In that example, `total3` is the sum of line 1 and line 2.

## Scope

Labels and numbered references live in the **current batch**. Separate app or
tool calls should define the labels they need. The CLI REPL keeps labels until
the REPL exits.

## Common mistakes

:::caution

- **Referencing a label before it is defined** is invalid — define first, use later.
- **`prev` on the first line** has no previous result to point at.
- If the previous expression **failed**, `prev` cannot produce a useful value on the next line.

:::
