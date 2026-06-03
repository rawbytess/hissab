// Render an Expr to a LaTeX string for display (KaTeX in the app editor and
// result widget). This mirrors render.ts (Expr → plain string) node-for-node,
// but emits LaTeX: powers become `^{...}`, products juxtapose, derivative /
// integral / limit get proper 2-D layout. It performs no math — it is purely a
// view over a (mostly canonical) Expr as produced by simplify() / capture.

import type { Expr } from "./expr";
import { formatNum as decimal, toFraction } from "./util";

// A number for LaTeX: a clean rational becomes a real `\frac`, otherwise a
// decimal. Integers and a unit denominator stay bare.
function formatNum(n: number): string {
  if (Number.isInteger(n)) return n.toString();
  const fr = toFraction(n);
  if (fr) {
    const [a, d] = fr;
    if (d === 1) return a.toString();
    return a < 0 ? `-\\frac{${-a}}{${d}}` : `\\frac{${a}}{${d}}`;
  }
  return decimal(n);
}

// Function names that map onto a LaTeX operator command (`\sin`, `\log`, …).
// Anything else is wrapped in \operatorname so it still typesets upright.
const LATEX_FUNCS = new Set([
  "sin",
  "cos",
  "tan",
  "sec",
  "csc",
  "cot",
  "sinh",
  "cosh",
  "tanh",
  "log",
  "ln",
  "exp",
  "min",
  "max",
]);

// A factor inside a product. Sums (and bare negative constants) need parens so
// `(x + 1)^-1` and `(x + 1)y` stay unambiguous.
function renderFactor(e: Expr): string {
  if (e.kind === "add") return `\\left(${exprToLatex(e)}\\right)`;
  if (e.kind === "const" && e.value < 0)
    return `\\left(${formatNum(e.value)}\\right)`;
  return exprToLatex(e);
}

function renderProduct(factors: Expr[]): string {
  let coeff = 1;
  const rest: Expr[] = [];
  for (const f of factors) {
    if (f.kind === "const") coeff *= f.value;
    else rest.push(f);
  }
  if (rest.length === 0) return formatNum(coeff);
  // Juxtaposition is the natural LaTeX product (`2x^{2}`, `xy`); the single
  // numeric coefficient (if any) leads the term.
  const body = rest.map(renderFactor).join("");
  if (coeff === 1) return body;
  if (coeff === -1) return `-${body}`;
  // A `\cdot` only when the body starts with a digit (a numeric-base power like
  // `2^{x}`), so `ln(2)·2^x` doesn't typeset as the single number `0.69312^x`.
  const sep = /^[0-9]/.test(body) ? " \\cdot " : "";
  return `${formatNum(coeff)}${sep}${body}`;
}

function renderFunc(name: string, args: Expr[]): string {
  if (name === "sqrt") return `\\sqrt{${args.map(exprToLatex).join(", ")}}`;
  const head = LATEX_FUNCS.has(name) ? `\\${name}` : `\\operatorname{${name}}`;
  return `${head}\\left(${args.map(exprToLatex).join(", ")}\\right)`;
}

export function exprToLatex(e: Expr): string {
  switch (e.kind) {
    case "const":
      return formatNum(e.value);
    case "sym":
      return e.name;
    case "mul":
      return renderProduct(e.factors);
    case "pow": {
      const base = renderFactor(e.base);
      const exp =
        e.exp.kind === "const" && e.exp.value >= 0
          ? formatNum(e.exp.value)
          : exprToLatex(e.exp);
      return `${base}^{${exp}}`;
    }
    case "add": {
      let out = "";
      for (let i = 0; i < e.terms.length; i++) {
        const s = exprToLatex(e.terms[i]);
        if (i === 0) out = s;
        else if (s.startsWith("-")) out += ` - ${s.slice(1)}`;
        else out += ` + ${s}`;
      }
      return out;
    }
    case "func":
      return renderFunc(e.name, e.args);
    case "equation":
      return `${exprToLatex(e.lhs)} = ${exprToLatex(e.rhs)}`;
    case "derivative":
      return `\\frac{d}{d${e.variable}}\\!\\left(${exprToLatex(e.body)}\\right)`;
    case "integral":
      return e.lower && e.upper
        ? `\\int_{${exprToLatex(e.lower)}}^{${exprToLatex(e.upper)}} ${exprToLatex(e.body)} \\,\\mathrm{d}${e.variable}`
        : `\\int ${exprToLatex(e.body)} \\,\\mathrm{d}${e.variable}`;
    case "limit":
      return `\\lim_{${e.variable} \\to ${exprToLatex(e.point)}} ${exprToLatex(e.body)}`;
    default:
      return "";
  }
}
