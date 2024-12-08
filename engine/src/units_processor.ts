import { UserError } from "./exceptions";
import tokenFactory from "./tokens/token_factory";
import TokenBaseType from "./tokens/token_basetypes";
import { getRate } from "./utils";
import UnitTypes from "./types/unit_enum";
import {
  DateToken,
  ColorToken,
  expressionUnit,
  NumberToken,
} from "./tokens/tokens";

async function convertCurrency(
  srvVal: number,
  srcUnit: string,
  destUnit: string,
  date: DateToken | null,
) {
  let dateStr;
  if (date && date.year && date.month && date.date && date.year > 1999) {
    dateStr = `${date.year}`;
    dateStr += date.month < 10 ? `-0${date.month}` : `-${date.month}`;
    dateStr += date.date < 10 ? `-0${date.date}` : `-${date.date}`;
  }
  const rate: { [key: string]: number } = await getRate(srcUnit, dateStr);
  return srvVal * rate[destUnit];
}

class ProcessConversions {
  _token: NumberToken | DateToken | ColorToken;
  _type: TokenBaseType;
  _fromUnit: expressionUnit;
  _toUnit: expressionUnit;

  constructor(token: NumberToken | DateToken | ColorToken) {
    this._token = token;
    if (token instanceof NumberToken) {
      this._type = token.numbertype;
      this._fromUnit = token.unit;
    } else if (token instanceof ColorToken) {
      // @ts-ignore
      this._fromUnit = token.unit;
      this._type = TokenBaseType.COLOR;
    } else this._type = TokenBaseType.DATE;
  }

  to(toUnit: expressionUnit) {
    this._toUnit = toUnit;
    return this;
  }

  async convert(isPro: boolean) {
    if (!this._toUnit) throw new UserError(7649);
    if (this._toUnit.needsPro && !isPro) throw new UserError(9876);

    if (this._toUnit.unitdata.type === UnitTypes.FUNCTION) {
      return this._toUnit.unitdata.func!(this._token);
    }
    if (
      this._token instanceof NumberToken &&
      this._toUnit.unitdata.type === UnitTypes.POSTFIX
    ) {
      const resValue = this._token.toNumber() / this._toUnit.factor!;

      const resToken = <NumberToken>(
        tokenFactory(resValue.toString(), this._type)
      );
      resToken.unit = this._toUnit;
      return resToken;
    }

    if (
      this._token instanceof DateToken &&
      this._toUnit.unitdata.type === UnitTypes.CITY
    ) {
      const newST = this._token.spacetime?.goto(
        this._toUnit.unitdata.timezone!,
      );
      return this._token
        .setTimezone(
          this._toUnit.unitdata.timezone!,
          this._toUnit.originalValue,
        )
        .setObject(newST);
    }

    if (!this._fromUnit) throw new UserError(1908);
    if (this._fromUnit.unitdata.type !== this._toUnit.unitdata.type)
      throw new UserError(3907);

    if (
      this._token instanceof NumberToken &&
      this._toUnit.unitdata.type === UnitTypes.TEMPERATURE
    ) {
      // @ts-ignore
      let resValue = this._fromUnit.unitdata[this._toUnit.value](
        this._token.toNumber() * this._fromUnit.factor!,
      );
      resValue /= this._toUnit.factor;
      const resToken = <NumberToken>(
        tokenFactory(resValue.toString(), this._type)
      );
      resToken.unit = this._toUnit;
      return resToken;
    }
    if (this._token instanceof NumberToken) {
      const resValue =
        this._token.toNumber() *
        this._fromUnit.unitdata.factors![this._toUnit.value] *
        (this._fromUnit.factor / this._toUnit.factor);
      const resToken = <NumberToken>(
        tokenFactory(resValue.toString(), this._type)
      );
      resToken.unit = this._toUnit;
      return resToken;
    }

    throw new UserError(0);
  }
}

export default ProcessConversions;
