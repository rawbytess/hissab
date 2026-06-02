import spacetime, { type Spacetime } from "spacetime";

type DateTimeEntry = {
  func: () => Spacetime;
  description: string;
  timeformat: string;
  dateformat: string;
};

type dtType = { [dt: string]: DateTimeEntry };

const DATE_FORMAT = "{date} {month-short} {year}";
const RELATIVE_UNITS = [
  "week",
  "month",
  "quarter",
  "year",
  "decade",
  "century",
] as const;

const DateTimeOperands: dtType = {
  now: {
    func: () => spacetime.now(),
    timeformat: "{hour-24}:{minute-pad}:{second-pad}",
    dateformat: DATE_FORMAT,
    description: "Get current Date and Time",
  },
  today: {
    func: () => spacetime.today(),
    timeformat: "",
    dateformat: DATE_FORMAT,
    description: "Get today's date",
  },
  tomorrow: {
    func: () => spacetime.tomorrow(),
    timeformat: "",
    dateformat: DATE_FORMAT,
    description: "Get tomorrow's date",
  },
  yesterday: {
    func: () => spacetime.yesterday(),
    timeformat: "",
    dateformat: DATE_FORMAT,
    description: "Get Yesterday's date",
  },
};

function relativeEntry(
  direction: "last" | "next",
  unit: (typeof RELATIVE_UNITS)[number],
): DateTimeEntry {
  const verb = direction === "last" ? "Previous" : "Next";
  return {
    func: () =>
      direction === "last"
        ? spacetime.now().subtract(1, unit)
        : spacetime.now().add(1, unit),
    timeformat: "",
    dateformat: DATE_FORMAT,
    description: `Get the date one ${unit} ${direction === "last" ? "ago" : "ahead"} (${verb} ${unit})`,
  };
}

for (const dir of ["last", "next"] as const) {
  for (const unit of RELATIVE_UNITS) {
    DateTimeOperands[`${dir} ${unit}`] = relativeEntry(dir, unit);
  }
}

export default DateTimeOperands;
