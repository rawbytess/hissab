import spacetime, { Spacetime, TimeUnit } from "spacetime";
import chroma from "chroma-js";
import TokenBaseType, { TokenType } from "./token_basetypes";
import { UnhandledError, UserError } from "../exceptions";
import UnitTypes from "../types/unit_enum";
import tokenFactory from "./token_factory";
import { UnitsTypeIF } from "../types/unit_types";

export enum Direction {
  LEFT,
  RIGHT,
}

type Variables = {
  [variableName: string]: TokenType;
};

export type expressionUnit = UnitToken | undefined | null;
export type colorTypes = "RGB" | "RGBA" | "HEX" | "HSL" | "NAME" | "NUMBER";
class Token {
  protected _value: string;
  public originalValue: string;
  private _children: TokenType[];
  public variableName: string;

  protected constructor(value: string, originalValue: string) {
    this._value = value;
    this.originalValue = originalValue;
    this._children = [];
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

  public get children(): TokenType[] {
    return this._children;
  }

  getNumberType(): TokenBaseType {
    const left = this._children[Direction.LEFT];
    if (left instanceof NumberToken) return left.numbertype;
    const right = this._children[Direction.RIGHT];
    if (right instanceof NumberToken) return right.numbertype;
    throw new UnhandledError(0);
  }

  private isNumberToken = (obj: TokenType): obj is NumberToken =>
    obj instanceof NumberToken;

  getChildrenValues(): number[] {
    return this._children
      .filter(this.isNumberToken)
      .map((x: NumberToken) => x.toNumber());
  }

  setChild(direction: Direction, token: TokenType): void {
    if (direction === Direction.RIGHT) this.setRightChild(token);
    else this.setLeftChild(token);
  }

  getRightChild(): TokenType {
    return this._children[Direction.RIGHT];
  }

  getLeftChild(): TokenType {
    return this._children[Direction.LEFT];
  }

  setRightChild(token: TokenType): void {
    this._children[Direction.RIGHT] = token;
  }

  setLeftChild(token: TokenType): void {
    this._children[Direction.LEFT] = token;
  }

  insertChild(token: TokenType): void {
    this._children.push(token);
  }

  clearChildren(): void {
    this._children.length = 0;
  }
}

class NumberToken extends Token {
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
          // @ts-ignore
          localeOptions ?? {
            maximumFractionDigits: 10,
            notation: Math.abs(v) < 1e-9 ? "scientific" : "standard",
            useGrouping: false,
          },
        );
      } else {
        this._value = parseFloat(parseFloat(thisVal).toFixed(4)).toLocaleString(
          undefined,
          // @ts-ignore
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
        const res =
          (this.toNumber() * (this._unit?.factor || 1) +
            token.toNumber() * (token._unit?.factor || 1)) /
          (expUnit?.factor || 1);
        result = tokenFactory(this.formatString(res), this.numbertype);
      }
      if (expUnit && result instanceof NumberToken) result.unit = expUnit;
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
        const res =
          (this.toNumber() * (this._unit?.factor || 1) -
            token.toNumber() * (token._unit?.factor || 1)) /
          (expUnit?.factor || 1);
        result = tokenFactory(this.formatString(res), this.numbertype);
      }
      if (expUnit && result instanceof NumberToken) result.unit = expUnit;
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

  public get instanceName() {
    return "numberToken";
  }
}

class DateToken extends Token {
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
  setDate(date: number) {
    this.date = date;
    return this;
  }
  setMonth(month: number) {
    this.month = month;
    return this;
  }
  setYear(year: number) {
    this.year = year;
    return this;
  }
  setHour(hour: number) {
    this.hour = hour;
    return this;
  }
  setMinute(minute: number) {
    this.minute = minute;
    return this;
  }
  setSecond(second: number) {
    this.second = second;
    return this;
  }
  setMillisecond(millisecond: number) {
    this.millisecond = millisecond;
    return this;
  }
  setTimezone(iana: string, tz: string) {
    this.iana = iana;
    this.timezone = tz;
    return this;
  }
  setMeridian(meridian: string) {
    this.meridian = meridian;
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
    if (this.hour) this.timeformat = hourFormat;
    if (this.minute) this.timeformat = `${hourFormat}:{minute-pad}`;
    if (this.second)
      this.timeformat = `${hourFormat}:{minute-pad}:{second-pad}`;
    if (this.millisecond)
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

  public get instanceName() {
    return "dateToken";
  }
}

class ColorToken extends Token {
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

