import chroma from "chroma-js";
import spacetime, { type Spacetime } from "spacetime";
import {
  type CoordSystem,
  combine,
  convertCoords,
  formatCoords,
  fromCartesian,
  magnitude,
  resolveTarget,
  toCartesian,
} from "../coordinates";
import { beyondFloatDisplay, formatExactInteger, isSafe } from "../exact";
import { UnhandledError, UserError } from "../exceptions";
// Type-only imports — erased at compile time, so they don't add runtime edges
// to the module graph (function.ts/operator_types.ts import values from this
// file; a value import back would create a real cycle).
import type { FunctionDef } from "../function";
import * as ip from "../ip";
import {
  formatMatrix,
  type Mat,
  add as matAdd,
  sub as matSub,
  scalarOp,
} from "../matrix";
import { type Cx, cxAdd, cxString, cxSub } from "../symbolic/complex";
import type { Expr } from "../symbolic/expr";
import { exprToString } from "../symbolic/render";
import type {
  Associativity,
  ControllerKind,
  OperatorDef,
} from "../types/operator_types";
import UnitTypes from "../types/unit_enum";
import {
  baseSiFactor,
  type DimensionVector,
  dimEquals,
  dimIsEmpty,
  dimOfUnitData,
  linearFactor,
  type UnitsTypeIF,
} from "../types/unit_types";
import TokenBaseType, { type TokenType } from "./token_basetypes";
import tokenFactory from "./token_factory";

export enum Direction {
  LEFT,
  RIGHT,
}

type Variables = {
  [variableName: string]: TokenType;
};

export type expressionUnit = UnitToken | undefined | null;
export type colorTypes = "RGB" | "RGBA" | "HEX" | "HSL" | "NAME" | "NUMBER";

// Tokens that hold child slots (OperatorToken binary L/R, FunctionToken
// var-arg args[]). The parser walks the right spine of operator chains and
// pushes args into function tokens; only these two kinds participate.
export type HasChildren = OperatorToken | FunctionToken;

class Token {
  protected _value: string;
  public originalValue: string;
  public variableName: string;
  // Stable token category used for syntax highlighting. A string literal
  // (unlike `constructor.name`) survives JS minification. Each subclass
  // overrides it; the base default covers UndefinedToken.
  public kind: string = "undefinedToken";

  protected constructor(value: string, originalValue: string) {
    this._value = value;
    this.originalValue = originalValue;
    this.variableName = "";
  }

  isNumber(): boolean {
    return false;
  }

  isOperand(): boolean {
    return false;
  }

  public get value(): string {
    return this._value;
  }

  public set value(value: string) {
    this._value = value;
  }

  // Shallow copy of the same class. A result held in `Variables` (a label,
  // `line<N>`, `prev`) is shared by every later line that references it, while
  // several parse paths mutate an operand in place (unary minus, postfix `k`,
  // unit alignment, date add/subtract) — so a reference must work on a copy.
  clone(): this {
    return Object.assign(Object.create(Object.getPrototypeOf(this)), this);
  }
}

function valuesOf(children: ReadonlyArray<TokenType>): number[] {
  return children
    .filter((x): x is NumberToken => x instanceof NumberToken)
    .map((x) => x.toNumber());
}

class NumberToken extends Token {
  kind = "numberToken";
  numbertype: TokenBaseType;
  private _unit: expressionUnit;
  percent: boolean;
  // Tags a dimensionless value in [0,1] as a probability. Lets `&`/`|`/`~`/`xor`
  // overload onto probability math (P(a) & P(b) → a·b) instead of integer
  // bitwise ops, the same way they overload onto IpToken. Set by P(...) and the
  // probability functions; propagated onto their results so chains keep working.
  probability = false;
  // `_value` holds an exact integer — a written-out literal or the result of
  // exact integer arithmetic — even past 2^53, where a float would round. Any
  // other write to `value` clears it (see exactValue / src/exact.ts).
  private exactInt = false;

  constructor(
    value: string,
    originalValue: string,
    basetype: TokenBaseType,
    percent = false,
  ) {
    super(value, originalValue);
    this.numbertype = basetype;
    this._unit = undefined;
    this.percent = percent;
  }

  static fromExact(n: bigint): NumberToken {
    const token = new NumberToken(n.toString(), "", TokenBaseType.DECIMAL);
    token.exactInt = true;
    return token;
  }

  public override get value(): string {
    return this._value;
  }

  public override set value(value: string) {
    this._value = value;
    this.exactInt = false;
  }

  // Flag a freshly lexed integer literal as exact.
  markExact(): this {
    if (/^-?\d+$/.test(this._value.replaceAll(",", ""))) this.exactInt = true;
    return this;
  }

  // The value as an exact integer, or null when it is not one: a non-integer,
  // a percent/probability, another number base, or a float result past 2^53
  // (whose digits are already rounded). Units are the caller's concern.
  exactValue(): bigint | null {
    if (this.percent || this.probability) return null;
    if (this.numbertype !== TokenBaseType.DECIMAL) return null;
    const digits = this._value.replaceAll(",", "");
    if (!/^-?\d+$/.test(digits)) return null;
    const n = BigInt(digits);
    return this.exactInt || isSafe(n) ? n : null;
  }

  // Both operands as exact integers when `this op other` can stay exact:
  // plain numbers (no unit on either side or in the expression).
  exactPair(
    other: NumberToken,
    expUnit?: expressionUnit,
  ): [bigint, bigint] | null {
    if (this._unit || other._unit || expUnit) return null;
    const a = this.exactValue();
    const b = other.exactValue();
    return a !== null && b !== null ? [a, b] : null;
  }

  negate(): this {
    const exact = this.exactValue();
    if (exact !== null) {
      this._value = (-exact).toString();
      this.exactInt = true;
    } else this.value = (this.toNumber() * -1).toString();
    return this;
  }

  isNumber() {
    return true;
  }

  isOperand() {
    return true;
  }

