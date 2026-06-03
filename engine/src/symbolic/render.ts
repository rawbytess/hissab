// Render an Expr back to a human string. Assumes a (mostly) canonical Expr as
// produced by simplify(): an Add of monomial terms, each a Const or a Mul of a
// numeric coefficient and atom/pow factors. Products render by juxtaposition
// (`2x^2`, `xy`), sums fold signs (`-2x^2 + 10`).

import type { Expr } from "./expr";
import { formatRational } from "./util";

// A factor inside a product. Sums (and bare negative constants) need parens so
// `(x + 1)^-1` and `(x + 1)y` stay unambiguous.
function renderFactor(e: Expr): string {
  if (e.kind === "add") return `(${render(e)})`;
  if (e.kind === "const" && e.value < 0) return `(${formatRational(e.value)})`;
  return render(e);
}

function renderProduct(factors: Expr[]): string {
  let coeff = 1;
  const rest: Expr[] = [];
  for (const f of factors) {
    if (f.kind === "const") coeff *= f.value;
    else rest.push(f);
  }
  if (rest.length === 0) return formatRational(coeff);
  const body = rest.map(renderFactor).join("");
  if (coeff === 1) return body;
  if (coeff === -1) return `-${body}`;
  // Separate the coefficient with a space when gluing would be ambiguous — a
  // fraction (`1/3 x`, not `1/(3x)`) or a body that starts with a digit (a
  // numeric-base power like `2^x`, so `ln(2)·2^x` reads `0.6931 2^x`, not
  // `0.69312^x`). An integer coefficient on a symbol stays glued (`2x`).
  const c = formatRational(coeff);
  const needSpace = c.includes("/") || /^[0-9.]/.test(body);
  return needSpace ? `${c} ${body}` : `${c}${body}`;
}

export function render(e: Expr): string {
  switch (e.kind) {
    case "const":
      return formatRational(e.value);
    case "sym":
      return e.name;
    case "mul":
      return renderProduct(e.factors);
    case "pow": {
      const base = renderFactor(e.base);
      const exp =
        e.exp.kind === "const" && e.exp.value >= 0
          ? formatRational(e.exp.value)
          : `(${render(e.exp)})`;
      return `${base}^${exp}`;
    }
    case "add": {
      let out = "";
      for (let i = 0; i < e.terms.length; i++) {
        const s = render(e.terms[i]);
        if (i === 0) out = s;
        else if (s.startsWith("-")) out += ` - ${s.slice(1)}`;
        else out += ` + ${s}`;
      }
      return out;
    }
    case "func":
      return `${e.name}(${e.args.map(render).join(", ")})`;
    case "equation":
      return `${render(e.lhs)} = ${render(e.rhs)}`;
    case "derivative":
      return `d/d${e.variable}(${render(e.body)})`;
    case "integral":
      return e.lower && e.upper
        ? `integral(${render(e.body)}, ${e.variable}, ${render(e.lower)}, ${render(e.upper)})`
        : `integral(${render(e.body)}, ${e.variable})`;
    case "limit":
      return `limit(${render(e.body)}, ${e.variable} -> ${render(e.point)})`;
    default:
      return "";
  }
}

export const exprToString = render;