  getString(isPro: boolean) {
    if (!isPro) throw new UserError(9876);
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

  add(token: TokenType, expUnit: expressionUnit, isPro: boolean) {
    if (!isPro) throw new UserError(9876);
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

  subtract(token: TokenType, expUnit: expressionUnit, isPro: boolean) {
    if (!isPro) throw new UserError(9876);
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

  public get instanceName() {
    return "colorToken";
  }
}

class UnitToken extends Token {
  unitdata: UnitsTypeIF;
  prefix: UnitToken | null;
  factor: number;
  factors: {
    [key: string]: number;
  };
  date: DateToken | null;
  needsPro: boolean;

  constructor(
    value: string,
    originalValue: string,
    unitdata: UnitsTypeIF,
    needsPro = false,
  ) {
    super(value, originalValue);
    this.unitdata = unitdata;
    this.needsPro = needsPro;
    if (unitdata.type === UnitTypes.MONTH || unitdata.type === UnitTypes.AMPM)
      this.factor = 1;
    else if (unitdata.type === UnitTypes.POSTFIX)
      this.factor = unitdata.factor!;
    else this.factor = 1;
    this.factors = unitdata.factors || {};
    this.prefix = null;
    this.date = null;
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

  public get instanceName() {
    return "unitToken";
  }
}

class OperatorToken extends Token {
  precedence: number;
  operands: string[];
  func: any;
  isRaw: boolean;
  needsPro: boolean;

  constructor(
    value: string,
    originalValue: string,
    precedence: number,
    operands: string[],
    func: any,
    isRaw: boolean,
    needsPro: boolean,
  ) {
    super(value, originalValue);
    this.precedence = precedence;
    this.operands = operands;
    this.func = func;
    this.isRaw = isRaw;
    this.needsPro = needsPro;
  }

  public get instanceName() {
    return "operatorToken";
  }
}

class ControllerToken extends Token {
  basetype: string;

  constructor(value: string, originalValue: string, basetype: string) {
    super(value, originalValue);
    this.basetype = basetype;
  }

  public get instanceName() {
    return "controllerToken";
  }
}

class FunctionToken extends Token {
  func: () => void;
  isRaw: boolean;
  needsPro: boolean;

  constructor(
    value: string,
    originalValue: string,
    func: () => void,
    isRaw: boolean,
    needsPro: boolean,
  ) {
    super(value, originalValue);
    this.func = func;
    this.isRaw = isRaw;
    this.needsPro = needsPro;
  }

  public get instanceName() {
    return "functionToken";
  }
}

class StringToken extends Token {
  constructor(value: string, originalValue: string) {
    super(value, originalValue);
  }

  isOperand() {
    return true;
  }

  public get instanceName() {
    return "stringToken";
  }
}

class ResultToken extends Token {
  constructor(value: string, originalValue: string) {
    super(value, originalValue);
  }

  isOperand() {
    return false;
  }
  getString() {
    return this._value.trim();
  }
  public get instanceName() {
    return "resultToken";
  }
}

class VariableNameToken extends Token {
  constructor(value: string, originalValue: string) {
    super(value, originalValue);
  }
  isOperand() {
    return false;
  }

  public get instanceName() {
    return "VariableNameToken";
  }
}

class VariableToken extends Token {
  valueToken: TokenType;

  constructor(value: string, originalValue: string, valueToken: TokenType) {
    super(value, originalValue);
    this.valueToken = valueToken;
  }

  isOperand() {
    return true;
  }

  public get instanceName() {
    return "variableToken";
  }
}

class UndefinedToken extends Token {
  constructor(value: string, originalValue: string) {
    super(value, originalValue);
  }

  public get instanceName() {
    return "undefinedToken";
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

export {
  Token,
  NumberToken,
  DateToken,
  ColorToken,
  UnitToken,
  FunctionToken,
  OperatorToken,
  ControllerToken,
  StringToken,
  VariableToken,
  UndefinedToken,
  VariableNameToken,
  ResultToken,
  isMultiSymbol,
};
export type { Variables };
