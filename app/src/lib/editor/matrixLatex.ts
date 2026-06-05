// Render a Hissab matrix literal (`[1 2 3, 4 5 6]` — space = column,
// comma/semicolon = row) as KaTeX `bmatrix` LaTeX. Shared by the editor's
// reveal-on-cursor input rendering (mathDecorations) and the result widget
// (getResults), so a matrix shows as a real 2-D matrix instead of bracketed
// text. Returns null for anything that isn't a rectangular numeric matrix, so
// half-typed or invalid literals fall back to plain text.

export interface MatrixSpan {
  from: number;
  to: number;
}

export function matrixToLatex(literal: string): string | null {
  if (literal[0] !== "[" || literal[literal.length - 1] !== "]") return null;
  const inner = literal.slice(1, -1).trim();
  if (!inner) return null;
  const rows = inner
    .split(/[,;]/)
    .map((r) =>
      r
        .trim()
        .split(/\s+/)
        .filter((c) => c.length > 0),
    );
  const cols = rows[0].length;
  if (cols === 0) return null;
  for (const row of rows) {
    if (row.length !== cols) return null; // ragged — not a matrix
    for (const cell of row) if (!Number.isFinite(Number(cell))) return null;
  }
  const body = rows.map((r) => r.join(" & ")).join(" \\\\ ");
  return `\\begin{bmatrix}${body}\\end{bmatrix}`;
}

// Find balanced top-level `[...]` matrix literals in a line of code (offsets
// relative to `code`). Nested `[` are depth-tracked so the outer literal is
// returned whole; unterminated `[` are skipped (still being typed).
export function findMatrixLiterals(code: string): MatrixSpan[] {
  const out: MatrixSpan[] = [];
  for (let i = 0; i < code.length; i++) {
    if (code[i] !== "[") continue;
    let depth = 0;
    let end = -1;
    for (let j = i; j < code.length; j++) {
      if (code[j] === "[") depth++;
      else if (code[j] === "]") {
        depth--;
        if (depth === 0) {
          end = j + 1;
          break;
        }
      }
    }
    if (end === -1) continue;
    out.push({ from: i, to: end });
    i = end - 1;
  }
  return out;
}
