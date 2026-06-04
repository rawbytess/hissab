function themeConfig(isDark: boolean, editorBackground: string) {
  return {
    editorText: isDark ? "#c9c9c9" : "#525252",
    editorBackground: isDark ? editorBackground : "#efefef",
    gutterText: isDark ? "#575757" : "#b7b7b7",
    gutterBackground: isDark ? "#ffffff" : "#ffffff",
    bottomLine: isDark ? "1px solid #171717" : "1px solid #fafafa",
    resultText: isDark ? "#ffffff" : "#000000",
    resultStaleText: isDark ? "#d3d3d3" : "#444444",
    selectionBackground: isDark ? "#b3d4fc" : "#b3d4fc",
    font: "chillax",
    fontSmooth: "always",
  };
}

export function hissabTheme(
  isDark: boolean,
  editorBackground: string,
  borderRadius: string,
  innerPadding: string,
) {
  const themeColors = themeConfig(isDark, editorBackground);
  return {
    ".cm-gutterElement:nth-child(2)": {
      marginTop: "3px !important",
      borderTop: "none",
    },
    ".copied-div": {
      position: "absolute",
      top: 0,
      right: 0,
      backgroundColor: "#1c1c1c",
      padding: "0px 10px 0px 10px",
      color: "white",
      width: "max-content",
    },
    ".cm-content": {
      caretColor: themeColors.editorText,
      fontFamily: themeColors.font,
      display: "flex",
      flexDirection: "column",
      letterSpacing: "0.1em",
    },
    ".cm-result": {
      display: "flex",
      gap: "0.5em",
      float: "right",
      textAlign: "right",
      paddingRight: "10px",
      marginLeft: "4em",
      cursor: "pointer",
      position: "relative",
    },
    ".cm-sup": {
      fontSize: "0.75em",
      verticalAlign: "super",
    },
    ".cm-sup-caret": {
      fontSize: "0.6em",
      verticalAlign: "super",
      opacity: "0.45",
    },
    // Math widgets are replace-decorations, so they aren't syntax-highlighted and
    // would otherwise inherit the dim `.cm-line` text color. KaTeX renders in
    // `currentColor`, so set an explicit readable color here.
    ".cm-math-glyph": {
      fontStyle: "normal",
      color: themeColors.editorText,
    },
    ".cm-math-katex": {
      display: "inline-block",
      verticalAlign: "middle",
      color: themeColors.editorText,
    },
    ".cm-math-katex .katex": {
      fontSize: "1.05em",
    },
    // A number and its trailing unit(s) read as one entity (`50 million miles`).
    ".cm-quantity": {
      backgroundColor: isDark
        ? "rgba(231,216,26,0.12)"
        : "rgba(126,111,2,0.10)",
      padding: "0.08em 0.4em",
      borderRadius: "7px",
    },
    // IP addresses get a contiguous tinted background.
    ".cm-ip": {
      backgroundColor: isDark
        ? "rgba(86,212,221,0.14)"
        : "rgba(10,125,117,0.12)",
      padding: "0.08em 0.4em",
      borderRadius: "7px",
    },
    // Defined variables (definition + usages) — bold, with an explicit colour so
    // it overrides the dim "unrecognised word" hue an undefined identifier gets.
    // `!important` because this decoration mark overlaps the syntax-highlight
    // span and CM's nesting order between the two sources isn't guaranteed.
    ".cm-variable": {
      color: `${isDark ? "#f984e1" : "#754103"} !important`,
      fontWeight: "bold",
    },
    // Clickable colour swatch rendered before a colour literal.
    ".cm-color-swatch": {
      display: "inline-block",
      width: "0.72em",
      height: "0.72em",
      borderRadius: "50%",
      marginRight: "0.28em",
      verticalAlign: "baseline",
      border: "1px solid rgba(128,128,128,0.55)",
      boxSizing: "border-box",
      cursor: "pointer",
    },
    // Clickable calendar glyph rendered after a concrete date.
    ".cm-date-trigger": {
      cursor: "pointer",
      marginLeft: "0.28em",
      fontSize: "0.82em",
      opacity: "0.75",
      verticalAlign: "baseline",
    },
    // Depth-cycled bracket colours. `!important` for the same reason as
    // `.cm-variable` — these marks overlap the controllerToken highlight span.
    ".cm-bracket-d0": { color: `${isDark ? "#ffd700" : "#b58900"} !important` },
    ".cm-bracket-d1": { color: `${isDark ? "#da70d6" : "#a626a4"} !important` },
    ".cm-bracket-d2": { color: `${isDark ? "#56d4dd" : "#0a7d75"} !important` },
    ".cm-bracket-d3": { color: `${isDark ? "#ff9bce" : "#bf3989"} !important` },
    ".cm-bracket-d4": { color: `${isDark ? "#7ee787" : "#1a7f37"} !important` },
    // Hover tooltip naming the token under the cursor.
    ".cm-tooltip.cm-tooltip-hover": {
      border: "none",
      backgroundColor: "transparent",
    },
    ".cm-hover-type": {
      backgroundColor: isDark ? "#404040" : "#1c1c1c",
      color: "#ffffff",
      fontFamily: "Inter",
      fontSize: "0.72em",
      padding: "3px 7px",
      borderRadius: "6px",
      whiteSpace: "nowrap",
    },
    ".cm-result-fresh": {
      color: themeColors.resultText,
    },
    // Boolean result badge (true / false), colour-coded.
    ".cm-result-bool": {
      display: "inline-block",
      padding: "0 0.5em",
      borderRadius: "10px",
      fontSize: "0.82em",
      fontWeight: "600",
      lineHeight: "1.6",
      textTransform: "lowercase",
    },
    ".cm-result-bool.is-true": {
      color: isDark ? "#0b3d1e" : "#0a5c2a",
      backgroundColor: isDark ? "#56d364" : "#aceebb",
    },
    ".cm-result-bool.is-false": {
      color: isDark ? "#4d0f0b" : "#8a1c14",
      backgroundColor: isDark ? "#ff7b72" : "#ffc9c4",
    },
    // Coordinate-point result chip.
    ".cm-result-point": {
      display: "inline-block",
      padding: "0 0.5em",
      borderRadius: "6px",
      fontSize: "0.9em",
      border: isDark ? "1px solid #5fd7a7" : "1px solid #1f7a52",
      color: isDark ? "#5fd7a7" : "#1f7a52",
    },
    ".cm-result-stale": {
      color: themeColors.resultStaleText,
      fontStyle: "italic",
      fontWeight: "300",
      opacity: "50%",
    },
    "&.cm-focused .cm-cursor": {
      borderLeftColor: themeColors.editorText,
    },
    "&.cm-focused .cm-selectionBackground, ::selection": {
      backgroundColor: themeColors.selectionBackground,
    },
    ".cm-lineNumbers .cm-gutterElement": {
      textAlign: "center",
      padding: "0px 5px 0px 8px",
    },
    ".cm-gutters": {
      backgroundColor: themeColors.gutterBackground,
      color: themeColors.gutterText,
      border: "none",
      fontFamily: themeColors.font,
    },
    ".cm-gutter": {
      overflow: "inherit",
      justifyContent: "flex-start",
    },
    "&.cm-editor": {
      backgroundColor: themeColors.editorBackground,
      borderRadius,
      padding: innerPadding,
    },
    ".cm-line:first-child": {
      borderTop: "none",
    },
    ".cm-line": {
      color: themeColors.editorText,
      padding: "0 2px 0 6px",
      borderTop: themeColors.bottomLine,
    },
    ".cm-activeLine, .cm-editor": {
      backgroundColor: themeColors.editorBackground,
    },
    ".cm-activeLineGutter": {
      backgroundColor: themeColors.editorBackground,
    },
    ".cm-line,.cm-gutter, .cm-gutterElement": {
      backgroundColor: themeColors.editorBackground,
      color: themeColors.gutterText,
    },
    ".cm-gutterElement": {
      borderTop: themeColors.bottomLine,
    },
    "&.cm-editor.cm-focused": {
      outline: 0,
    },
    ".cm-scroller": {
      lineHeight: "2",
      overflow: "hidden",
      borderRadius: "inherit",
      zIndex: "0",
    },
    ".cm-tooltip.cm-tooltip-autocomplete": {
      backgroundColor: "#4a4a4a",
      border: "none",
      width: "auto",
      borderRadius: "5px",
    },
    ".cm-completionIcon": {
      display: "none",
    },
    ".cm-tooltip.cm-tooltip-autocomplete > ul > li": {
      padding: "5px",
      fontFamily: "chillax",
      display: "flex",
      flexDirection: "row",
      flexWrap: "nowrap",
      justifyContent: "space-between",
      borderTop: "1px solid #1c1c1c",
      fontSize: "smaller",
    },
    ".cm-completionDetail": {
      fontWeight: "300",
    },
    ".cm-completionLabel": {
      letterSpacing: "1px",
    },
    ".cm-completionMatchedText": {
      textDecoration: "none",
    },
    ".error-span": {
      display: "flex",
      alignItems: "center",
      gap: "5px",
      fontStyle: "normal",
      marginLeft: "4px",
      padding: "2px 3px",
      overflow: "hidden",
      color: "#dd0101",
    },

    ".error-span[aria-label]:hover::after": {
      content: "attr(aria-label)",
      position: "absolute",
      width: "max-content",
      backgroundColor: "#404040",
      color: "#ff0000",
      fontFamily: "Inter",
      fontSize: "0.7em",
      padding: "2px 5px",
      textAlign: "left",
      borderRadius: "6px",
      top: "0px",
      left: "0px",
      zIndex: "20",
      transform: "translateX(-100%)",
      transition: "transform 2s ease-in-out",
    },
  };
}
