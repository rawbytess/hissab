import TokenBaseType, { type TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import type { Variables } from "../tokens/tokens";

export class Tokens {
  private _thetoken: string;
  private _tokentype: TokenBaseType;
  private _float: number;
  private _tokens: TokenType[];
  private _variables: Variables;
  private _lineNumber: number;
  private _multiWord: boolean;

  constructor(variables: Variables, lineNumber: number) {
    this._thetoken = "";
    this._tokentype = TokenBaseType.UNDEFINED;
    this._float = 0;
    this._tokens = [];
    this._variables = variables;
    this._lineNumber = lineNumber;
    this._multiWord = false;
  }

  flushToken(tokentype = this._tokentype) {
    if (this._thetoken !== "") {
      this._multiWord =
        tokentype === TokenBaseType.STRING &&
        this._thetoken.trim().split(" ").length > 1;
      const tkn = tokenFactory(
        this._thetoken.trim(),
        tokentype,
        this._tokens,
        this._variables,
        false,
        this._lineNumber,
        "",
        this._multiWord,
      );
      if (tkn) this._tokens.push(tkn);
    }
    this._thetoken = "";
    this._tokentype = TokenBaseType.UNDEFINED;
    this._float = 0;
    this._multiWord = false;
  }

  public get thetoken(): string {
    return this._thetoken;
  }

  public set thetoken(char: string) {
    this._thetoken = char;
  }

  public set tokentype(tokentype: TokenBaseType) {
    this._tokentype = tokentype;
  }

  public set float(float: number) {
    this._float = float;
  }

  public get float(): number {
    return this._float;
  }

  public get tokens() {
    return this._tokens;
  }

  public set multiWord(val: boolean) {
    this._multiWord = val;
  }

  public get multiWord() {
    return this._multiWord;
  }

  public set variables(variables: Variables) {
    this._variables = variables;
  }
}

export type TokensType = InstanceType<typeof Tokens>;