  toNumber(): number {
    this._value = this._value.replaceAll(",", "");
    let val = this._value;
    if (
      this._value.startsWith("0b") ||
      this._value.startsWith("0x") ||
      this._value.startsWith("0o") ||
      this._value.startsWith("0B") ||
      this._value.startsWith("0X") ||
      this._value.startsWith("0O")
    ) {
      val = this._value.substring(2);
      return parseInt(val, this.numbertype);
    }

    return parseFloat(val);
  }

  formatString(number: number, numbertype = this.numbertype): string {
    if (numbertype === TokenBaseType.BINARY)
      return `0B${number.toString(numbertype)}`;
    if (numbertype === TokenBaseType.OCTAL)
      return `0O${number.toString(numbertype)}`;
    if (numbertype === TokenBaseType.HEX)
      return `0X${number.toString(numbertype)}`;
    return number.toString();
  }

  getString() {
    const display = this.formatValue();
    let stringValue = "";
    if (display) stringValue = `${display} `;
    if (this._unit?.unitdata.type === UnitTypes.CURRENCY)
      return stringValue.trim();
    if (this.unit) stringValue += this.unit.originalValue;
    return stringValue.trim();
  }

  // Display form of the value: 4 decimal places (3 significant figures below
  // 1), digit grouping, scientific notation past 1e15. Pure — `_value` keeps
  // full precision, so a later line referencing this result (`prev`, `line1`,
  // a label) computes on the exact number rather than the rounded display.
  formatValue(): string {
    const thisVal = this.toNumber().toString();
    if (this.numbertype === TokenBaseType.BINARY)
      return `0b${parseFloat(thisVal).toString(TokenBaseType.BINARY)}`;
    if (this.numbertype === TokenBaseType.OCTAL)
      return `0o${parseFloat(thisVal).toString(TokenBaseType.OCTAL)}`;
    if (this.numbertype === TokenBaseType.HEX)
      return `0x${parseFloat(thisVal).toString(TokenBaseType.HEX)}`;
    const v = this.toNumber();
    const exact = this.exactValue();
    const isCurrency = this._unit?.unitdata.type === UnitTypes.CURRENCY;
    if (exact !== null && !isCurrency && beyondFloatDisplay(exact))
      return formatExactInteger(exact);
    let localeOptions: Intl.NumberFormatOptions | null = null;
    if (isCurrency && this._unit) {
      localeOptions = {
        style: "currency",
        currency: this._unit.value,
      };
    }
    if (Math.abs(v) < 1) {
      return parseFloat(parseFloat(thisVal).toPrecision(3)).toLocaleString(
        undefined,
        localeOptions ?? {
          maximumFractionDigits: 10,
          notation: Math.abs(v) < 1e-9 ? "scientific" : "standard",
          useGrouping: false,
        },
      );
    }
    return parseFloat(parseFloat(thisVal).toFixed(4)).toLocaleString(
      undefined,
      localeOptions ?? {
        maximumFractionDigits: 10,
        notation: Math.abs(v) > 1e15 ? "scientific" : "standard",
        useGrouping: true,
      },
    );
  }

  add(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof ComplexToken) {
      return new ComplexToken(this.toNumber() + token.re, token.im);
    }
    if (token instanceof MatrixToken) {
      // scalar + M → broadcast (add the scalar to every entry).
      return new MatrixToken(
        scalarOp(token.data, this.toNumber(), (x, k) => k + x),
      );
    }
    if (token instanceof NumberToken) {
      let result: TokenType | null;
      if (this.percent && !token.percent) {
        result = tokenFactory(
          this.formatString(
            this.toNumber() * token.toNumber() + token.toNumber(),
          ),
          this.numbertype,
        );
      } else if (!this.percent && token.percent) {
        result = tokenFactory(
          this.formatString(
            this.toNumber() * token.toNumber() + this.toNumber(),
          ),
          this.numbertype,
        );
      } else {
        if (this._unit && token._unit) {
          if (!dimEquals(this._unit.dim, token._unit.dim))
            throw new UserError(8651);
        }
        // Use UnitToken.factor (which already encodes the prefix multiplier)
        // rather than siFactor here. Eager conversion in the parser brings
        // cross-prefix operands to the same factor scale, so this stays
        // precision-faithful to the legacy formula. siFactor enters only
        // during compound composition (`*`, `/`, `^`).
        const exact = this.exactPair(token, expUnit);
        const aF = this._unit?.factor ?? 1;
        const bF = token._unit?.factor ?? 1;
        const eF = expUnit?.factor ?? aF;
        const res = (this.toNumber() * aF + token.toNumber() * bF) / eF;
        result = exact
          ? NumberToken.fromExact(exact[0] + exact[1])
          : tokenFactory(this.formatString(res), this.numbertype);
      }
      if (expUnit && result instanceof NumberToken) result.unit = expUnit;
      else if (!expUnit && this._unit && result instanceof NumberToken)
        result.unit = this._unit;
      return result;
    }
    if (token instanceof DateToken) {
      if (this.unit === null || this.unit?.unitdata.type !== UnitTypes.TIME)
        throw new UnhandledError(9028);
      return token.shift(this, 1);
    }
    throw new UserError(8645);
  }

  subtract(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof ComplexToken) {
      return new ComplexToken(this.toNumber() - token.re, -token.im);
    }
    if (token instanceof MatrixToken) {
      // scalar − M → broadcast (subtract every entry from the scalar).
      return new MatrixToken(
        scalarOp(token.data, this.toNumber(), (x, k) => k - x),
      );
    }
    if (token instanceof NumberToken) {
      let result: TokenType | null;
      if (this.percent && !token.percent) {
        result = tokenFactory(
          this.formatString(
            this.toNumber() * token.toNumber() - token.toNumber(),
          ),
          this.numbertype,
        );
      } else if (!this.percent && token.percent) {
        result = tokenFactory(
          this.formatString(
            this.toNumber() - this.toNumber() * token.toNumber(),
          ),
          this.numbertype,
        );
      } else {
        if (this._unit && token._unit) {
          if (!dimEquals(this._unit.dim, token._unit.dim))
            throw new UserError(8651);
        }
        const exact = this.exactPair(token, expUnit);
        const aF = this._unit?.factor ?? 1;
        const bF = token._unit?.factor ?? 1;
        const eF = expUnit?.factor ?? aF;
        const res = (this.toNumber() * aF - token.toNumber() * bF) / eF;
        result = exact
          ? NumberToken.fromExact(exact[0] - exact[1])
          : tokenFactory(this.formatString(res), this.numbertype);
      }
      if (expUnit && result instanceof NumberToken) result.unit = expUnit;
      else if (!expUnit && this._unit && result instanceof NumberToken)
        result.unit = this._unit;
      return result;
    }
    if (token instanceof DateToken) {
      if (this.unit === null || this.unit?.unitdata.type !== UnitTypes.TIME)
        throw new UnhandledError(9029);
      return token.shift(this, -1);
    }
    throw new UserError(543);
  }

  public get unit(): expressionUnit {
    if (this._unit instanceof UnitToken) return this._unit;
    return null;
  }

  public set unit(unit: expressionUnit) {
    this._unit = unit;
  }
}

