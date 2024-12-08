import ProcessConversions from "../units_processor";
import {
  ColorToken,
  DateToken,
  expressionUnit,
  FunctionToken,
  NumberToken,
  OperatorToken,
  StringToken,
  UnitToken,
  VariableNameToken,
} from "../tokens/tokens";

import { UnhandledError, UserError } from "../exceptions";
import tokenFactory from "../tokens/token_factory";
import TokenBaseType, { TokenType } from "../tokens/token_basetypes";
import { ParseTreeType } from "./parsetree";
import UnitTypes from "../types/unit_enum";

export type ParserStateTypes =
  | typeof FreshParseState
  | typeof CompleteState
  | typeof NeedNumberState
  | typeof NeedUnitState
  | typeof FunctionState
  | typeof PreNumberState
  | typeof CombineNumberState;

class FreshParseState {
  static readonly instanceName = "FreshParseState";

  static handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): ParserStateTypes {
    parseTree.head = numberToken;
    if (!parseTree.exprUnit && numberToken.unit)
      parseTree.exprUnit = numberToken.unit;
    return CompleteState;
  }

  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    parseTree.head = colorToken;
    return CompleteState;
  }

  static handleString(
    parseTree: ParseTreeType,
    stringToken: StringToken | VariableNameToken,
  ): ParserStateTypes {
    parseTree.head = stringToken;
    return CompleteState;
  }

  static handleDate(
    parseTree: ParseTreeType,
    dateToken: DateToken,
  ): ParserStateTypes {
    parseTree.head = dateToken;
    parseTree.exprUnit = <expressionUnit>(
      tokenFactory("second", TokenBaseType.STRING)
    );
    return CompleteState;
  }

  static handleOperator(
    parseTree: ParseTreeType,
    operatorToken: OperatorToken,
  ): ParserStateTypes {
    if (operatorToken.value === "-" || operatorToken.value === "$") {
      parseTree.head = operatorToken;
      return PreNumberState;
    }
    if (!operatorToken.operands.includes("prenumber")) {
      parseTree.head = operatorToken;
      parseTree.currentpt = operatorToken;
      return NeedNumberState;
    }
    throw new UserError(202);
  }

  static handleUnit(
    parseTree: ParseTreeType,
    unitToken: UnitToken,
  ): ParserStateTypes {
    if (unitToken.unitdata.type === UnitTypes.CITY) {
      parseTree.head = unitToken;
      return CompleteState;
    }
    throw new UserError(203);
  }

  static handleFunction(
    parseTree: ParseTreeType,
    functionToken: FunctionToken,
  ): ParserStateTypes {
    parseTree.head = functionToken;
    parseTree.currentpt = functionToken;
    return FunctionState;
  }
}

class CompleteState {
  static readonly instanceName = "CompleteState";

