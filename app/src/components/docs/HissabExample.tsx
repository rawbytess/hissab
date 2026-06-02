import {
  doLex,
  doParse,
  type TokenType,
  type Variables,
} from "@rawbytes/hissab";
import { useEffect, useState } from "react";
import { tokenStyle } from "@/lib/editor/syntaxHighlighting.ts";
import {
  calculatePrev,
  calculateTotal,
} from "../../../../lib/calculateExpressions.ts";

// Dark-theme token colours, mirroring the `isDark` branch of
// HissabHighlightStyle() in src/lib/editor/syntaxHighlighting.ts. The app
// shell is dark-only, so a single palette is enough here.
const TOKEN_COLORS: Record<string, string> = {
  numberToken: "#00ff71",
  unitToken: "#e7d81a",
  dateToken: "#e1f05d",
  functionToken: "#32c5ff",
  operatorToken: "#e88b00",
  controllerToken: "#a3a2f6",
  variableToken: "#f984e1",
  colorToken: "#84f9ef",
  VariableNameToken: "#f984e1",
  undefinedToken: "#f984e1",
  stringToken: "#d4f984",
};

interface Span {
  // Stable key derived from the span's offset within its line.
  key: string;
  text: string;
  color?: string;
}

interface ExampleLine {
  key: string;
  spans: Span[];
  result: string;
  error: boolean;
}

// Split a source line into coloured spans by walking the lexer tokens and
// emitting the gaps between them verbatim (same strategy as the engine's
// CodeMirror highlighter, but rendered as plain React spans).
function highlight(line: string, tokens: TokenType[]): Span[] {
  const spans: Span[] = [];
  let cursor = 0;
  for (const token of tokens) {
    const value = token.originalValue;
    const start = line.indexOf(value, cursor);
    if (start < 0) continue;
    if (start > cursor)
      spans.push({ key: `g${cursor}`, text: line.slice(cursor, start) });
    spans.push({
      key: `t${start}`,
      text: value,
      color: TOKEN_COLORS[tokenStyle(token)],
    });
    cursor = start + value.length;
  }
  if (cursor < line.length)
    spans.push({ key: `g${cursor}`, text: line.slice(cursor) });
  return spans;
}

interface HissabExampleProps {
  /** Newline-separated Hissab expressions. */
  text: string;
}

/**
 * A live, read-only example block: each line is evaluated through the engine
 * exactly like the editor (with line/prev/total variables threaded), then
 * shown as a syntax-highlighted expression next to its computed result.
 */
export function HissabExample({ text }: HissabExampleProps) {
  const [lines, setLines] = useState<ExampleLine[]>([]);

  useEffect(() => {
    let cancelled = false;

    void (async () => {
      const variables: Variables = {};
      const computed: ExampleLine[] = [];
      const sources = text.split("\n");

      for (const [index, source] of sources.entries()) {
        const line = source.split("//")[0].trim();
        if (!line) continue;

        let spans: Span[] = [{ key: "g0", text: line }];
        let result = "";
        let error = false;
        try {
          await calculateTotal(index + 1, variables);
          calculatePrev(index + 1, variables);
          const tokens = doLex(line, variables, index + 1);
          spans = highlight(line, tokens);
          const parsed = await doParse(tokens);
          result = parsed.result;
          if (parsed.meta.variableName)
            variables[parsed.meta.variableName] = parsed.resultToken;
          variables[`line${index + 1}`] = parsed.resultToken;
          variables[`l${index + 1}`] = parsed.resultToken;
        } catch {
          error = true;
        }
        computed.push({ key: `l${index}`, spans, result, error });
      }

      if (!cancelled) setLines(computed);
    })();

    return () => {
      cancelled = true;
    };
  }, [text]);

  return (
    <div className="hx">
      {lines.map((line) => (
        <div className="hx-line" key={line.key}>
          <code className="hx-expr">
            {line.spans.map((span) => (
              <span
                key={span.key}
                style={span.color ? { color: span.color } : undefined}
              >
                {span.text}
              </span>
            ))}
          </code>
          {!line.error && line.result !== "" && (
            <span className="hx-result">{line.result}</span>
          )}
        </div>
      ))}
    </div>
  );
}
