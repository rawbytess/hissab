export const date_time = `
## Date and time

### Date formats

Prefer written-out months — they are unambiguous:

- \`dd mmm yyyy\`: \`7 aug 2020\`
- \`mmm dd yyyy\`: \`aug 7 2020\`
- \`yyyy mmm dd\`: \`2020 aug 7\`

Numeric dot-separated dates also parse, but **first field is the month**
(mm.dd.yyyy) whenever it could be one:

- \`08.07.2020\` → \`Fri 7 Aug 2020\` (month 08, day 07)
- \`07.08.2020\` → \`Wed 8 Jul 2020\` (month 07, day 08 — *not* 7 August)
- \`2020.08.07\` → \`Fri 7 Aug 2020\` (yyyy.mm.dd)
- \`25.08.2020\` → \`Tue 25 Aug 2020\` (when the first field can't be a month, it's the day)

### Time formats

- \`hh:mm:ss:ms\`: \`3:30:15:500\`
- \`hh:mm am/pm\`: \`3:30 pm\`
- \`hh:mm\` (24-hour): \`13:30\`
- Date with time (time always **after** date): \`2020.08.07 3:30 pm\`
- Time with timezone (IANA name or common abbreviation): \`3:30 pm pst\`

### Operations

- Add a duration: \`2020.08.07 + 5 days\` → \`Wed 12 Aug 2020\`
- Subtract a duration: \`2020.08.07 - 5 days\`
- Duration between two dates: \`2020.08.07 - 9 sep 2020 to minutes\` → \`47,520 minutes\`
- Age calculation: \`today - 1 feb 1990 to years\`
- Date/time to unix epoch (**seconds**): \`12 mar 2020 utc to epoch\` → \`1,583,971,200 seconds\`
- Date/time to unix timestamp (**milliseconds**): \`12 mar 2020 utc to timestamp\` → \`1,583,971,200,000 milliseconds\`
- Unix time to date: \`1646480610 seconds to human date\` → \`Sat 5 Mar 2022, 6:43:30\`
- Current time in a timezone: \`now in beijing\`
- Convert a time across timezones: \`3:42 am pst in beijing\`

### Keywords

- \`now\` — current date and time
- \`today\` — current date
- \`tomorrow\` — tomorrow's date
- \`yesterday\` — yesterday's date

### Duration / rate units

\`secondly\`, \`minutely\`, \`hourly\`, \`daily\`, \`weekly\`, \`monthly\`,
\`quarterly\`, \`yearly\` — convert between them like any other unit family.

### Examples

User: 5 days after Aug 7th 2020
Expression: \`2020.08.07 + 5 days\` → \`Wed 12 Aug 2020\`

User: how many minutes between 2020.08.07 and 9 sep 2020
Expression: \`2020.08.07 - 9 sep 2020 to minutes\` → \`47,520 minutes\`

User: I was born 1 feb 1990, how old am I?
Expression: \`today - 1 feb 1990 to years\`

User: unix epoch (seconds) for 12 march 2020 UTC
Expression: \`12 mar 2020 utc to epoch\` → \`1,583,971,200 seconds\`

### Common mistakes

Incorrect: \`2020-08-07\`, \`08/07/2020\`
Result: \`2,005\`, \`0.000566\` (no error — \`-\` subtracts, \`/\` divides)
Correct: \`2020.08.07\` or \`7 aug 2020\`
Why: dates use \`.\` separators or written months. Dashes/slashes are arithmetic
and silently return a wrong number.

Incorrect: \`3:30 pm 2020.08.07\`
Result: errors
Correct: \`2020.08.07 3:30 pm\` → \`Fri 7 Aug 2020, 3:30 pm\`
Why: the time must come **after** the date, never before it.

Incorrect: \`1646480610 to human date\`
Result: \`19 Jan 1970, …\` (a bare number is read as milliseconds)
Correct: \`1646480610 seconds to human date\` → \`Sat 5 Mar 2022, 6:43:30\`
Why: state the unit. \`to epoch\` yields seconds and \`to timestamp\` yields
milliseconds, but a bare number fed to \`human date\` is read as milliseconds —
so pass an explicit \`seconds\`.

Incorrect: \`07.08.2020\` meaning 7 August
Result: \`Wed 8 Jul 2020\` (read as month 07, day 08)
Correct: \`7 aug 2020\`
Why: numeric dot-dates treat the first field as the month when it could be one.
Use a written month to remove the ambiguity.
`;

export default date_time;
