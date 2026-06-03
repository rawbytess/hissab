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
    ".cm-result-fresh": {
      color: themeColors.resultText,
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