  static handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): ParserStateTypes {
    let tempPt = parseTree.head!;
    let parentPt = tempPt;
    while (tempPt.getRightChild()) {
      parentPt = tempPt;
      tempPt = tempPt.getRightChild();
    }
    if (!(tempPt instanceof NumberToken)) throw new UnhandledError(0);
    const addToken = tokenFactory("+", TokenBaseType.STRING);
    if (!addToken) throw new UnhandledError(0);

    addToken.setLeftChild(tempPt);
    addToken.setRightChild(numberToken);
    if (parentPt === tempPt) parseTree.head = addToken;
    else parentPt.setRightChild(addToken);
    return CompleteState;
  }

  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    throw new UnhandledError(0);
  }

  static handleDate(
    parseTree: ParseTreeType,
    dateToken: DateToken,
  ): ParserStateTypes {
    throw new UnhandledError(0);
  }

  static handleOperator(
    parseTree: ParseTreeType,
    operatorToken: OperatorToken,
  ): ParserStateTypes {
    if (parseTree.exprUnit === undefined) parseTree.exprUnit = null;
    if (
      operatorToken.operands.includes("prenumber") ||
      operatorToken.operands.includes("prestring")
    ) {
      let tempPt: TokenType = parseTree.head!;
      const opStack = [];
      while (tempPt instanceof OperatorToken) {
        opStack.push(tempPt);
        tempPt = tempPt?.getRightChild();
      }
      tempPt = <OperatorToken>opStack.pop();
      while (
        tempPt &&
        tempPt instanceof OperatorToken &&
        operatorToken.precedence >= tempPt.precedence
      )
        tempPt = <OperatorToken>opStack.pop();

      if (tempPt) {
        operatorToken.setLeftChild(tempPt.getRightChild());
        tempPt.setRightChild(operatorToken);
      } else {
        operatorToken.setLeftChild(parseTree.head!);
        parseTree.head = operatorToken;
      }

      if (operatorToken.operands.includes("postnumber")) {
        parseTree.currentpt = operatorToken;
        return NeedNumberState;
      }
      if (operatorToken.operands.includes("postunit")) {
        parseTree.currentpt = operatorToken;
        return NeedUnitState;
      }
      return CompleteState;
    }
    throw new UserError(6431);
  }

  static async handleUnit(
    parseTree: ParseTreeType,
    unitToken: UnitToken,
  ): Promise<ParserStateTypes> {
    let tempPt = parseTree.head!;
    let parentPt = tempPt;
    while (tempPt.getRightChild()) {
      parentPt = tempPt;
      tempPt = tempPt.getRightChild();
    }

    if (!(tempPt instanceof NumberToken)) throw new UnhandledError(201);
    if (tempPt.unit !== null) throw new UserError(206);

    if (unitToken.unitdata.type === UnitTypes.POSTFIX) {
      tempPt.value = (tempPt.toNumber() * unitToken.factor).toString();
      return CompleteState;
    }

    tempPt.unit = unitToken;
    if (!parseTree.exprUnit) {
      parseTree.exprUnit = unitToken;
      return CompleteState;
    }
    if (parseTree.exprUnit.value === unitToken.value) return CompleteState;
    if (parseTree.exprUnit.unitdata.type === unitToken.unitdata.type) {
      const newPt = await new ProcessConversions(tempPt)
        .to(parseTree.exprUnit)
        .convert(parseTree.isPro);
      tempPt.value = newPt.value;
      tempPt.unit = newPt instanceof NumberToken ? newPt.unit : undefined;
    } else throw new UserError(207);
    return CompleteState;
  }

  static handleFunction(): ParserStateTypes {
    throw new UserError(207);
  }

  static handleString(): ParserStateTypes {
    throw new UserError(207);
  }
}

class NeedNumberState {
  static readonly instanceName = "NeedNumberState";

  static async handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): Promise<ParserStateTypes> {
    if (!parseTree.exprUnit && numberToken.unit)
      parseTree.exprUnit = numberToken.unit;
    else if (parseTree.exprUnit && numberToken.unit) {
      const newPt = await new ProcessConversions(numberToken)
        .to(parseTree.exprUnit)
        .convert(parseTree.isPro);
      numberToken.value = newPt.value;
      numberToken.unit = newPt instanceof NumberToken ? newPt.unit : undefined;
    }
    parseTree.currentpt?.setRightChild(numberToken);
    return CompleteState;
  }

  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    parseTree.currentpt?.setRightChild(colorToken);
    return CompleteState;
  }

  static handleDate(
    parseTree: ParseTreeType,
    dateToken: DateToken,
  ): ParserStateTypes {
    if (!parseTree.exprUnit) {
      parseTree.exprUnit = tokenFactory(
        "second",
        TokenBaseType.STRING,
      ) as UnitToken;
    }
    parseTree.currentpt?.setRightChild(dateToken);
    return CompleteState;
  }

  static handleOperator(
    parseTree: ParseTreeType,
    operatorToken: OperatorToken,
  ): ParserStateTypes {
    if (operatorToken.value === "-" || operatorToken.value === "$") {
      parseTree.currentpt?.setRightChild(operatorToken);
      return PreNumberState;
    }
    if (!operatorToken.operands.includes("prenumber")) {
      parseTree.head = operatorToken;
      parseTree.currentpt = operatorToken;
      return NeedNumberState;
    }
    throw new UserError(208);
  }

  static handleUnit(
    parseTree: ParseTreeType,
    unitToken: UnitToken,
  ): ParserStateTypes {
    if (unitToken.unitdata.type === UnitTypes.CITY) {
      parseTree.currentpt?.setRightChild(unitToken);
      return CompleteState;
    }
    throw new UserError(210);
  }

  static handleFunction(
    parseTree: ParseTreeType,
    functionToken: FunctionToken,
  ): ParserStateTypes {
    parseTree.currentpt?.setRightChild(functionToken);
    parseTree.currentpt = functionToken;
    return FunctionState;
  }

  static handleString(): ParserStateTypes {
    throw new UserError(207);
  }
}

class NeedUnitState {
  static readonly instanceName = "NeedUnitState";

