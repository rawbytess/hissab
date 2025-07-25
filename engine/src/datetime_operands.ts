import spacetime, { type Spacetime } from "spacetime";

type dtType = {
  [dt: string]: {
    func: () => Spacetime;
    description: string;
    timeformat: string;
    dateformat: string;
  };
};

const DateTimeOperands: dtType = {
  now: {
    func: () => spacetime.now(),
    timeformat: "{hour-24}:{minute-pad}:{second-pad}",
    dateformat: "{date} {month-short} {year}",
    description: "Get current Date and Time",
  },
  today: {
    func: () => spacetime.today(),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get today's date",
  },
  tomorrow: {
    func: () => spacetime.tomorrow(),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get tomorrow's date",
  },
  yesterday: {
    func: () => spacetime.yesterday(),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "last week": {
    func: () => spacetime.now().subtract(1, "week"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "last month": {
    func: () => spacetime.now().subtract(1, "month"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "last quarter": {
    func: () => spacetime.now().subtract(1, "quarter"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "last year": {
    func: () => spacetime.now().subtract(1, "year"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "last decade": {
    func: () => spacetime.now().subtract(1, "decade"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "last century": {
    func: () => spacetime.now().subtract(1, "century"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "next week": {
    func: () => spacetime.now().add(1, "week"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "next month": {
    func: () => spacetime.now().add(1, "month"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "next quarter": {
    func: () => spacetime.now().add(1, "quarter"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "next year": {
    func: () => spacetime.now().add(1, "year"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "next decade": {
    func: () => spacetime.now().add(1, "decade"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
  "next century": {
    func: () => spacetime.now().add(1, "century"),
    timeformat: "",
    dateformat: "{date} {month-short} {year}",
    description: "Get Yesterday's date",
  },
};
export default DateTimeOperands;
