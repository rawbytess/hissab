import { UnhandledError, UserError } from "../exceptions";
import { makeCompoundUnit, mergeAtoms } from "../tokens/compound";
import TokenBaseType, { type TokenType } from "../tokens/token_basetypes";
import tokenFactory from "../tokens/token_factory";
import {
  type ColorToken,
  ControllerToken,
  type DateToken,
  type expressionUnit,
  FunctionToken,
  NumberToken,
  OperatorToken,
  type StringToken,
  type UnitAtom,
  UnitToken,
  type VariableNameToken,
} from "../tokens/tokens";
import UnitTypes from "../types/unit_enum";
import { dimEquals } from "../types/unit_types";
import ProcessConversions from "../units_processor";
import type { ParseTreeType } from "./parsetree";

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
}

class CompleteState {
  static handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): ParserStateTypes {
    // Two operands written next to each other (e.g. `10 meter 30 cm`) get an
    // implicit `+`. We only allow this when a unit context exists, so compound
    // quantities work but bare `10 20 30` does not silently become `60`.
    if (!parseTree.exprUnit) throw new UserError(223);
    let tempPt: TokenType = parseTree.head!;
    let parentPt: TokenType = tempPt;
    while (tempPt instanceof OperatorToken && tempPt.right) {
      parentPt = tempPt;
      tempPt = tempPt.right;
    }
    if (!(tempPt instanceof NumberToken)) throw new UnhandledError(0);
    const addToken = tokenFactory("+", TokenBaseType.STRING);
    if (!(addToken instanceof OperatorToken)) throw new UnhandledError(0);

    addToken.left = tempPt;
    addToken.right = numberToken;
    if (parentPt === tempPt) parseTree.head = addToken;
    else if (parentPt instanceof OperatorToken) parentPt.right = addToken;
    else throw new UnhandledError(0);
    return CompleteState;
  }

  static handleColor(
    _parseTree: ParseTreeType,
    _colorToken: ColorToken,
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
  static async handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): Promise<ParserStateTypes> {
    if (!parseTree.exprUnit && numberToken.unit)
      parseTree.exprUnit = numberToken.unit;
    else if (parseTree.exprUnit && numberToken.unit) {
      if (dimEquals(parseTree.exprUnit.dim, numberToken.unit.dim)) {
        if (!sameUnitIdentity(parseTree.exprUnit, numberToken.unit)) {
          const newPt = await new ProcessConversions(numberToken)
            .to(parseTree.exprUnit)
            .convert();
          numberToken.value = newPt.value;
          numberToken.unit =
            newPt instanceof NumberToken ? newPt.unit : undefined;
        }
      }
      // Different dim — keep as-is for operators to resolve.
    }
    expectOperator(parseTree).right = numberToken;
    return CompleteState;
  }

  static handleColor(
    parseTree: ParseTreeType,
    colorToken: ColorToken,
  ): ParserStateTypes {
    expectOperator(parseTree).right = colorToken;
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
  static handleOperand(): ParserStateTypes {
    throw new UserError(211);
  }

  static handleColor(
    _parseTree: ParseTreeType,
    _colorToken: ColorToken,
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
        if (dimEquals(parseTree.exprUnit.dim, numberToken.unit.dim)) {
          if (!sameUnitIdentity(parseTree.exprUnit, numberToken.unit)) {
            const newPt = await new ProcessConversions(numberToken)
              .to(parseTree.exprUnit)
              .convert();
            numberToken.value = newPt.value;
            numberToken.unit =
              newPt instanceof NumberToken ? newPt.unit : undefined;
          }
        }
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
  static handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): ParserStateTypes {
    if (parseTree.currentpt === null) {
      if (parseTree.head!.value === "-") {
        numberToken.value = (numberToken.toNumber() * -1).toString();
        parseTree.head = numberToken;
      }
    } else {
      const cp = expectOperator(parseTree);
      const current = cp.right;
      if (current?.value === "-") {
        numberToken.value = (numberToken.toNumber() * -1).toString();
        cp.right = numberToken;
      }
    }
    return CompleteState;
  }
  static handleColor(
    _parseTree: ParseTreeType,
    _colorToken: ColorToken,
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
  static handleOperand(
    parseTree: ParseTreeType,
    numberToken: NumberToken,
  ): ParserStateTypes {
    let tempPt: TokenType = parseTree.head!;
    let parentPt: TokenType = tempPt;
    while (tempPt instanceof OperatorToken && tempPt.right) {
      parentPt = tempPt;
      tempPt = tempPt.right;
    }
    if (tempPt instanceof NumberToken) {
      const newValue = tokenFactory(
        `${tempPt.value}${numberToken.value}`,
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