  static handleOperand(): ParserStateTypes {
    throw new UserError(211);
  }

  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    throw new UserError(211);
  }

  static handleOperator(): ParserStateTypes {
    throw new UserError(212);
  }

  static handleUnit(
    parseTree: ParseTreeType,
    unitToken: UnitToken,
  ): ParserStateTypes {
    parseTree.currentpt?.insertChild(unitToken);
    return CompleteState;
  }

  static handleFunction(): ParserStateTypes {
    throw new UserError(214);
  }

  static handleString(): ParserStateTypes {
    throw new UserError(207);
  }

  static handleDate(): ParserStateTypes {
    throw new UserError(207);
  }
}

class FunctionState {
  static readonly instanceName = "FunctionState";

  static async handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): Promise<ParserStateTypes> {
    if (!(parseTree.currentpt instanceof FunctionToken))
      throw new UnhandledError(1234);
    if (!parseTree.currentpt?.isRaw) {
      if (!parseTree.exprUnit && numberToken.unit)
        parseTree.exprUnit = numberToken.unit;
      else if (parseTree.exprUnit && numberToken.unit) {
        const newPt = await new ProcessConversions(numberToken)
          .to(parseTree.exprUnit)
          .convert(parseTree.isPro);
        numberToken.value = newPt.value;
        numberToken.unit =
          newPt instanceof NumberToken ? newPt.unit : undefined;
      }
    }
    parseTree.currentpt?.insertChild(numberToken);
    return FunctionState;
  }

  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    if (!(parseTree.currentpt instanceof FunctionToken))
      throw new UnhandledError(1234);
    parseTree.currentpt?.insertChild(colorToken);
    return FunctionState;
  }

  static handleOperator(): ParserStateTypes {
    throw new UserError(215);
  }

  static handleUnit(): ParserStateTypes {
    throw new UserError(217);
  }

  static handleFunction(): ParserStateTypes {
    throw new UserError(218);
  }

  static handleString(): ParserStateTypes {
    throw new UserError(207);
  }

  static handleDate(): ParserStateTypes {
    throw new UserError(207);
  }
}

class PreNumberState {
  static readonly instanceName = "PreNumberState";

  static handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): ParserStateTypes {
    if (parseTree.currentpt === null) {
      if (parseTree.head!.value === "-") {
        numberToken.value = (numberToken.toNumber() * -1).toString();
        parseTree.head = numberToken;
      } else if (parseTree.head!.value === "$") {
        numberToken.unit = tokenFactory(
          "usd",
          TokenBaseType.STRING,
        ) as UnitToken;
        parseTree.head = numberToken;
      }
    } else {
      const current = parseTree.currentpt.getRightChild();
      if (current.value === "-") {
        numberToken.value = (numberToken.toNumber() * -1).toString();
        parseTree.currentpt.setRightChild(numberToken);
      } else if (current.value === "$") {
        numberToken.unit = tokenFactory(
          "usd",
          TokenBaseType.STRING,
        ) as UnitToken;
        parseTree.currentpt.setRightChild(numberToken);
      }
    }
    return CompleteState;
  }
  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handleOperator(): ParserStateTypes {
    throw new UserError(219);
  }

  static handleUnit(): ParserStateTypes {
    throw new UserError(221);
  }

  static handleFunction(): ParserStateTypes {
    throw new UserError(222);
  }

  static handleString(): ParserStateTypes {
    throw new UserError(207);
  }

  static handleDate(): ParserStateTypes {
    throw new UserError(207);
  }
}

class CombineNumberState {
  static readonly instanceName = "CombineNumberState";
  static handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): ParserStateTypes {
    let tempPt = parseTree.head!;
    let parentPt = tempPt;
    while (tempPt.getRightChild()) {
      parentPt = tempPt;
      tempPt = tempPt.getRightChild();
    }
    if (tempPt instanceof NumberToken) {
      const newValue = tokenFactory(
        `${tempPt.value}${numberToken.value}`,
        tempPt.numbertype,
      ) as NumberToken;

      if (parentPt === tempPt) parseTree.head = newValue;
      else parentPt.setRightChild(newValue);

      parseTree.currentpt = newValue;
      return CompleteState;
    }
    throw new UserError(207);
  }
  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handleOperator(): ParserStateTypes {
    throw new UserError(219);
  }

  static handleUnit(): ParserStateTypes {
    throw new UserError(221);
  }

  static handleFunction(): ParserStateTypes {
    throw new UserError(222);
  }

  static handleString(): ParserStateTypes {
    throw new UserError(207);
  }

  static handleDate(): ParserStateTypes {
    throw new UserError(207);
  }
}

export {
  FreshParseState,
  NeedNumberState,
  CompleteState,
  FunctionState,
  NeedUnitState,
  CombineNumberState,
};
