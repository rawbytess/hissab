import { isCoordConverter } from "../coordinates";
import { UnhandledError, UserError } from "../exceptions";
import { makeCompoundUnit, mergeAtoms } from "../tokens/compound";
import TokenBaseType, { type TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import {
  type BooleanToken,
  type ColorToken,
  ComplexToken,
  ControllerToken,
  CoordTargetToken,
  type DateToken,
  ExprToken,
  type expressionUnit,
  FunctionToken,
  type IpToken,
  type MatrixToken,
  NumberToken,
  OperatorToken,
  type PointToken,
  type SeedToken,
  type StringToken,
  SymbolToken,
  type TextToken,
  type UnitAtom,
  UnitToken,
  type VariableNameToken,
} from "../tokens/tokens";
import UnitTypes from "../types/unit_enum";
import { dimEquals } from "../types/unit_types";
import ProcessConversions from "../units_processor";
import type { ParseTreeType } from "./parsetree";

// Operands the parser state machine accepts in number position. NumberToken is
// the numeric case; the rest are the symbolic/complex extensions. SymbolToken
// and ExprToken additionally flip the expression into symbolic mode (see
// isSymbolic in parser.ts); ComplexToken stays on the numeric solve path.
type OperandToken =
  | NumberToken
  | ComplexToken
  | MatrixToken
  | SymbolToken
  | ExprToken
  | TextToken;

// True when juxtaposing this operand against another implies multiplication
// (`2x`, `6i`, `(x+1)(x+2)`) rather than the unit implicit-addition case.
function isMulJuxtapose(t: TokenType | null): boolean {
  return (
    t instanceof SymbolToken ||
    t instanceof ComplexToken ||
    t instanceof ExprToken
  );
}

export type ParserStateTypes =
  | typeof FreshParseState
  | typeof CompleteState
  | typeof NeedNumberState
  | typeof NeedUnitState
  | typeof FunctionState
  | typeof PreNumberState
  | typeof CombineNumberState;

// `-` is the only operator that switches an operand-needing state into
// unary-prefix mode. Centralised here so adding new prefix ops only touches
// this set.
const UNARY_PREFIX_OPS = new Set(["-"]);
function isUnaryPrefix(op: OperatorToken): boolean {
  return UNARY_PREFIX_OPS.has(op.value);
}

// Return shape for handleUnit. `advance` is the number of tokens consumed
// beyond the originating UnitToken — the parser loop adds it to parseIndex on
// top of the loop's own +1 (which skips the originating unit).
export type HandleUnitResult = {
  state: ParserStateTypes;
  advance: number;
};

// ---------------------------------------------------------------------------
// Compound-unit absorption helpers
// ---------------------------------------------------------------------------

// Try `^<int>` or `^-<int>` starting at index i. Returns the integer exponent
// and the index of the next unconsumed token.
function tryAbsorbExponent(
  tokens: TokenType[],
  i: number,
): { exp: number; next: number } | null {
  if (i >= tokens.length) return null;
  const t = tokens[i];
  if (!(t instanceof OperatorToken) || t.value !== "^") return null;
  let j = i + 1;
  if (j >= tokens.length) return null;
  let sign = 1;
  const maybeMinus = tokens[j];
  if (maybeMinus instanceof OperatorToken && maybeMinus.value === "-") {
    sign = -1;
    j += 1;
    if (j >= tokens.length) return null;
  }
  const numTok = tokens[j];
  if (!(numTok instanceof NumberToken)) return null;
  const n = numTok.toNumber();
  if (!Number.isInteger(n)) return null;
  return { exp: sign * n, next: j + 1 };
}

function findMatchingClose(tokens: TokenType[], openIdx: number): number {
  let depth = 1;
  let i = openIdx + 1;
  while (i < tokens.length && depth > 0) {
    const t = tokens[i];
    if (t instanceof ControllerToken) {
      if (t.basetype === "BRAC_START") depth += 1;
      else if (t.basetype === "BRAC_END") depth -= 1;
    }
    if (depth === 0) return i;
    i += 1;
  }
  return -1;
}

// True when tokens[idx] starts a unit-expression continuation — either a
// non-postfix UnitToken (possibly inside a paren group of unit-only tokens).
function isUnitLikeStart(tokens: TokenType[], idx: number): boolean {
  if (idx >= tokens.length) return false;
  const t = tokens[idx];
  if (t instanceof UnitToken && t.unitdata.type !== UnitTypes.POSTFIX)
    return true;
  if (t instanceof ControllerToken && t.basetype === "BRAC_START") {
    const close = findMatchingClose(tokens, idx);
    if (close < 0) return false;
    // The first non-paren token inside must be a unit (or another paren that
    // is unit-like — we just check the first inner token recursively).
    if (idx + 1 >= close) return false;
    return isUnitLikeStart(tokens, idx + 1);
  }
  return false;
}

function parseUnitGroupInterior(
  tokens: TokenType[],
  start: number,
  end: number,
  outerSign: 1 | -1,
): UnitAtom[] | null {
  const atoms: UnitAtom[] = [];
  let pendingSign: 1 | -1 = 1;
  let firstDone = false;
  let i = start;
  while (i < end) {
    const t = tokens[i];
    if (t instanceof UnitToken && t.unitdata.type !== UnitTypes.POSTFIX) {
      let exp = pendingSign * outerSign;
      let next = i + 1;
      const expr = tryAbsorbExponent(tokens, next);
      if (expr) {
        exp *= expr.exp;
        next = expr.next;
      }
      atoms.push({ unit: t, exponent: exp });
      firstDone = true;
      pendingSign = 1;
      i = next;
    } else if (t instanceof ControllerToken && t.basetype === "BRAC_START") {
      const close = findMatchingClose(tokens, i);
      if (close < 0 || close >= end) return null;
      const sub = parseUnitGroupInterior(
        tokens,
        i + 1,
        close,
        (pendingSign * outerSign) as 1 | -1,
      );
      if (!sub) return null;
      let next = close + 1;
      const expr = tryAbsorbExponent(tokens, next);
      if (expr) {
        for (const a of sub) a.exponent *= expr.exp;
        next = expr.next;
      }
      atoms.push(...sub);
      firstDone = true;
      pendingSign = 1;
      i = next;
    } else if (
      t instanceof OperatorToken &&
      (t.value === "*" || t.value === "/")
    ) {
      if (!firstDone) return null;
      pendingSign = t.value === "*" ? 1 : -1;
      i += 1;
    } else {
      return null;
    }
  }
  return atoms;
}

function parseUnitFactor(
  tokens: TokenType[],
  i: number,
  sign: 1 | -1,
): { atoms: UnitAtom[]; next: number } | null {
  if (i >= tokens.length) return null;
  const t = tokens[i];
  if (t instanceof UnitToken && t.unitdata.type !== UnitTypes.POSTFIX) {
    let exp = sign;
    let next = i + 1;
    const expr = tryAbsorbExponent(tokens, next);
    if (expr) {
      exp *= expr.exp;
      next = expr.next;
    }
    return { atoms: [{ unit: t, exponent: exp }], next };
  }
  if (t instanceof ControllerToken && t.basetype === "BRAC_START") {
    const close = findMatchingClose(tokens, i);
    if (close < 0) return null;
    const inner = parseUnitGroupInterior(tokens, i + 1, close, sign);
    if (!inner) return null;
    let next = close + 1;
    const expr = tryAbsorbExponent(tokens, next);
    if (expr) {
      for (const a of inner) a.exponent *= expr.exp;
      next = expr.next;
    }
    return { atoms: inner, next };
  }
  return null;
}

// Given the first absorbed UnitToken at index `startIndex`, greedily consume a
// trailing compound expression (`* / ^` chains over UnitTokens and
// unit-only paren groups). Returns the final UnitToken (the original if
// nothing was absorbed, or a compound built from the merged atoms) plus the
// number of *additional* tokens consumed beyond the first unit. The parser
// loop adds this to parseIndex; the loop's own +1 covers the first unit.
function absorbCompoundUnit(
  tokens: TokenType[],
  startIndex: number,
  firstUnit: UnitToken,
): { unit: UnitToken; advance: number } {
  const atoms: UnitAtom[] = [{ unit: firstUnit, exponent: 1 }];
  let i = startIndex + 1;

  const firstExp = tryAbsorbExponent(tokens, i);
  if (firstExp) {
    atoms[0].exponent *= firstExp.exp;
    i = firstExp.next;
  }

  while (i < tokens.length) {
    const t = tokens[i];
    if (!(t instanceof OperatorToken) || (t.value !== "*" && t.value !== "/"))
      break;
    const sign: 1 | -1 = t.value === "*" ? 1 : -1;
    const nextIdx = i + 1;
    if (!isUnitLikeStart(tokens, nextIdx)) break;
    const factor = parseUnitFactor(tokens, nextIdx, sign);
    if (!factor) break;
    atoms.push(...factor.atoms);
    i = factor.next;
  }

  const advance = i - startIndex - 1;

  // Single atom with exponent 1 → the original simple unit
  if (atoms.length === 1 && atoms[0].exponent === 1) {
    return { unit: firstUnit, advance };
  }

  // Merge same-name atoms (e.g., m^2 * m → m^3)
  const merged = mergeAtoms(atoms);
  if (merged.length === 0) {
    // Degenerate — full cancellation. Caller should treat as compound
    // anyway so dim comparisons stay consistent.
    return { unit: makeCompoundUnit([], firstUnit.originalValue), advance };
  }
  if (merged.length === 1 && merged[0].exponent === 1) {
    return { unit: merged[0].unit, advance };
  }
  return { unit: makeCompoundUnit(merged), advance };
}

// Same UnitToken in every observable dimension we care about for the eager-
// conversion decision. `dim` is checked by the caller before this fires.
function sameUnitIdentity(a: UnitToken, b: UnitToken): boolean {
  return (
    a.value === b.value && a.factor === b.factor && a.siFactor === b.siFactor
  );
}

// Reject TEMPERATURE inside compounds unless it's a linear scale
// (kelvin/rankine). Reject CURRENCY inside compounds — runtime factors
// would have to flow through composition and that's out of scope for v1.
function checkCompoundOperands(unit: UnitToken): void {
  if (!unit.components) return;
  for (const atom of unit.components) {
    const t = atom.unit.unitdata.type;
    if (t === UnitTypes.TEMPERATURE) {
      const v = atom.unit.value;
      if (v !== "kelvin" && v !== "rankine") throw new UserError(3908);
    }
    if (t === UnitTypes.CURRENCY) throw new UserError(3909);
  }
}

// ---------------------------------------------------------------------------
// State classes
// ---------------------------------------------------------------------------

class FreshParseState {
  static handleOperand(
    parseTree: ParseTreeType,
    operand: OperandToken,
  ): ParserStateTypes {
    parseTree.head = operand;
    if (operand instanceof NumberToken && !parseTree.exprUnit && operand.unit)
      parseTree.exprUnit = operand.unit;
    return CompleteState;
  }

  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    parseTree.head = colorToken;
    return CompleteState;
  }

  static handleBoolean(
    parseTree: ParseTreeType,
    booleanToken: BooleanToken,
  ): ParserStateTypes {
    parseTree.head = booleanToken;
    return CompleteState;
  }

  static handleIp(
    parseTree: ParseTreeType,
    ipToken: IpToken,
  ): ParserStateTypes {
    parseTree.head = ipToken;
    return CompleteState;
  }

  static handlePoint(
    parseTree: ParseTreeType,
    pointToken: PointToken,
  ): ParserStateTypes {
    parseTree.head = pointToken;
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
    if (isUnaryPrefix(operatorToken)) {
      parseTree.head = operatorToken;
      return PreNumberState;
    }
    if (!operatorToken.shape.prenumber) {
      parseTree.head = operatorToken;
      parseTree.currentpt = operatorToken;
      return NeedNumberState;
    }
    throw new UserError(202);
  }

  static handleUnit(
    parseTree: ParseTreeType,
    unitToken: UnitToken,
    _tokens: TokenType[],
    _index: number,
  ): HandleUnitResult {
    if (unitToken.unitdata.type === UnitTypes.CITY) {
      parseTree.head = unitToken;
      return { state: CompleteState, advance: 0 };
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

  // A `@seed` literal only ever appears as a function argument, where each
  // comma-segment is parsed in its own fresh sub-tree. Carry it out as the head
  // so the sub-parse returns it cleanly; the parent FunctionState then inserts
  // it as the call's trailing arg (see FunctionState.handleSeed).
  static handleSeed(
    parseTree: ParseTreeType,
    seedToken: SeedToken,
  ): ParserStateTypes {
    parseTree.head = seedToken;
    return CompleteState;
  }
}

class CompleteState {
  static handleSeed(): ParserStateTypes {
    throw new UserError(240);
  }

  static handleOperand(
    parseTree: ParseTreeType,
    operand: OperandToken,
  ): ParserStateTypes {
    // Walk the right spine to the trailing operand.
    let tempPt: TokenType = parseTree.head!;
    let parentPt: TokenType = tempPt;
    while (tempPt instanceof OperatorToken && tempPt.right) {
      parentPt = tempPt;
      tempPt = tempPt.right;
    }

    const graft = (op: OperatorToken) => {
      op.left = tempPt;
      op.right = operand;
      if (parentPt === tempPt) parseTree.head = op;
      else if (parentPt instanceof OperatorToken) parentPt.right = op;
      else throw new UnhandledError(0);
    };

    // Implicit multiplication: juxtaposed operands where either side is symbolic
    // or complex (`2x`, `6i`, `(x+1)(x+2)`). Precedence sorts itself out — `*`
    // grafts at the tail and later operators rebalance via the precedence walk.
    if (isMulJuxtapose(operand) || isMulJuxtapose(tempPt)) {
      const mulToken = tokenFactory("*", TokenBaseType.STRING);
      if (!(mulToken instanceof OperatorToken)) throw new UnhandledError(0);
      graft(mulToken);
      return CompleteState;
    }

    // Otherwise: implicit `+` between adjacent unit quantities (`10 meter 30
    // cm`). Only when a unit context exists, so bare `10 20 30` does not
    // silently become `60`.
    if (!parseTree.exprUnit) throw new UserError(223);
    if (!(tempPt instanceof NumberToken)) throw new UnhandledError(0);
    if (!(operand instanceof NumberToken)) throw new UnhandledError(0);
    const addToken = tokenFactory("+", TokenBaseType.STRING);
    if (!(addToken instanceof OperatorToken)) throw new UnhandledError(0);
    graft(addToken);
    return CompleteState;
  }

  static handleColor(
    _parseTree: ParseTreeType,
    _colorToken: ColorToken,
  ): ParserStateTypes {
    throw new UnhandledError(0);
  }

  static handleBoolean(
    _parseTree: ParseTreeType,
    _booleanToken: BooleanToken,
  ): ParserStateTypes {
    throw new UnhandledError(0);
  }

  static handleIp(
    _parseTree: ParseTreeType,
    _ipToken: IpToken,
  ): ParserStateTypes {
    throw new UnhandledError(0);
  }

  static handlePoint(
    _parseTree: ParseTreeType,
    _pointToken: PointToken,
  ): ParserStateTypes {
    throw new UnhandledError(0);
  }

  static handleDate(
    _parseTree: ParseTreeType,
    _dateToken: DateToken,
  ): ParserStateTypes {
    throw new UnhandledError(0);
  }

  static handleOperator(
    parseTree: ParseTreeType,
    operatorToken: OperatorToken,
  ): ParserStateTypes {
    if (parseTree.exprUnit === undefined) parseTree.exprUnit = null;
    if (operatorToken.shape.prenumber || operatorToken.shape.prestring) {
      let walker: TokenType = parseTree.head!;
      const opStack: OperatorToken[] = [];
      while (walker instanceof OperatorToken) {
        opStack.push(walker);
        if (!walker.right) break;
        walker = walker.right;
      }
      let target: OperatorToken | undefined = opStack.pop();
      while (target && operatorToken.precedence >= target.precedence)
        target = opStack.pop();

      if (target) {
        operatorToken.left = target.right;
        target.right = operatorToken;
      } else {
        operatorToken.left = parseTree.head!;
        parseTree.head = operatorToken;
      }

      if (operatorToken.shape.postnumber) {
        parseTree.currentpt = operatorToken;
        return NeedNumberState;
      }
      if (operatorToken.shape.postunit) {
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
    tokens: TokenType[],
    index: number,
  ): Promise<HandleUnitResult> {
    let tempPt: TokenType = parseTree.head!;
    while (tempPt instanceof OperatorToken && tempPt.right) {
      tempPt = tempPt.right;
    }

    if (!(tempPt instanceof NumberToken)) throw new UnhandledError(201);
    if (tempPt.unit !== null) throw new UserError(206);

    if (unitToken.unitdata.type === UnitTypes.POSTFIX) {
      tempPt.value = (tempPt.toNumber() * unitToken.factor).toString();
      return { state: CompleteState, advance: 0 };
    }

    const { unit: finalUnit, advance } = absorbCompoundUnit(
      tokens,
      index,
      unitToken,
    );
    if (finalUnit.isCompound) checkCompoundOperands(finalUnit);

    tempPt.unit = finalUnit;
    if (!parseTree.exprUnit) {
      parseTree.exprUnit = finalUnit;
      return { state: CompleteState, advance };
    }
    if (dimEquals(parseTree.exprUnit.dim, finalUnit.dim)) {
      // Same dim — normalize tempPt to exprUnit's scale so downstream
      // arithmetic doesn't have to think about cross-prefix / cross-scale
      // conversion. Identity is value + factor + siFactor (which together
      // distinguish km from m, rankine from fahrenheit, km/hour from m/s).
      if (!sameUnitIdentity(parseTree.exprUnit, finalUnit)) {
        const newPt = await new ProcessConversions(tempPt)
          .to(parseTree.exprUnit)
          .convert();
        tempPt.value = newPt.value;
        tempPt.unit = newPt instanceof NumberToken ? newPt.unit : undefined;
      }
      return { state: CompleteState, advance };
    }
    // Different dim — leave for the operator to decide. `+`/`-` will throw
    // dim-mismatch inside add/subtract; `*`/`/`/`^` compose freely.
    return { state: CompleteState, advance };
  }

  static handleFunction(): ParserStateTypes {
    throw new UserError(207);
  }

  static handleString(): ParserStateTypes {
    throw new UserError(207);
  }
}

// In NeedNumberState the currentpt was set when the parent operator was
// installed, so it must be an OperatorToken — narrow once.
function expectOperator(parseTree: ParseTreeType): OperatorToken {
  if (!(parseTree.currentpt instanceof OperatorToken))
    throw new UnhandledError(0);
  return parseTree.currentpt;
}

class NeedNumberState {
  static handleSeed(): ParserStateTypes {
    throw new UserError(240);
  }

  static async handleOperand(
    parseTree: ParseTreeType,
    operand: OperandToken,
  ): Promise<ParserStateTypes> {
    if (operand instanceof NumberToken) {
      if (!parseTree.exprUnit && operand.unit)
        parseTree.exprUnit = operand.unit;
      else if (parseTree.exprUnit && operand.unit) {
        if (dimEquals(parseTree.exprUnit.dim, operand.unit.dim)) {
          if (!sameUnitIdentity(parseTree.exprUnit, operand.unit)) {
            const newPt = await new ProcessConversions(operand)
              .to(parseTree.exprUnit)
              .convert();
            operand.value = newPt.value;
            operand.unit =
              newPt instanceof NumberToken ? newPt.unit : undefined;
          }
        }
        // Different dim — keep as-is for operators to resolve.
      }
    }
    expectOperator(parseTree).right = operand;
    return CompleteState;
  }

  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    expectOperator(parseTree).right = colorToken;
    return CompleteState;
  }

  static handleBoolean(
    parseTree: ParseTreeType,
    booleanToken: BooleanToken,
  ): ParserStateTypes {
    expectOperator(parseTree).right = booleanToken;
    return CompleteState;
  }

  static handleIp(
    parseTree: ParseTreeType,
    ipToken: IpToken,
  ): ParserStateTypes {
    expectOperator(parseTree).right = ipToken;
    return CompleteState;
  }

  static handlePoint(
    parseTree: ParseTreeType,
    pointToken: PointToken,
  ): ParserStateTypes {
    expectOperator(parseTree).right = pointToken;
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
    expectOperator(parseTree).right = dateToken;
    return CompleteState;
  }

  static handleOperator(
    parseTree: ParseTreeType,
    operatorToken: OperatorToken,
  ): ParserStateTypes {
    if (isUnaryPrefix(operatorToken)) {
      expectOperator(parseTree).right = operatorToken;
      return PreNumberState;
    }
    if (!operatorToken.shape.prenumber) {
      // A prefix operator (sin/cos/log/…) appearing where an RHS is expected
      // is a sub-expression of the pending operator — attach it as that
      // operator's right child and descend into it, mirroring handleFunction
      // below. (Overwriting parseTree.head here would discard the pending
      // operator and its left operand, e.g. `2 / log 7` → `log 7`.)
      expectOperator(parseTree).right = operatorToken;
      parseTree.currentpt = operatorToken;
      return NeedNumberState;
    }
    throw new UserError(208);
  }

  static handleUnit(
    parseTree: ParseTreeType,
    unitToken: UnitToken,
    _tokens: TokenType[],
    _index: number,
  ): HandleUnitResult {
    if (unitToken.unitdata.type === UnitTypes.CITY) {
      expectOperator(parseTree).right = unitToken;
      return { state: CompleteState, advance: 0 };
    }
    throw new UserError(210);
  }

  static handleFunction(
    parseTree: ParseTreeType,
    functionToken: FunctionToken,
  ): ParserStateTypes {
    expectOperator(parseTree).right = functionToken;
    parseTree.currentpt = functionToken;
    return FunctionState;
  }

  static handleString(): ParserStateTypes {
    throw new UserError(207);
  }
}

class NeedUnitState {
  static handleSeed(): ParserStateTypes {
    throw new UserError(240);
  }

  static handleOperand(): ParserStateTypes {
    throw new UserError(211);
  }

  static handleColor(
    _parseTree: ParseTreeType,
    _colorToken: ColorToken,
  ): ParserStateTypes {
    throw new UserError(211);
  }

  static handleBoolean(
    _parseTree: ParseTreeType,
    _booleanToken: BooleanToken,
  ): ParserStateTypes {
    throw new UserError(211);
  }

  static handleIp(
    _parseTree: ParseTreeType,
    _ipToken: IpToken,
  ): ParserStateTypes {
    throw new UserError(211);
  }

  static handlePoint(
    _parseTree: ParseTreeType,
    _pointToken: PointToken,
  ): ParserStateTypes {
    throw new UserError(211);
  }

  static handleOperator(): ParserStateTypes {
    throw new UserError(212);
  }

  static handleUnit(
    parseTree: ParseTreeType,
    unitToken: UnitToken,
    tokens: TokenType[],
    index: number,
  ): HandleUnitResult {
    const { unit: finalUnit, advance } = absorbCompoundUnit(
      tokens,
      index,
      unitToken,
    );
    if (finalUnit.isCompound) checkCompoundOperands(finalUnit);
    parseTree.currentpt?.insertChild(finalUnit);
    return { state: CompleteState, advance };
  }

  // A coordinate keyword after `to` (`to polar`, `to distance`, …) is a
  // conversion target, not a function call. Stash it as a leaf marker on the
  // `to` operator (lands in its `right` slot since `left` is already filled);
  // the `to` raw func reads it and runs the conversion. Any other function here
  // is a syntax error.
  static handleFunction(
    parseTree: ParseTreeType,
    functionToken: FunctionToken,
  ): ParserStateTypes {
    if (!isCoordConverter(functionToken.value)) throw new UserError(214);
    parseTree.currentpt?.insertChild(new CoordTargetToken(functionToken.value));
    return CompleteState;
  }

  static handleString(): ParserStateTypes {
    throw new UserError(207);
  }

  static handleDate(): ParserStateTypes {
    throw new UserError(207);
  }
}

class FunctionState {
  static async handleOperand(
    parseTree: ParseTreeType,
    operand: OperandToken,
  ): Promise<ParserStateTypes> {
    if (!(parseTree.currentpt instanceof FunctionToken))
      throw new UnhandledError(1234);
    if (!parseTree.currentpt?.isRaw && operand instanceof NumberToken) {
      if (!parseTree.exprUnit && operand.unit)
        parseTree.exprUnit = operand.unit;
      else if (parseTree.exprUnit && operand.unit) {
        if (dimEquals(parseTree.exprUnit.dim, operand.unit.dim)) {
          if (!sameUnitIdentity(parseTree.exprUnit, operand.unit)) {
            const newPt = await new ProcessConversions(operand)
              .to(parseTree.exprUnit)
              .convert();
            operand.value = newPt.value;
            operand.unit =
              newPt instanceof NumberToken ? newPt.unit : undefined;
          }
        }
      }
    }
    parseTree.currentpt?.insertChild(operand);
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

  static handleBoolean(
    parseTree: ParseTreeType,
    booleanToken: BooleanToken,
  ): ParserStateTypes {
    if (!(parseTree.currentpt instanceof FunctionToken))
      throw new UnhandledError(1234);
    parseTree.currentpt?.insertChild(booleanToken);
    return FunctionState;
  }

  static handleIp(
    parseTree: ParseTreeType,
    ipToken: IpToken,
  ): ParserStateTypes {
    if (!(parseTree.currentpt instanceof FunctionToken))
      throw new UnhandledError(1234);
    parseTree.currentpt?.insertChild(ipToken);
    return FunctionState;
  }

  static handlePoint(
    parseTree: ParseTreeType,
    pointToken: PointToken,
  ): ParserStateTypes {
    if (!(parseTree.currentpt instanceof FunctionToken))
      throw new UnhandledError(1234);
    parseTree.currentpt?.insertChild(pointToken);
    return FunctionState;
  }

  // The seed rides as the call's trailing argument; the impure functions read
  // `.seed` off it and drop it (see random/uuid in function.ts).
  static handleSeed(
    parseTree: ParseTreeType,
    seedToken: SeedToken,
  ): ParserStateTypes {
    if (!(parseTree.currentpt instanceof FunctionToken))
      throw new UnhandledError(1234);
    parseTree.currentpt?.insertChild(seedToken);
    return FunctionState;
  }

  static handleOperator(): ParserStateTypes {
    throw new UserError(215);
  }

  static handleUnit(): HandleUnitResult {
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
  static handleSeed(): ParserStateTypes {
    throw new UserError(240);
  }

  static handleOperand(
    parseTree: ParseTreeType,
    operand: OperandToken,
  ): ParserStateTypes {
    // Apply unary minus to the operand. Numbers negate in place; complex negates
    // both parts; a symbol/sub-expression becomes `(-1) * operand`.
    const negate = (): TokenType => {
      if (operand instanceof NumberToken) {
        operand.value = (operand.toNumber() * -1).toString();
        return operand;
      }
      if (operand instanceof ComplexToken) {
        return new ComplexToken(-operand.re, -operand.im);
      }
      const mulToken = tokenFactory("*", TokenBaseType.STRING);
      const minusOne = tokenFactory("-1", TokenBaseType.DECIMAL);
      if (!(mulToken instanceof OperatorToken)) throw new UnhandledError(0);
      mulToken.left = minusOne;
      mulToken.right = operand;
      return mulToken;
    };

    if (parseTree.currentpt === null) {
      if (parseTree.head!.value === "-") parseTree.head = negate();
    } else {
      const cp = expectOperator(parseTree);
      if (cp.right?.value === "-") cp.right = negate();
    }
    return CompleteState;
  }
  static handleColor(
    _parseTree: ParseTreeType,
    _colorToken: ColorToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handleBoolean(
    _parseTree: ParseTreeType,
    _booleanToken: BooleanToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handleIp(
    _parseTree: ParseTreeType,
    _ipToken: IpToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handlePoint(
    _parseTree: ParseTreeType,
    _pointToken: PointToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handleOperator(): ParserStateTypes {
    throw new UserError(219);
  }

  static handleUnit(): HandleUnitResult {
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
  static handleSeed(): ParserStateTypes {
    throw new UserError(240);
  }

  static handleOperand(
    parseTree: ParseTreeType,
    operand: OperandToken,
  ): ParserStateTypes {
    // Digit grouping (`1,234`) only ever combines plain numbers.
    if (!(operand instanceof NumberToken)) throw new UnhandledError(0);
    let tempPt: TokenType = parseTree.head!;
    let parentPt: TokenType = tempPt;
    while (tempPt instanceof OperatorToken && tempPt.right) {
      parentPt = tempPt;
      tempPt = tempPt.right;
    }
    if (tempPt instanceof NumberToken) {
      const newValue = tokenFactory(
        `${tempPt.value}${operand.value}`,
        tempPt.numbertype,
      ) as NumberToken;

      if (parentPt === tempPt) parseTree.head = newValue;
      else if (parentPt instanceof OperatorToken) parentPt.right = newValue;
      else throw new UnhandledError(0);

      // The combined NumberToken is the new tail; we leave currentpt unchanged
      // (CompleteState walks the spine via head anyway).
      return CompleteState;
    }
    throw new UserError(207);
  }
  static handleColor(
    _parseTree: ParseTreeType,
    _colorToken: ColorToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handleBoolean(
    _parseTree: ParseTreeType,
    _booleanToken: BooleanToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handleIp(
    _parseTree: ParseTreeType,
    _ipToken: IpToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handlePoint(
    _parseTree: ParseTreeType,
    _pointToken: PointToken,
  ): ParserStateTypes {
    throw new UserError(207);
  }
  static handleOperator(): ParserStateTypes {
    throw new UserError(219);
  }

  static handleUnit(): HandleUnitResult {
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
  CombineNumberState,
  CompleteState,
  FreshParseState,
  FunctionState,
  NeedNumberState,
  NeedUnitState,
};
