import { UserError } from "./exceptions";
import TokenBaseType from "./tokens/token_basetypes";
import tokenFactory from "./tokens/token_factory";
import {
  ColorToken,
  DateToken,
  type expressionUnit,
  IpToken,
  NumberToken,
} from "./tokens/tokens";
import UnitTypes from "./types/unit_enum";
import { dimEquals, linearFactor, temperatureFn } from "./types/unit_types";

class ProcessConversions {
  _token: NumberToken | DateToken | ColorToken | IpToken;
  _type: TokenBaseType;
  _fromUnit: expressionUnit;
  _toUnit: expressionUnit;

  constructor(token: NumberToken | DateToken | ColorToken | IpToken) {
    this._token = token;
    if (token instanceof NumberToken) {
      this._type = token.numbertype;
      this._fromUnit = token.unit;
    } else if (token instanceof ColorToken) {
      // A ColorToken's `.unit` is its color format ("RGB"|"HEX"|…), not a
      // UnitToken — leave _fromUnit unset. Color conversions are always
      // FUNCTION targets (`to hex`, `to rgb color`, …) which short-circuit in
      // convert() before _fromUnit is consulted; any other target falls into
      // the `!_fromUnit` rejection below instead of crashing.
      this._type = TokenBaseType.COLOR;
    } else if (token instanceof IpToken) {
      // IP conversions are always FUNCTION targets (to binary / ipv4 / …),
      // which short-circuit in convert() before _fromUnit is consulted.
      this._type = TokenBaseType.IP;
    } else this._type = TokenBaseType.DATE;
  }

  to(toUnit: expressionUnit) {
    this._toUnit = toUnit;
    return this;
  }

  // Conversion strategies, tried strictly in this order. The order is
  // precision-load-bearing: same-family simple pairs (`km → m`) must reach
  // the hand-tuned linearFactor path at the bottom, not the siFactor ratio.
  // To add a new conversion kind, add a named method and one ladder rung.
  async convert() {
    if (!this._toUnit) throw new UserError(7649);

    // 1. FUNCTION targets (`hex`, `epoch`, `rgb color`, …) are conversions
    //    that are really transformations — delegate to the unit's func.
    if (this._toUnit.unitdata.type === UnitTypes.FUNCTION)
      return this.convertViaFunction();

    // 2. POSTFIX target (`to kilo`, `to milli`) on a plain number.
    if (
      this._token instanceof NumberToken &&
      this._toUnit.unitdata.type === UnitTypes.POSTFIX
    )
      return this.convertViaPostfix();

    // 3. CITY target on a date — shift the spacetime to the new IANA zone.
    if (
      this._token instanceof DateToken &&
      this._toUnit.unitdata.type === UnitTypes.CITY
    )
      return this.convertCityTimezone();

    if (!this._fromUnit) throw new UserError(1908);

    // 4. Compound / dim-driven. Triggered when either side is compound, or
    //    when both sides share a dimension but live in different `UnitTypes`
    //    (e.g., `m^2 to square meter`). May decline (return null) so plain
    //    temperature conversions drop through to the affine path below.
    const dimResult = this.convertViaDim();
    if (dimResult) return dimResult;

    if (this._fromUnit.unitdata.type !== this._toUnit.unitdata.type)
      throw new UserError(3907);

    // 5. TEMPERATURE (same-type) — affine lambdas, not linear factors.
    if (
      this._token instanceof NumberToken &&
      this._toUnit.unitdata.type === UnitTypes.TEMPERATURE
    )
      return this.convertTemperature();

    // 6. Same-type linear families (LENGTH, WEIGHT, VOLUME, …).
    if (this._token instanceof NumberToken) return this.convertLinear();

    throw new UserError(9003);
  }

  private convertViaFunction() {
    return this._toUnit!.unitdata.func!(this._token);
  }

  private convertViaPostfix(): NumberToken {
    const token = this._token as NumberToken;
    return this.wrapNumber(token.toNumber() / this._toUnit!.factor!);
  }

  private convertCityTimezone(): DateToken {
    const token = this._token as DateToken;
    const newST = token.spacetime?.goto(this._toUnit!.unitdata.timezone!);
    return token
      .set({
        iana: this._toUnit!.unitdata.timezone!,
        timezone: this._toUnit!.originalValue,
      })
      .setObject(newST);
  }

  // Dim-driven conversion across compounds and cross-type pairs. Returns null
  // when the pair isn't its business (simple same-type pairs) or when a
  // TEMPERATURE side means the affine path must handle it instead. Mismatched
  // dimensions throw — there is no conversion between different dimensions.
  private convertViaDim(): NumberToken | null {
    const fromUnit = this._fromUnit!;
    const toUnit = this._toUnit!;
    const fromIsCompound = fromUnit.isCompound;
    const toIsCompound = toUnit.isCompound;
    const crossType = fromUnit.unitdata.type !== toUnit.unitdata.type;
    if (!fromIsCompound && !toIsCompound && !crossType) return null;

    if (!dimEquals(fromUnit.dim, toUnit.dim)) throw new UserError(3907);
    if (
      this._token instanceof NumberToken &&
      toUnit.unitdata.type !== UnitTypes.TEMPERATURE &&
      fromUnit.unitdata.type !== UnitTypes.TEMPERATURE
    ) {
      const factor = fromUnit.siFactor / toUnit.siFactor;
      return this.wrapNumber(this._token.toNumber() * factor);
    }
    // Compound with a TEMPERATURE atom shouldn't reach here — the parser
    // refuses non-linear-temperature compounds (UserError 3908). A plain
    // temperature conversion declines so it drops through to the affine
    // branch below.
    return null;
  }

  private convertTemperature(): NumberToken {
    const token = this._token as NumberToken;
    const fromUnit = this._fromUnit!;
    const convert = temperatureFn(fromUnit.unitdata, this._toUnit!.value);
    let resValue = convert(token.toNumber() * fromUnit.factor!);
    resValue /= this._toUnit!.factor;
    return this.wrapNumber(resValue);
  }

  private convertLinear(): NumberToken {
    const token = this._token as NumberToken;
    const fromUnit = this._fromUnit!;
    const conversion = linearFactor(fromUnit.value, this._toUnit!.value);
    const prefixRatio = fromUnit.factor / this._toUnit!.factor;
    return this.wrapNumber(token.toNumber() * conversion * prefixRatio);
  }

  private wrapNumber(value: number): NumberToken {
    const token = <NumberToken>tokenFactory(value.toString(), this._type);
    token.unit = this._toUnit;
    return token;
  }
}

export default ProcessConversions;
