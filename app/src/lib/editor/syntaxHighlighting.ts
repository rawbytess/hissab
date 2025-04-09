import { Tag } from "@lezer/highlight";
import { StreamLanguage, StringStream, TagStyle } from "@codemirror/language";
import { doLex } from "engine";
import pkg from "lodash";
const { sortedIndexBy } = pkg;

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
    { tag: hissabTags.undefinedToken, color: isDark ? "#999999" : "#999999" },
    { tag: hissabTags.stringToken, color: isDark ? "#f984e1" : "#999999" },
    {
      tag: hissabTags.comment,
      color: isDark ? "#93A1A1" : "#93A1A1",
      fontStyle: "italic",
    },
    {
      tag: hissabTags.prompt,
      color: isDark ? "#cdcdcd" : "#754103",
      class: "cm-prompt",
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
  comment: Tag.define(),
  prompt: Tag.define(),
};

export function getStreamLanguage(ed: any) {
  return StreamLanguage.define({
    token(stream: StringStream) {
      if (stream.match("ai ")) {
        stream.skipToEnd();
        return "prompt";
      }
      if (stream.match("//")) {
        stream.skipToEnd();
        return "comment";
      }
      const tokens = doLex(stream.string, ed.variables, 0);
      const currTokens: CurrTokensType[] = [];
      for (const token of tokens) {
        currTokens.splice(
          sortedIndexBy(
            currTokens,
            {
              token: token.originalValue,
              style: token.instanceName,
              size: -token.originalValue.length,
            },
            "size",
          ),
          0,
          {
            token: token.originalValue,
            style: token.instanceName,
            size: -token.originalValue.length,
          },
        );
      }
      for (const tkn of currTokens) {
        if (stream.match("total")) return "variableToken";
        if (stream.match("prev")) return "variableToken";
        if (stream.match(/[лв₺₴₪₦č£₾ł₽元₹¥$₱৳₩₫฿₿ɱŁΞ€]/))
          return "operatorToken";
        if (stream.match(tkn.token)) return tkn.style;
      }
      stream.next();
      return null;
    },
    tokenTable: hissabTags,
  });
}

export type CurrTokensType = {
  token: string;
  style: string;
  size: number;
};
