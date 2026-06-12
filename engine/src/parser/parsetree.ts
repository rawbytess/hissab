import { UnhandledError } from "../exceptions";
import type { TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import {
  Direction,
  type expressionUnit,
  FunctionToken,
  NumberToken,
  OperatorToken,
} from "../tokens/tokens";

type HasChildren = OperatorToken | FunctionToken;

export default class ParseTree {
  private _head: TokenType | null;

  private _currentpt: HasChildren | null;

  private _exprUnit: expressionUnit;

  private _isExplicit: boolean;

  private _convertTo: string[] | undefined;

  constructor() {
    this._head = null;
    this._currentpt = null;
    this._exprUnit = undefined;
    this._isExplicit = false;
  }

  public set currentpt(currentpt: HasChildren | null) {
    this._currentpt = currentpt;
  }

  public get currentpt(): HasChildren | null {
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

  async solve(
    currHead: TokenType,
    parent: OperatorToken | null,
    direction: Direction,
  ) {
    if (currHead instanceof OperatorToken) {
      if (currHead.left)
        await this.solve(currHead.left, currHead, Direction.LEFT);
      if (currHead.right)
        await this.solve(currHead.right, currHead, Direction.RIGHT);
    } else if (!(currHead instanceof FunctionToken)) {
      // Function args are pre-solved by recursive parse() before insertion,
      // so leaves don't need solving.
      return;
    }

    // Narrow on def.isRaw per token class so each calling convention is
    // compiler-checked: raw defs get the token children + ambient unit
    // context; non-raw defs get unwrapped numbers and the result is
    // re-wrapped with the ambient unit.
    let result: TokenType | null;
    if (currHead instanceof OperatorToken) {
      result = currHead.def.isRaw
        ? await currHead.def.func(
            currHead.children,
            this.exprUnit,
            this.setIsExplicit,
            this.setConvertTo,
          )
        : this.wrapNumericResult(
            currHead,
            currHead.def.func(...currHead.getChildrenValues()),
          );
    } else {
      result = currHead.def.isRaw
        ? await currHead.def.run(
            currHead.children,
            this.exprUnit,
            this.setIsExplicit,
            this.setConvertTo,
          )
        : this.wrapNumericResult(
            currHead,
            currHead.def.run(...currHead.getChildrenValues()),
          );
    }
    if (!result) throw new UnhandledError(9001);
    currHead.clearChildren();

    if (parent) parent.setChild(direction, result);
    else this._head = result;
  }

  private wrapNumericResult(
    node: OperatorToken | FunctionToken,
    value: number,
  ): TokenType | null {
    const result = tokenFactory(value.toString(), node.getNumberType());
    if (this.exprUnit && result instanceof NumberToken)
      result.unit = this.exprUnit;
    return result;
  }
}

export type ParseTreeType = InstanceType<typeof ParseTree>;