type DateFields = {
  date: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  iana: string;
  timezone: string;
  meridian: string;
};

// Duration units that step the calendar rather than a fixed number of seconds
// (a month or year has no fixed length). Hour and below are always elapsed time.
const CALENDAR_STEPS: Record<string, { unit: "month" | "day"; per: number }> = {
  day: { unit: "day", per: 1 },
  week: { unit: "day", per: 7 },
  fortnight: { unit: "day", per: 14 },
  month: { unit: "month", per: 1 },
  year: { unit: "month", per: 12 },
  decade: { unit: "month", per: 120 },
  century: { unit: "month", per: 1200 },
  millennium: { unit: "month", per: 12000 },
};

class DateToken extends Token {
  kind = "dateToken";
  timeformat: string;
  dateformat: string;
  spacetime: Spacetime | null;
  date: number;
  month: number;
  year: number;
  hour: number;
  minute: number;
  second: number;
  millisecond: number;
  iana: string;
  timezone: string;
  meridian: string;

  constructor(
    value: string,
    originalValue: string,
    dateformat = "",
    timeformat = "",
  ) {
    super(value, originalValue);
    this.spacetime = null;
    this.timeformat = timeformat;
    this.dateformat = dateformat;
    this.date = 0;
    this.month = 0;
    this.year = 0;
    this.hour = 0;
    this.minute = 0;
    this.second = 0;
    this.millisecond = 0;
    this.iana = Intl.DateTimeFormat().resolvedOptions().timeZone;
    this.timezone = "";
    this.meridian = "";
  }
  set(fields: Partial<DateFields>) {
    if (fields.date !== undefined) this.date = fields.date;
    if (fields.month !== undefined) this.month = fields.month;
    if (fields.year !== undefined) this.year = fields.year;
    if (fields.hour !== undefined) this.hour = fields.hour;
    if (fields.minute !== undefined) this.minute = fields.minute;
    if (fields.second !== undefined) this.second = fields.second;
    if (fields.millisecond !== undefined) this.millisecond = fields.millisecond;
    if (fields.iana !== undefined) this.iana = fields.iana;
    if (fields.timezone !== undefined) this.timezone = fields.timezone;
    if (fields.meridian !== undefined) this.meridian = fields.meridian;
    return this;
  }
  setObject(dtObj: Spacetime | null = null) {
    if (dtObj) {
      this.spacetime = dtObj;
      return this;
    }
    const now = spacetime("", this.iana);
    this.spacetime = now
      .year(this.calendarYear(now.year()))
      .month(this.month - 1)
      .date(this.date)
      .hour(this.hour)
      .minute(this.minute)
      .second(this.second)
      .millisecond(this.millisecond)
      .ampm(this.meridian);
    return this;
  }
  // The year the underlying date is placed in. A calendar date written without
  // one (`25 dec`) means that day in the current year — `25 dec - today` is the
  // days until Christmas, not since year 0. `29 feb` rolls forward to the next
  // leap year rather than clamping to the 28th. Only the date is affected: the
  // `year` field stays 0, so the display still omits the year, and time-only
  // tokens (no day or month) keep their old placement.
  private calendarYear(currentYear: number): number {
    if (this.year || !(this.month || this.date)) return this.year;
    let year = currentYear;
    const isLeap = (y: number) =>
      (y % 4 === 0 && y % 100 !== 0) || y % 400 === 0;
    if (this.month === 2 && this.date === 29) while (!isLeap(year)) year++;
    return year;
  }
  isOperand() {
    return true;
  }
  appendOriginalValue(val: string) {
    this.originalValue += ` ${val}`;
    return this;
  }
  setTimeFormat() {
    this.timeformat = "";
    const hourFormat = this.hour && this.meridian ? "{hour}" : "{hour-24}";
    // `3 pm` reads fine alone; a bare 24-hour `15` does not, so it gets `:00`.
    if (this.hour || this.spacetime?.hour())
      this.timeformat = this.meridian
        ? hourFormat
        : `${hourFormat}:{minute-pad}`;
    if (this.minute || this.spacetime?.minute())
      this.timeformat = `${hourFormat}:{minute-pad}`;
    if (this.second || this.spacetime?.second())
      this.timeformat = `${hourFormat}:{minute-pad}:{second-pad}`;
    if (this.millisecond || this.spacetime?.millisecond())
      this.timeformat = `${hourFormat}:{minute-pad}:{second-pad}:{millisecond-pad}`;
    if (this.meridian) this.timeformat += " {ampm}";
  }

  setDateFormat() {
    this.dateformat = "";
    if (this.date) this.dateformat += "{date} ";
    if (this.year || this.month) this.dateformat += "{month-short} ";
    if (this.year) this.dateformat += "{year} ";
    if (this.date && this.month && this.year)
      this.dateformat = `{day-short} ${this.dateformat}`;
    this.dateformat = this.dateformat.trim();
  }

