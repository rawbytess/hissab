import {
  doLex,
  doParse,
  evalExpr,
  freeSymbols,
  PlotToken,
  UserError,
} from "../src";

async function plot(expr: string): Promise<PlotToken> {
  const res = await doParse(doLex(expr, {}, 1));
  expect(res.resultToken).toBeInstanceOf(PlotToken);
  return res.resultToken as PlotToken;
}

describe("draw() / plot() — symbolic curves", () => {
  test("a single curve carries a samplable Expr and its variable", async () => {
    const p = await plot("draw(x^2)");
    expect(p.series).toHaveLength(1);
    const s = p.series[0];
    expect(s.type).toStrictEqual("curve");
    if (s.type === "curve") {
      expect(s.variable).toStrictEqual("x");
      expect(evalExpr(s.expr, { x: 3 })).toStrictEqual(9);
      expect(evalExpr(s.expr, { x: -2 })).toStrictEqual(4);
    }
  });

  test("multiple arguments overlay as multiple curves", async () => {
    const p = await plot("draw(sin(x), cos(x))");
    expect(p.series).toHaveLength(2);
    expect(p.series.every((s) => s.type === "curve")).toStrictEqual(true);
  });

  test("plot is an alias of draw", async () => {
    const p = await plot("plot(2x + 1)");
    expect(p.series).toHaveLength(1);
    const s = p.series[0];
    if (s.type === "curve") expect(evalExpr(s.expr, { x: 4 })).toStrictEqual(9);
  });

  test("getString carries a 📈 label for the inline result", async () => {
    const p = await plot("draw(x^2)");
    expect(p.getString()).toContain("📈");
  });
});

describe("draw() / plot() — numeric (complex + points)", () => {
  test("a complex number becomes an Argand series", async () => {
    const p = await plot("draw(3 + 4i)");
    expect(p.series).toHaveLength(1);
    const s = p.series[0];
    expect(s.type).toStrictEqual("complex");
    if (s.type === "complex") {
      expect(s.re).toStrictEqual(3);
      expect(s.im).toStrictEqual(4);
    }
  });

  test("coordinate points become cartesian point series", async () => {
    const p = await plot("draw(point(1, 2), point(3, 4))");
    expect(p.series).toHaveLength(2);
    expect(p.series.every((s) => s.type === "point")).toStrictEqual(true);
    const s = p.series[0];
    if (s.type === "point") expect(s.coords).toStrictEqual([1, 2]);
  });

  test("draw() with no arguments is a user error", async () => {
    await expect(doParse(doLex("draw()", {}, 1))).rejects.toThrow(UserError);
  });
});

describe("evalExpr / freeSymbols", () => {
  test("freeSymbols reports the single variable, ignoring i", async () => {
    const p = await plot("draw(x^2 + 1)");
    const s = p.series[0];
    if (s.type === "curve") expect(freeSymbols(s.expr)).toStrictEqual(["x"]);
  });

  test("evalExpr returns null for non-finite samples (gaps in the line)", async () => {
    const p = await plot("draw(1 / x)");
    const s = p.series[0];
    if (s.type === "curve") {
      expect(evalExpr(s.expr, { x: 0 })).toBeNull();
      expect(evalExpr(s.expr, { x: 2 })).toStrictEqual(0.5);
    }
  });
});
