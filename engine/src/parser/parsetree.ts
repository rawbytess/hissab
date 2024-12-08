import {
  DateToken,
  Direction,
  expressionUnit,
  FunctionToken,
  OperatorToken,
  NumberToken,
} from "../tokens/tokens";
import tokenFactory from "../tokens/token_factory";
import { UserError } from "../exceptions";
import { TokenType } from "../tokens/token_basetypes";

export default class ParseTree {
  private _head: TokenType | null;

  private _currentpt: TokenType | null;

  private _exprUnit: expressionUnit;

  private _isExplicit: boolean;

  private _convertTo: string[] | undefined;

  private _isPro: boolean;

  constructor(isPro: boolean) {
    this._head = null;
    this._currentpt = null;
    this._exprUnit = undefined;
    this._isExplicit = false;
    this._isPro = isPro;
  }

  public set currentpt(currentpt: TokenType | null) {
    this._currentpt = currentpt;
  }

  public get currentpt(): TokenType | null {
    return this._currentpt;
  }

  public get exprUnit(): expressionUnit {
    return this._exprUnit;
  }

  public set exprUnit(unitToken: expressionUnit) {
    this._exprUnit = unitToken;
  }

  public get head(): TokenType | null {
    return this._head;
  }

  public set head(head: TokenType | null) {
    this._head = head;
  }

  public get isExplicit(): boolean {
    return this._isExplicit;
  }

  public setIsExplicit = (isExplicit: boolean) => {
    this._isExplicit = isExplicit;
  };

  public get convertTo(): string[] | undefined {
    return this._convertTo;
  }

  public setConvertTo = (convertTo: string[]) => {
    this._convertTo = convertTo;
  };

  public get isPro(): boolean {
    return this._isPro;
  }

  async solve(
    currHead: TokenType,
    parent: TokenType | null,
    direction: Direction,
  ) {
    if (
      !(currHead instanceof OperatorToken || currHead instanceof FunctionToken)
    )
      return;

    await this.solve(currHead.getLeftChild(), currHead, Direction.LEFT);
    await this.solve(currHead.getRightChild(), currHead, Direction.RIGHT);

    let result: NumberToken | DateToken;
    if (currHead.needsPro && !this.isPro) throw new UserError(9876);
    if (currHead.isRaw) {
      result = await currHead.func(
        currHead.children,
        this.exprUnit,
        this.setIsExplicit,
        this.setConvertTo,
        this.isPro,
      );
    } else {
      result = <NumberToken | DateToken>(
        tokenFactory(
          currHead.func(...currHead.getChildrenValues()).toString(),
          currHead.getNumberType(),
        )
      );
      if (this.exprUnit && result instanceof NumberToken)
        result.unit = this.exprUnit;
    }
    currHead.clearChildren();

    if (parent) parent.setChild(direction, result);
    else this._head = result;
  }
}

export type ParseTreeType = InstanceType<typeof ParseTree>;