  formatResult() {
    if (!this.spacetime?.isValid()) throw new UserError(8750);
    let format = "";
    if (this.dateformat === "") this.setDateFormat();
    if (this.timeformat === "") this.setTimeFormat();
    if (this.dateformat) format += this.dateformat;
    if (format && this.timeformat) format += ", ";
    if (this.timeformat) format += this.timeformat;
    this._value = this.spacetime?.format(format) || "";
    if (
      this.iana &&
      this.iana !== Intl.DateTimeFormat().resolvedOptions().timeZone &&
      this.timezone
    )
      this._value += ` ${this.timezone}`;
    return this;
  }

  getString() {
    return this.formatResult()._value.trim();
  }

  // Move by a duration (a NumberToken with a TIME unit). Whole calendar units
  // step the wall clock — `1 jan + 1 month` is 1 Feb, and `+ 280 days` stays
  // at midnight across a DST change — while a fractional remainder and clock
  // units (hour and below) are exact elapsed time.
  shift(duration: NumberToken, sign: 1 | -1) {
    const unit = duration.unit;
    if (!unit || !this.spacetime) throw new UnhandledError(9034);
    const amount = sign * duration.toNumber() * (unit.prefix?.factor ?? 1);
    let st = this.spacetime;
    let seconds = amount * linearFactor(unit.value, "second");
    const calendar = CALENDAR_STEPS[unit.value];
    if (calendar) {
      const steps = amount * calendar.per;
      const whole = Math.trunc(steps);
      st = st.add(whole, calendar.unit);
      seconds = (steps - whole) * linearFactor(calendar.unit, "second");
    }
    if (seconds) st = st.add(Math.round(seconds * 1000), "millisecond");
    return this.setObject(st).formatResult();
  }

  add(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof NumberToken) {
      if (token.unit === null || token.unit?.unitdata.type !== UnitTypes.TIME)
        throw new UnhandledError(9030);
      return this.shift(token, 1);
    }
    throw new UserError(3421);
  }

  subtract(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof NumberToken) {
      if (token.unit === null || token.unit?.unitdata.type !== UnitTypes.TIME)
        throw new UnhandledError(9031);
      return this.shift(token, -1);
    }
    if (token instanceof DateToken) {
      // Same zone: wall-clock difference, so whole days stay whole across a
      // DST change (22 Sep → 25 Dec is 94 days, not 94 days 1 hour). Across
      // zones it is the real elapsed time.
      const wallClock = (st: Spacetime) => st.epoch + st.offset() * 60_000;
      const seconds =
        this.iana === token.iana
          ? (wallClock(this.spacetime!) - wallClock(token.spacetime!)) / 1000
          : token.spacetime!.diff(this.spacetime!, "seconds");
      const result = tokenFactory(
        Math.abs(seconds).toString(),
        TokenBaseType.DECIMAL,
      );
      if (result instanceof NumberToken) {
        result.unit = <UnitToken>tokenFactory("second", TokenBaseType.STRING);
        return result;
      }
    }
    throw new UserError(4326);
  }
}

class ColorToken extends Token {
  kind = "colorToken";
  color: string;
  unit: colorTypes;

  constructor(
    value: string,
    originalValue: string,
    color: string,
    unit: colorTypes,
  ) {
    super(value, originalValue);
    this.color = color;
    this.unit = unit;
  }
  isOperand() {
    return true;
  }

  getString() {
    if (!chroma.valid(this.color)) throw new UserError(9877);
    if (this.unit === "RGB") {
      const [red, green, blue] = chroma(this.color).rgb();
      return `rgb(${red}, ${green}, ${blue})`;
    }
    if (this.unit === "RGBA") {
      const [red, green, blue, alpha] = chroma(this.color).rgba();
      return `rgba(${red}, ${green}, ${blue}, ${alpha})`;
    }
    if (this.unit === "HEX") return chroma(this.color).hex();
    if (this.unit === "HSL") {
      const [hue, saturation, light] = chroma(this.color).hsl();
      return `hsl(${hue}, ${saturation}, ${light})`;
    }
    if (this.unit === "NAME") return chroma(this.color).name();
    if (this.unit === "NUMBER") return chroma(this.color).num().toString();

    return chroma(this.color).hex();
  }

  add(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof ColorToken) {
      const newColor = chroma.mix(this.color, token.color, 0.5, "rgb");
      return tokenFactory(newColor.hex(), TokenBaseType.COLOR);
    }
    if (token instanceof NumberToken) {
      const newColor = chroma(this.color).brighten(token.toNumber());
      return tokenFactory(newColor.hex(), TokenBaseType.COLOR);
    }
    throw new UserError(5376);
  }

  subtract(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof ColorToken) {
      const contrast = chroma.contrast(this.color, token.color);
      return tokenFactory(contrast.toString(), TokenBaseType.DECIMAL);
    }
    if (token instanceof NumberToken) {
      const newColor = chroma(this.color).darken(token.toNumber());
      return tokenFactory(newColor.hex(), TokenBaseType.COLOR);
    }
    throw new UserError(5376);
  }
}

// Output representation an IpToken renders as — the IP analogue of
// ColorToken.unit. DEFAULT/COMPRESSED give the canonical textual form
// (dotted-decimal v4, RFC 5952 v6); the rest are explicit `to <form>` targets.
export type ipFormat =
  | "DEFAULT"
  | "COMPRESSED"
  | "INTEGER"
  | "BINARY"
  | "HEX"
  | "EXPANDED"
  | "CIDR";

// IPv4/IPv6 address. `address` is the numeric value as a BigInt (32-bit for v4,
// 128-bit for v6); `prefix` is the CIDR length when written as `a.b.c.d/n`.
// All arithmetic/subnet math lives in ../ip.ts so v4 and v6 stay uniform.
class IpToken extends Token {
  kind = "ipToken";
  version: ip.IpVersion;
  address: bigint;
  prefix: number | null;
  unit: ipFormat;

  constructor(
    value: string,
    originalValue: string,
    version: ip.IpVersion,
    address: bigint,
    prefix: number | null = null,
    unit: ipFormat = "DEFAULT",
  ) {
    super(value, originalValue);
    this.version = version;
    this.address = address;
    this.prefix = prefix;
    this.unit = unit;
  }

