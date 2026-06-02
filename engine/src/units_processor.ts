import { UserError } from "./exceptions";
import TokenBaseType from "./tokens/token_basetypes";
import tokenFactory from "./tokens/token_factory";
import {
  ColorToken,
  DateToken,
  type expressionUnit,
  NumberToken,
} from "./tokens/tokens";
import UnitTypes from "./types/unit_enum";
import { dimEquals, linearFactor } from "./types/unit_types";

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
      // @ts-expect-error
      this._fromUnit = token.unit;
      this._type = TokenBaseType.COLOR;
    } else this._type = TokenBaseType.DATE;
  }

  to(toUnit: expressionUnit) {
    this._toUnit = toUnit;
    return this;
  }

  async convert() {
    if (!this._toUnit) throw new UserError(7649);

    if (this._toUnit.unitdata.type === UnitTypes.FUNCTION) {
      return this._toUnit.unitdata.func!(this._token);
    }
    if (
      this._token instanceof NumberToken &&
      this._toUnit.unitdata.type === UnitTypes.POSTFIX
    ) {
      const resValue = this._token.toNumber() / this._toUnit.factor!;
      return this.wrapNumber(resValue);
    }

    if (
      this._token instanceof DateToken &&
      this._toUnit.unitdata.type === UnitTypes.CITY
    ) {
      const newST = this._token.spacetime?.goto(
        this._toUnit.unitdata.timezone!,
      );
      return this._token
        .set({
          iana: this._toUnit.unitdata.timezone!,
          timezone: this._toUnit.originalValue,
        })
        .setObject(newST);
    }

    if (!this._fromUnit) throw new UserError(1908);

    // Compound / dim-driven branch. Triggered when either side is compound, or
    // when both sides share a dimension but live in different `UnitTypes`
    // (e.g., `m^2 to square meter`). Simple same-type / same-family pairs
    // continue through the precision-preserving linearFactor path below.
    const fromIsCompound = this._fromUnit.isCompound;
    const toIsCompound = this._toUnit.isCompound;
    const crossType =
      this._fromUnit.unitdata.type !== this._toUnit.unitdata.type;
    if (fromIsCompound || toIsCompound || crossType) {
      if (!dimEquals(this._fromUnit.dim, this._toUnit.dim))
        throw new UserError(3907);
      if (
        this._token instanceof NumberToken &&
        this._toUnit.unitdata.type !== UnitTypes.TEMPERATURE &&
        this._fromUnit.unitdata.type !== UnitTypes.TEMPERATURE
      ) {
        const factor = this._fromUnit.siFactor / this._toUnit.siFactor;
        const resValue = this._token.toNumber() * factor;
        return this.wrapNumber(resValue);
      }
      // Compound with a TEMPERATURE atom shouldn't reach here — the parser
      // refuses non-linear-temperature compounds (UserError 3908). A plain
      // temperature conversion drops through to the standard branch below.
    }

    if (this._fromUnit.unitdata.type !== this._toUnit.unitdata.type)
      throw new UserError(3907);

    if (
      this._token instanceof NumberToken &&
      this._toUnit.unitdata.type === UnitTypes.TEMPERATURE
    ) {
      // @ts-expect-error
      let resValue = this._fromUnit.unitdata[this._toUnit.value](
        this._token.toNumber() * this._fromUnit.factor!,
      );
      resValue /= this._toUnit.factor;
      return this.wrapNumber(resValue);
    }
    if (this._token instanceof NumberToken) {
      const conversion = linearFactor(this._fromUnit.value, this._toUnit.value);
      const prefixRatio = this._fromUnit.factor / this._toUnit.factor;
      const resValue = this._token.toNumber() * conversion * prefixRatio;
      return this.wrapNumber(resValue);
    }

    throw new UserError(0);
  }

  private wrapNumber(value: number): NumberToken {
    const token = <NumberToken>tokenFactory(value.toString(), this._type);
    token.unit = this._toUnit;
    return token;
  }
}

export default ProcessConversions;
