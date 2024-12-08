import { test, expect } from "@playwright/test";

test.describe("Variables Tests", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await page.waitForSelector("#editor-root");
  });

  test("Simple one variable", async ({ page }) => {
    await page.locator(".cm-content").type(
      `x = 23 + 35
x+34`,
    );
    const resultsElements = page.locator(".cm-result");
    const results = await resultsElements.allTextContents();
    expect(results.length).toBe(2);
    await Promise.all([
      expect(results[0]).toBe("58"),
      expect(results[1]).toBe("92"),
    ]);
  });
});