  isOperand() {
    return true;
  }

  // Build a same-version sibling for a computed address (network, offset, …),
  // wrapping into range. Keeps operators/conversions/functions terse.
  withAddress(address: bigint, prefix: number | null = null): IpToken {
    const masked = address & ip.maxAddress(this.version);
    const str = masked.toString();
    return new IpToken(str, str, this.version, masked, prefix);
  }

  getString(): string {
    if (this.unit === "INTEGER") return this.address.toString();
    if (this.unit === "BINARY") return ip.toBinary(this.address, this.version);
    if (this.unit === "HEX") return ip.toHex(this.address, this.version);
    const base =
      this.unit === "EXPANDED"
        ? ip.toExpanded(this.address, this.version)
        : ip.toCanonical(this.address, this.version);
    // DEFAULT/COMPRESSED/CIDR/EXPANDED keep the CIDR suffix when present.
    if (this.prefix !== null) return `${base}/${this.prefix}`;
    return base;
  }

  add(token: TokenType, _expUnit: expressionUnit) {
    if (token instanceof NumberToken) {
      const next = this.address + BigInt(Math.trunc(token.toNumber()));
      if (next < 0n || next > ip.maxAddress(this.version))
        throw new UserError(7302);
      return this.withAddress(next, this.prefix);
    }
    throw new UserError(7301);
  }

  subtract(token: TokenType, _expUnit: expressionUnit) {
    // ip - ip → host-count distance (a plain number).
    if (token instanceof IpToken) {
      if (token.version !== this.version) throw new UserError(7304);
      const diff = this.address - token.address;
      return tokenFactory(
        (diff < 0n ? -diff : diff).toString(),
        TokenBaseType.DECIMAL,
      );
    }
    if (token instanceof NumberToken) {
      const next = this.address - BigInt(Math.trunc(token.toNumber()));
      if (next < 0n || next > ip.maxAddress(this.version))
        throw new UserError(7302);
      return this.withAddress(next, this.prefix);
    }
    throw new UserError(7303);
  }
}

// A boolean result (`true` / `false`). The engine had no boolean type; this is
// produced by predicate functions (`contains`, `isprivate`, …) and is meant to
// be reused by future predicates. It's a terminal result token — never lexed
// from input in v1 — so it only needs to render and be accepted by doParse.
class BooleanToken extends Token {
  kind = "booleanToken";
  bool: boolean;

  constructor(bool: boolean, originalValue = bool.toString()) {
    super(bool.toString(), originalValue);
    this.bool = bool;
  }

  isOperand() {
    return true;
  }

  getString(): string {
    return this.bool ? "true" : "false";
  }
}

// A reduced-fraction result (`3/4`, `5/2`, `2 1/2`). Like BooleanToken this is a
// terminal result token — never lexed from input — produced by `fraction` /
// `mixed fraction`. `numerator`/`denominator` are already reduced (gcd 1, so a
// denominator of 1 means the value is a whole number). `mixed` renders an
// improper fraction as a whole part plus a proper remainder.
class FractionToken extends Token {
  kind = "fractionToken";
  numerator: number;
  denominator: number;
  mixed: boolean;

  constructor(numerator: number, denominator: number, mixed = false) {
    super(`${numerator}/${denominator}`, `${numerator}/${denominator}`);
    this.numerator = numerator;
    this.denominator = denominator;
    this.mixed = mixed;
  }

  isOperand() {
    return true;
  }

  getString(): string {
    if (this.denominator === 1) return this.numerator.toString();
    if (this.mixed && Math.abs(this.numerator) > this.denominator) {
      const whole = Math.trunc(this.numerator / this.denominator);
      const remainder = Math.abs(this.numerator) % this.denominator;
      if (remainder === 0) return whole.toString();
      return `${whole} ${remainder}/${this.denominator}`;
    }
    return `${this.numerator}/${this.denominator}`;
  }
}

// An ordered list of numbers (`1, 2, 3, 4, 6, 12`). Terminal result token
// produced by `factors`; renders as a comma-separated list.
class ListToken extends Token {
  kind = "listToken";
  values: number[];

  constructor(values: number[]) {
    super(values.join(", "), values.join(", "));
    this.values = values;
  }

  isOperand() {
    return true;
  }

  getString(): string {
    return this.values.join(", ");
  }
}

// A matrix of real numbers, lexed from `[1 2 3, 4 5 6]` (space = column,
// comma/semicolon = row). Like ComplexToken / PointToken it is a closed value
// domain that rides the eager solver — `+ - * / ^` carry matrix branches
// (operator_types.ts) and the matrix functions (function.ts) consume it. The
// numeric math lives in the pure `matrix/` module.
class MatrixToken extends Token {
  kind = "matrixToken";
  data: Mat;
  rows: number;
  cols: number;

  constructor(data: Mat, originalValue?: string) {
    const value = formatMatrix(data);
    super(value, originalValue ?? value);
    this.data = data;
    this.rows = data.length;
    this.cols = data.length === 0 ? 0 : data[0].length;
  }

  isOperand() {
    return true;
  }

  getString(): string {
    return formatMatrix(this.data);
  }

  // M + M → element-wise (shape-checked); M + scalar → broadcast over entries.
  add(token: TokenType, _expUnit: expressionUnit) {
    if (token instanceof MatrixToken)
      return new MatrixToken(matAdd(this.data, token.data));
    if (token instanceof NumberToken)
      return new MatrixToken(
        scalarOp(this.data, token.toNumber(), (x, k) => x + k),
      );
    throw new UserError(9130);
  }

  subtract(token: TokenType, _expUnit: expressionUnit) {
    if (token instanceof MatrixToken)
      return new MatrixToken(matSub(this.data, token.data));
    if (token instanceof NumberToken)
      return new MatrixToken(
        scalarOp(this.data, token.toNumber(), (x, k) => x - k),
      );
    throw new UserError(9131);
  }
}

