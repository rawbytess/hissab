# Date & time

Hissab can parse dates, times, durations, timezones, and Unix epoch/timestamp
values.

## Date formats

**Written-out months are the safest.**

| Format | Pattern | Example |
| -------------- | ------------ | ------------ |
| Day month year | `dd mmm yyyy` | `7 aug 2020` |
| Month day year | `mmm dd yyyy` | `aug 7 2020` |
| Year month day | `yyyy mmm dd` | `2020 aug 7` |

Numeric dot-separated dates parse too. When the first field could be a month,
Hissab treats it as the **month**.

| Input | Means |
| ------------ | ---------------------------------------- |
| `08.07.2020` | August 7, 2020 |
| `07.08.2020` | July 8, 2020 |
| `2020.08.07` | August 7, 2020 |
| `25.08.2020` | August 25, 2020 (25 cannot be a month) |

```hissab
7 aug 2020
aug 7 2020
2020 aug 7
2020.08.07
```

## Time formats

| Format | Pattern | Example |
| ------------------ | ------------- | ------------------- |
| Hour:min:sec:ms | `hh:mm:ss:ms` | `3:30:15:500` |
| 12-hour clock | `hh:mm am/pm` | `3:30 pm` |
| 24-hour clock | `hh:mm` | `13:30` |
| Date with time | — | `2020.08.07 3:30 pm` |
| Time with timezone | — | `3:30 pm pst` |

```hissab
2020.08.07 3:30 pm
3:42 am pst in beijing
```

## Operations

```hissab
2020.08.07 + 5 days
2020.08.07 - 5 days
2020.08.07 - 9 sep 2020 to minutes
today - 1 feb 1990 to years
12 mar 2020 utc to epoch
12 mar 2020 utc to timestamp
1646480610 seconds to human date
now in beijing
```

## Keywords

| Keyword | Meaning |
| ----------- | ------------------------ |
| `now` | current date and time |
| `today` | current date |
| `tomorrow` | tomorrow's date |
| `yesterday` | yesterday's date |

## Duration and rate units

`secondly`, `minutely`, `hourly`, `daily`, `weekly`, `monthly`, `quarterly`,
and `yearly` convert like a unit family.

```hissab
250 weekly to yearly
0.21 hourly to monthly
```

## Common mistakes

:::caution

- **`2020-08-07`** and **`08/07/2020`** are arithmetic, not dates. Use
  `2020.08.07` or `7 aug 2020`.
- **`3:30 pm 2020.08.07`** is invalid — the time must come *after* the date.
- **`1646480610 to human date`** treats the bare number as milliseconds. Use
  `1646480610 seconds to human date`.

:::

```hissab
2020.08.07
1646480610 seconds to human date
```
