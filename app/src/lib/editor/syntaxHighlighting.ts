import {
  StreamLanguage,
  type StringStream,
  type TagStyle,
} from "@codemirror/language";
import { Tag } from "@lezer/highlight";
import { doLex } from "@rawbytes/hissab";
import { sortedIndexBy } from "lodash-es";

export function tokenStyle(token: { kind: string }): string {
  // `kind` is a stable string literal on each engine token, so it survives
  // production minification (unlike `constructor.name`, which gets mangled).
  return token.kind;
}

export function HissabHighlightStyle(isDark: boolean): TagStyle[] {
  return [
    { tag: hissabTags.numberToken, color: isDark ? "#00ff71" : "#096630" },
    { tag: hissabTags.unitToken, color: isDark ? "#e7d81a" : "#7e6f02" },
    { tag: hissabTags.dateToken, color: isDark ? "#e1f05d" : "#73004a" },
    { tag: hissabTags.functionToken, color: isDark ? "#32c5ff" : "#002575" },
    { tag: hissabTags.operatorToken, color: isDark ? "#e88b00" : "#0c6f85" },
    { tag: hissabTags.controllerToken, color: isDark ? "#a3a2f6" : "#030377" },
    { tag: hissabTags.variableToken, color: isDark ? "#f984e1" : "#754103" },
    { tag: hissabTags.colorToken, color: isDark ? "#84f9ef" : "#754103" },
    {
      tag: hissabTags.VariableNameToken,
      color: isDark ? "#f984e1" : "#754103",
      fontStyle: "bold",
    },
    { tag: hissabTags.undefinedToken, color: isDark ? "#f984e1" : "#999999" },
    { tag: hissabTags.stringToken, color: isDark ? "#D4F984" : "#999999" },
    // Recently added token kinds — kept bright/light so they read clearly on the
    // dark editor background (and dark enough on the light background).
    { tag: hissabTags.symbolToken, color: isDark ? "#d2a8ff" : "#8250df" },
    { tag: hissabTags.complexToken, color: isDark ? "#79c0ff" : "#0969da" },
    { tag: hissabTags.ipToken, color: isDark ? "#56d4dd" : "#0a7d75" },
    { tag: hissabTags.fractionToken, color: isDark ? "#ffa657" : "#9a5b00" },
    { tag: hissabTags.booleanToken, color: isDark ? "#ff7b72" : "#cf222e" },
    { tag: hissabTags.listToken, color: isDark ? "#ff9bce" : "#bf3989" },
    { tag: hissabTags.exprToken, color: isDark ? "#a5d6ff" : "#0550ae" },
    {
      tag: hissabTags.comment,
      color: isDark ? "#93A1A1" : "#93A1A1",
      fontStyle: "italic",
    },
  ];
}

export const hissabTags = {
  controllerToken: Tag.define(),
  functionToken: Tag.define(),
  numberToken: Tag.define(),
  operatorToken: Tag.define(),
  undefinedToken: Tag.define(),
  unitToken: Tag.define(),
  variableToken: Tag.define(),
  VariableNameToken: Tag.define(),
  dateToken: Tag.define(),
  stringToken: Tag.define(),
  colorToken: Tag.define(),
  symbolToken: Tag.define(),
  complexToken: Tag.define(),
  ipToken: Tag.define(),
  fractionToken: Tag.define(),
  booleanToken: Tag.define(),
  listToken: Tag.define(),
  exprToken: Tag.define(),
  comment: Tag.define(),
};

// TODO Optimize this function
export function getStreamLanguage() {
  return StreamLanguage.define({
    token(stream: StringStream) {
      if (stream.match("//")) {
        stream.skipToEnd();
        return "comment";
      }
      const tokens = doLex(stream.string, {}, 0);
      const currTokens: CurrTokensType[] = [];
      for (const token of tokens) {
        currTokens.splice(
          sortedIndexBy(
            currTokens,
            {
              token: token.originalValue,
              style: tokenStyle(token),
              size: -token.originalValue.length,
            },
            "size",
          ),
          0,
          {
            token: token.originalValue,
            style: tokenStyle(token),
            size: -token.originalValue.length,
          },
        );
      }
      for (const tkn of currTokens) {
        if (stream.match("total*")) return "variableToken";
        if (stream.match("prev*")) return "variableToken";
        if (stream.match(/[лв₺₴₪₦č£₾ł₽元₹¥$₱৳₩₫฿₿ɱŁΞ€]/))
          return "operatorToken";
        if (stream.match(tkn.token)) return tkn.style;
      }
      stream.next();
      return "stringToken";
    },
    tokenTable: hissabTags,
  });
}

export type CurrTokensType = {
  token: string;
  style: string;
  size: number;
};
