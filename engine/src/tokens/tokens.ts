import chroma from "chroma-js";
import spacetime, { type Spacetime, type TimeUnit } from "spacetime";
import { UnhandledError, UserError } from "../exceptions";
import UnitTypes from "../types/unit_enum";
import {
  baseSiFactor,
  type DimensionVector,
  dimEquals,
  dimIsEmpty,
  dimOfUnitData,
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
    this.formatResult();
    let stringValue = "";
    if (this._value) stringValue = `${this._value} `;
    if (this._unit?.unitdata.type === UnitTypes.CURRENCY)
      return stringValue.trim();
    if (this.unit) stringValue += this.unit.originalValue;
    return stringValue.trim();
  }

  formatResult() {
    const thisVal = this.toNumber().toString();
    if (this.numbertype === TokenBaseType.BINARY)
      this._value = `0b${parseFloat(thisVal).toString(TokenBaseType.BINARY)}`;
    else if (this.numbertype === TokenBaseType.OCTAL)
      this._value = `0o${parseFloat(thisVal).toString(TokenBaseType.OCTAL)}`;
    else if (this.numbertype === TokenBaseType.HEX)
      this._value = `0x${parseFloat(thisVal).toString(TokenBaseType.HEX)}`;
    else {
      const v = this.toNumber();
      let localeOptions = null;
      if (this._unit?.unitdata.type === UnitTypes.CURRENCY) {
        localeOptions = {
          style: "currency",
          currency: this._unit.value,
        };
      }
      if (Math.abs(v) < 1) {
        this._value = parseFloat(
          parseFloat(thisVal).toPrecision(3),
        ).toLocaleString(
          undefined,
          // @ts-expect-error
          localeOptions ?? {
            maximumFractionDigits: 10,
            notation: Math.abs(v) < 1e-9 ? "scientific" : "standard",
            useGrouping: false,
          },
        );
      } else {
        this._value = parseFloat(parseFloat(thisVal).toFixed(4)).toLocaleString(
          undefined,
          // @ts-expect-error
          localeOptions ?? {
            maximumFractionDigits: 10,
            notation: Math.abs(v) > 1e15 ? "scientific" : "standard",
            useGrouping: true,
          },
        );
      }
    }
  }

  add(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof NumberToken) {
      let result;
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
        const aF = this._unit?.factor ?? 1;
        const bF = token._unit?.factor ?? 1;
        const eF = expUnit?.factor ?? aF;
        const res = (this.toNumber() * aF + token.toNumber() * bF) / eF;
        result = tokenFactory(this.formatString(res), this.numbertype);
      }
      if (expUnit && result instanceof NumberToken) result.unit = expUnit;
      else if (!expUnit && this._unit && result instanceof NumberToken)
        result.unit = this._unit;
      return result;
    }
    if (token instanceof DateToken) {
      if (this.unit === null || this.unit?.unitdata.type !== UnitTypes.TIME)
        throw new UnhandledError(0);
      return token
        .setObject(
          token.spacetime?.add(this.toNumber(), this.unit?.value as TimeUnit),
        )
        .formatResult();
    }
    throw new UserError(8645);
  }

  subtract(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof NumberToken) {
      let result;
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
        const aF = this._unit?.factor ?? 1;
        const bF = token._unit?.factor ?? 1;
        const eF = expUnit?.factor ?? aF;
        const res = (this.toNumber() * aF - token.toNumber() * bF) / eF;
        result = tokenFactory(this.formatString(res), this.numbertype);
      }
      if (expUnit && result instanceof NumberToken) result.unit = expUnit;
      else if (!expUnit && this._unit && result instanceof NumberToken)
        result.unit = this._unit;
      return result;
    }
    if (token instanceof DateToken) {
      if (this.unit === null || this.unit?.unitdata.type !== UnitTypes.TIME)
        throw new UnhandledError(0);
      return token
        .setObject(
          token.spacetime!.subtract(
            this.toNumber(),
            this.unit.value as TimeUnit,
          ),
        )
        .formatResult();
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
    this.spacetime = spacetime("", this.iana)
      .year(this.year)
      .month(this.month - 1)
      .date(this.date)
      .hour(this.hour)
      .minute(this.minute)
      .second(this.second)
      .millisecond(this.millisecond)
      .ampm(this.meridian);
    return this;
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
    if (this.hour || this.spacetime?.hour()) this.timeformat = hourFormat;
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

  add(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof NumberToken) {
      if (token.unit === null || token.unit?.unitdata.type !== UnitTypes.TIME)
        throw new UnhandledError(0);
      return this.setObject(
        this.spacetime?.add(token.toNumber(), token.unit?.value as TimeUnit),
      ).formatResult();
    }
    throw new UserError(3421);
  }

  subtract(token: TokenType, expUnit: expressionUnit) {
    if (token instanceof NumberToken) {
      if (token.unit === null || token.unit?.unitdata.type !== UnitTypes.TIME)
        throw new UnhandledError(0);
      return this.setObject(
        this.spacetime!.subtract(
          token.toNumber(),
          token.unit.value as TimeUnit,
        ),
      ).formatResult();
    }
    if (token instanceof DateToken) {
      const result = tokenFactory(
        Math.abs(token.spacetime!.diff(this.spacetime!, "seconds")).toString(),
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
  precedence: number;
  operands: string[];
  shape: OpShape;
  func: any;
  isRaw: boolean;
  left: TokenType | null;
  right: TokenType | null;
  // Variadic tail for operators like `to mile, yard`. Empty for normal
  // binary ops; only NeedUnitState's comma path pushes here.
  more: TokenType[];

  constructor(
    value: string,
    originalValue: string,
    precedence: number,
    operands: string[],
    func: any,
    isRaw: boolean,
  ) {
    super(value, originalValue);
    this.precedence = precedence;
    this.operands = operands;
    this.shape = {
      prenumber: operands.includes("prenumber"),
      postnumber: operands.includes("postnumber"),
      prestring: operands.includes("prestring"),
      postunit: operands.includes("postunit"),
    };
    this.func = func;
    this.isRaw = isRaw;
    this.left = null;
    this.right = null;
    this.more = [];
  }

  setChild(direction: Direction, token: TokenType): void {
    if (direction === Direction.RIGHT) this.right = token;
    else this.left = token;
  }
  setLeftChild(token: TokenType): void {
    this.left = token;
  }
  setRightChild(token: TokenType): void {
    this.right = token;
  }
  getLeftChild(): TokenType | null {
    return this.left;
  }
  getRightChild(): TokenType | null {
    return this.right;
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
    throw new UnhandledError(0);
  }
}

class ControllerToken extends Token {
  kind = "controllerToken";
  basetype: string;

  constructor(value: string, originalValue: string, basetype: string) {
    super(value, originalValue);
    this.basetype = basetype;
  }
}

class FunctionToken extends Token {
  kind = "functionToken";
  func: () => void;
  isRaw: boolean;
  args: TokenType[];

  constructor(
    value: string,
    originalValue: string,
    func: () => void,
    isRaw: boolean,
  ) {
    super(value, originalValue);
    this.func = func;
    this.isRaw = isRaw;
    this.args = [];
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
    throw new UnhandledError(0);
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

function isMultiSymbol(symbol: string) {
  const multisymbol = {
    "*": true,
    "**": true,
    ">": true,
    "<": true,
    ">>": true,
    "<<": true,
  };

  return symbol in multisymbol;
}

export type { Variables };
export {
  ColorToken,
  ControllerToken,
  DateToken,
  FunctionToken,
  isMultiSymbol,
  NumberToken,
  OperatorToken,
  StringToken,
  Token,
  UndefinedToken,
  UnitToken,
  VariableNameToken,
  VariableToken,
};