// A complex number (`a + bi`). Complex numbers are a *closed numeric domain*, so
// unlike symbolic expressions they ride the engine's ordinary eager solve():
// `+ - * / ^` (operator_types.ts) carry complex branches. `i` lexes to
// ComplexToken(0, 1); arithmetic over real + complex promotes the real operand.
class ComplexToken extends Token {
  kind = "complexToken";
  re: number;
  im: number;

  constructor(re: number, im: number, originalValue?: string) {
    const value = cxString({ re, im });
    super(value, originalValue ?? value);
    this.re = re;
    this.im = im;
  }

  get cx(): Cx {
    return { re: this.re, im: this.im };
  }

  isOperand() {
    return true;
  }

  getString(): string {
    return cxString(this.cx);
  }

  add(token: TokenType, _expUnit: expressionUnit) {
    if (token instanceof ComplexToken) {
      const r = cxAdd(this.cx, token.cx);
      return new ComplexToken(r.re, r.im);
    }
    if (token instanceof NumberToken) {
      return new ComplexToken(this.re + token.toNumber(), this.im);
    }
    throw new UserError(8810);
  }

  subtract(token: TokenType, _expUnit: expressionUnit) {
    if (token instanceof ComplexToken) {
      const r = cxSub(this.cx, token.cx);
      return new ComplexToken(r.re, r.im);
    }
    if (token instanceof NumberToken) {
      return new ComplexToken(this.re - token.toNumber(), this.im);
    }
    throw new UserError(8811);
  }
}

// A geometric point / vector in a coordinate system. Like ComplexToken it is a
// closed value domain that rides the eager solver — `+ - * /` carry point
// branches and it never enters the symbolic path. Produced only by the
// coordinate functions / `to`-conversions, never lexed from raw input.
class PointToken extends Token {
  kind = "pointToken";
  coords: number[];
  system: CoordSystem;

  constructor(coords: number[], system: CoordSystem) {
    const value = formatCoords(coords, system);
    super(value, value);
    this.coords = coords;
    this.system = system;
  }

  isOperand() {
    return true;
  }

  getString(): string {
    return formatCoords(this.coords, this.system);
  }

  // Cartesian coords used for arithmetic. Minkowski keeps its full (t, …) tuple.
  cartesian(): number[] {
    if (this.system === "minkowski") return this.coords.slice();
    return toCartesian(this.coords, this.system);
  }

  // Scale about the origin, preserving the source system.
  scale(k: number): PointToken {
    if (this.system === "minkowski")
      return new PointToken(
        this.coords.map((v) => v * k),
        "minkowski",
      );
    const cart = toCartesian(this.coords, this.system).map((v) => v * k);
    return new PointToken(fromCartesian(cart, this.system), this.system);
  }

  // point ± point → component-wise point. Minkowski combines in place (and only
  // with another Minkowski point); spatial systems combine in cartesian.
  private combineWith(
    token: TokenType,
    f: (x: number, y: number) => number,
    code: number,
  ): PointToken {
    if (!(token instanceof PointToken)) throw new UserError(code);
    if (this.system === "minkowski" || token.system === "minkowski") {
      if (this.system !== token.system) throw new UserError(8220);
      return new PointToken(combine(this.coords, token.coords, f), "minkowski");
    }
    return new PointToken(
      combine(this.cartesian(), token.cartesian(), f),
      "cartesian",
    );
  }

  add(token: TokenType, _expUnit: expressionUnit) {
    return this.combineWith(token, (x, y) => x + y, 8221);
  }

  subtract(token: TokenType, _expUnit: expressionUnit) {
    return this.combineWith(token, (x, y) => x - y, 8222);
  }
}

// A leaf marker for a `to`-conversion target (`to polar`, `to distance`, …),
// created in NeedUnitState when a coordinate keyword follows `to`. It is neither
// an OperatorToken nor a FunctionToken, so solve() treats it as a leaf and never
// executes it; the `to` raw func reads it as params[1].
class CoordTargetToken extends Token {
  kind = "coordTargetToken";
  target: string;

  constructor(target: string) {
    super(target, target);
    this.target = target;
  }

  getString(): string {
    return this.target;
  }
}

// Apply a `to`-conversion to a source token. PointToken → another system, or a
// scalar magnitude for "distance". NumberToken → a 1-D point from the origin
// (`5 to vector` → point(5)).
function convertPointToken(source: TokenType, targetName: string): TokenType {
  const target = resolveTarget(targetName);
  if (source instanceof PointToken) {
    if (target === "distance") {
      const m = magnitude(source.coords, source.system).toString();
      return new NumberToken(m, m, TokenBaseType.DECIMAL);
    }
    return new PointToken(
      convertCoords(source.coords, source.system, target),
      target,
    );
  }
  if (source instanceof NumberToken && target === "cartesian")
    return new PointToken([source.toNumber()], "cartesian");
  throw new UserError(8218);
}

// A free algebraic variable (`x`, `y`, `z`). `isOperand()` so the parser state
// machine treats it like a number; recognised in token_factory from a curated
// symbol set. Its presence in a parse tree flips the expression into symbolic
// mode (see isSymbolic in parser.ts).
class SymbolToken extends Token {
  kind = "symbolToken";

  constructor(value: string, originalValue: string) {
    super(value, originalValue);
  }

  isOperand() {
    return true;
  }

  getString(): string {
    return this.value;
  }
}

// Terminal result token wrapping a symbolic Expr (the AST). Produced by the
// symbolic route in parse(); rendered via the symbolic renderer. Like
// BooleanToken/ListToken it is never lexed from input — it is a result carrier.
class ExprToken extends Token {
  kind = "exprToken";
  expr: Expr;
  // The pre-evaluation captured Expr (e.g. the `derivative` node before it was
  // computed). `expr` is the computed answer; `source` preserves the input
  // notation so the editor can keep rendering ∫ / d/dx inline. Undefined when
  // nothing was computed.
  source?: Expr;

  constructor(expr: Expr, source?: Expr) {
    const value = exprToString(expr);
    super(value, value);
    this.expr = expr;
    this.source = source;
  }

  isOperand() {
    return true;
  }

  getString(): string {
    return exprToString(this.expr);
  }
}

// One series to render in a graph. A `curve` is a single-variable symbolic
// expression the consumer samples (the app, via evalExpr) over a domain; a
// `complex` is a point/vector on the Argand plane; a `point` is a cartesian
// coordinate point/vector. `label` is a human-readable caption (the source
// expression, the a+bi string, the coords) computed by the producer.
export type PlotSeries =
  | { type: "curve"; expr: Expr; variable: string; label: string }
  | { type: "complex"; re: number; im: number; label: string }
  | { type: "point"; coords: number[]; label: string };

// Terminal result token produced by draw() / plot(). It carries the structured
// series to visualise; the engine itself does no rendering. Like ExprToken /
// ListToken it is never lexed — it is a result carrier read by the app, which
// owns the actual plotting (curves sampled with evalExpr).
class PlotToken extends Token {
  kind = "plotToken";
  series: PlotSeries[];

  constructor(series: PlotSeries[]) {
    const value = plotLabel(series);
    super(value, value);
    this.series = series;
  }

  isOperand() {
    return true;
  }

  getString(): string {
    return plotLabel(this.series);
  }
}

function plotLabel(series: PlotSeries[]): string {
  if (series.length === 0) return "📈 graph";
  return `📈 ${series.map((s) => s.label).join(", ")}`;
}

// One factor in a compound unit: a UnitToken raised to an integer exponent.
// `unit` is the source UnitToken (carrying value, prefix, factor, siFactor).
export type UnitAtom = {
  unit: UnitToken;
  exponent: number;
};

class UnitToken extends Token {
  kind = "unitToken";
  unitdata: UnitsTypeIF;
  prefix: UnitToken | null;
  factor: number;
  factors: {
    [key: string]: number;
  };
  date: DateToken | null;
  // Dimensional vector. For simple units derived from unitdata.dim or
  // unitdata.type; for compound units, computed from components.
  dim: DimensionVector;
  // Multiplier from this unit to its canonical SI product (the unit-system
  // canonical form of `dim`). Used for dim-based conversion and unit-aware
  // arithmetic.
  siFactor: number;
  // When non-null, this is a compound unit (`m/s`, `N*m^2/kg^2`, …). The
  // atoms describe its composition. A null `components` marks a single
  // named unit.
  components: UnitAtom[] | null;

  constructor(value: string, originalValue: string, unitdata: UnitsTypeIF) {
    super(value, originalValue);
    this.unitdata = unitdata;
    if (unitdata.type === UnitTypes.MONTH || unitdata.type === UnitTypes.AMPM)
      this.factor = 1;
    else if (unitdata.type === UnitTypes.POSTFIX)
      this.factor = unitdata.factor!;
    else this.factor = 1;
    this.factors = unitdata.factors || {};
    this.prefix = null;
    this.date = null;
    this.dim = dimOfUnitData(unitdata);
    this.siFactor = baseSiFactor(unitdata);
    this.components = null;
  }

  get isCompound(): boolean {
    if (this.components !== null) return true;
    // A "simple" UnitToken still counts as compound if its dim has multiple
    // nonzero axes (e.g. newton with dim={gram:1, meter:1, second:-2}).
    let nonzero = 0;
    for (const k of Object.keys(this.dim)) {
      if (this.dim[k] !== 0) nonzero += 1;
      if (nonzero > 1) return true;
    }
    return false;
  }

  subtract(token: TokenType, expUnit: expressionUnit) {
    if (!(token instanceof UnitToken)) throw new UserError(9899);
    if (
      this.unitdata.type !== UnitTypes.CITY ||
      token.unitdata.type !== UnitTypes.CITY
    )
      throw new UserError(9898);
    const format_options: Intl.DateTimeFormatOptions = {
      timeZone: "UTC",
      hourCycle: "h23",
      year: "numeric",
      month: "numeric",
      day: "numeric",
      hour: "numeric",
      minute: "numeric",
    };
    const locale = "en-US";
    const us_re = /(\d+).(\d+).(\d+),?\s+(\d+).(\d+)(.(\d+))?/;
    const utc_f = new Intl.DateTimeFormat(locale, format_options);

    function parseDate(date_str: string) {
      date_str = date_str.replace(/[\u200E\u200F]/g, "");
      const date_a = us_re.exec(date_str);
      return [].slice.call(us_re.exec(date_str), 1).map(Math.floor);
    }

    function diffMinutes(d1: number[], d2: number[]) {
      let day = d1[1] - d2[1];
      const hour = d1[3] - d2[3];
      const min = d1[4] - d2[4];

      if (day > 15) day = -1;
      if (day < -15) day = 1;

      return 60 * (24 * day + hour) + min;
    }

    function getTimezoneOffset(tz_str: string, date: Date) {
      format_options.timeZone = tz_str;

      const loc_f = new Intl.DateTimeFormat(locale, format_options);

      return diffMinutes(
        parseDate(utc_f.format(date)),
        parseDate(loc_f.format(date)),
      );
    }
    const offset1 = getTimezoneOffset(token.unitdata.timezone!, new Date());
    const offset2 = getTimezoneOffset(this.unitdata.timezone!, new Date());

    const minutes = Math.abs(offset1 - offset2);
    const numberToken = tokenFactory(
      minutes.toString(),
      TokenBaseType.DECIMAL,
    ) as NumberToken;
    numberToken.unit = tokenFactory(
      "minute",
      TokenBaseType.STRING,
    ) as UnitToken;
    return numberToken;
  }
}

export type OpShape = {
  prenumber: boolean;
  postnumber: boolean;
  prestring: boolean;
  postunit: boolean;
};

class OperatorToken extends Token {
  kind = "operatorToken";
  // The full table entry from Operators. Solve narrows on def.isRaw to pick
  // the calling convention; everything else (precedence, shape) is derived
  // here once at construction.
  readonly def: OperatorDef;
  precedence: number;
  shape: OpShape;
  left: TokenType | null;
  right: TokenType | null;
  // Variadic tail for operators like `to mile, yard`. Empty for normal
  // binary ops; only NeedUnitState's comma path pushes here.
  more: TokenType[];

  constructor(value: string, originalValue: string, def: OperatorDef) {
    super(value, originalValue);
    this.def = def;
    this.precedence = def.precedence;
    this.shape = {
      prenumber: def.operands.includes("prenumber"),
      postnumber: def.operands.includes("postnumber"),
      prestring: def.operands.includes("prestring"),
      postunit: def.operands.includes("postunit"),
    };
    this.left = null;
    this.right = null;
    this.more = [];
  }

  get isRaw(): boolean {
    return this.def.isRaw;
  }
  get associativity(): Associativity {
    return this.def.associativity ?? "left";
  }

  setChild(direction: Direction, token: TokenType): void {
    if (direction === Direction.RIGHT) this.right = token;
    else this.left = token;
  }
  // Fill left, then right, then variadic tail.
  insertChild(token: TokenType): void {
    if (this.left === null) this.left = token;
    else if (this.right === null) this.right = token;
    else this.more.push(token);
  }
  clearChildren(): void {
    this.left = null;
    this.right = null;
    this.more.length = 0;
  }
  // Preserve indexed slots: children[0] = left (may be undefined for unary
  // post-operators like trig and `~`), children[1] = right, children[2..] =
  // variadic tail. Several operator funcs destructure as `[_, rhs]` and
  // expect params[1] to be the right operand even when there's no left.
  get children(): TokenType[] {
    const out: TokenType[] = [];
    if (this.left !== null) out[0] = this.left;
    if (this.right !== null) out[1] = this.right;
    for (let i = 0; i < this.more.length; i++) out[2 + i] = this.more[i];
    return out;
  }
  getChildrenValues(): number[] {
    return valuesOf(this.children);
  }
  getNumberType(): TokenBaseType {
    if (this.left instanceof NumberToken) return this.left.numbertype;
    if (this.right instanceof NumberToken) return this.right.numbertype;
    throw new UnhandledError(9032);
  }
}

class ControllerToken extends Token {
  kind = "controllerToken";
  basetype: ControllerKind;

  constructor(value: string, originalValue: string, basetype: ControllerKind) {
    super(value, originalValue);
    this.basetype = basetype;
  }
}

class FunctionToken extends Token {
  kind = "functionToken";
  // The full table entry from Functions; solve narrows on def.isRaw.
  readonly def: FunctionDef;
  args: TokenType[];

  constructor(value: string, originalValue: string, def: FunctionDef) {
    super(value, originalValue);
    this.def = def;
    this.args = [];
  }

  get isRaw(): boolean {
    return this.def.isRaw;
  }

  insertChild(token: TokenType): void {
    this.args.push(token);
  }
  clearChildren(): void {
    this.args.length = 0;
  }
  get children(): TokenType[] {
    return this.args;
  }
  getChildrenValues(): number[] {
    return valuesOf(this.args);
  }
  getNumberType(): TokenBaseType {
    for (const a of this.args) {
      if (a instanceof NumberToken) return a.numbertype;
    }
    throw new UnhandledError(9033);
  }
}

class StringToken extends Token {
  kind = "stringToken";
  constructor(value: string, originalValue: string) {
    super(value, originalValue);
  }

  isOperand() {
    return true;
  }
}

class VariableNameToken extends Token {
  kind = "VariableNameToken";
  constructor(value: string, originalValue: string) {
    super(value, originalValue);
  }
  isOperand() {
    return false;
  }
}

class VariableToken extends Token {
  kind = "variableToken";
  valueToken: TokenType;

  constructor(value: string, originalValue: string, valueToken: TokenType) {
    super(value, originalValue);
    this.valueToken = valueToken;
  }

  isOperand() {
    return true;
  }
}

class UndefinedToken extends Token {
  constructor(value: string, originalValue: string) {
    super(value, originalValue);
  }
}

// A `@<base36>` seed literal (e.g. `@7f3a`), lexed only inside a function's
// argument list. It is editor-managed plumbing for the entropy-drawing
// functions (`random`, `uuid`): it pins their PRNG so the result stays stable
// across the app's evaluate-on-every-keystroke loop. It is NOT an operand —
// `isOperand()` stays false so it never triggers implicit-`*`/`+` juxtaposition —
// and it never reaches output; the impure functions read `.seed` off the
// trailing arg and drop it. See engine/src/random.ts.
class SeedToken extends Token {
  kind = "seedToken";
  seed: number;

  constructor(value: string, originalValue: string) {
    super(value, originalValue);
    const raw = value.replace(/^@/, "");
    const n = Number.parseInt(raw, 36);
    this.seed = Number.isNaN(n) ? 0 : n >>> 0;
  }

  getString(): string {
    return this.value;
  }
}

// A terminal string result (a UUID, and any future textual output). Like
// BooleanToken / ListToken it is produced only inside solve() and is never lexed
// from input, so it does not need the parser's operand-dispatch sites — only the
// doParse() result allow-list in index.ts. Distinct from StringToken, which is
// an *input* token filtered out before parse.
class TextToken extends Token {
  kind = "textToken";
  text: string;

  constructor(text: string, originalValue = text) {
    super(text, originalValue);
    this.text = text;
  }

  isOperand() {
    return true;
  }

  getString(): string {
    return this.text;
  }
}

export type { Variables };
export {
  BooleanToken,
  ColorToken,
  ComplexToken,
  ControllerToken,
  CoordTargetToken,
  convertPointToken,
  DateToken,
  ExprToken,
  FractionToken,
  FunctionToken,
  IpToken,
  ListToken,
  MatrixToken,
  NumberToken,
  OperatorToken,
  PlotToken,
  PointToken,
  SeedToken,
  StringToken,
  SymbolToken,
  TextToken,
  Token,
  UndefinedToken,
  UnitToken,
  VariableNameToken,
  VariableToken,
};
