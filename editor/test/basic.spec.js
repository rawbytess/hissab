import { test, expect } from "@playwright/test";

test.describe("Basic Tests", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await page.waitForSelector("#editor-root");
  });

  test("Find CM Editor", async ({ page }) => {
    const cmEditor = page.locator(".cm-editor");
    await expect(cmEditor).toBeVisible();
  });

  test("Simple calculations", async ({ page }) => {
    await page.locator(".cm-content").type("1234 + 2324");
    const resultsElements = page.locator(".cm-result");
    const results = await resultsElements.allTextContents();
    await expect(results[0]).toBe("3,558");
  });

  test("Simple calculations multiline", async ({ page }) => {
    await page.locator(".cm-content").type(
      `1234 - 2324
23 * 56/2
50 meters to miles
sum(12,34,56)`,
    );
    const resultsElements = page.locator(".cm-result");
    const results = await resultsElements.allTextContents();
    expect(results.length).toBe(4);
    await Promise.all([
      expect(results[0]).toBe("-1,090"),
      expect(results[1]).toBe("644"),
      expect(results[2]).toBe("0.0311 miles"),
      expect(results[3]).toBe("102"),
    ]);
  });

  test("Simple calculations multiline with empty lines", async ({ page }) => {
    await page.locator(".cm-content").type(
      `
  1234 - 2324
  
23 * 56/2


50 meters to miles
sum(12,34,56)

`,
    );
    const resultsElements = page.locator(".cm-result");
    const results = await resultsElements.allTextContents();
    expect(results.length).toBe(10);
    await Promise.all([
      expect(results[0]).toBe(""),
      expect(results[1]).toBe("-1,090"),
      expect(results[2]).toBe(""),
      expect(results[3]).toBe("644"),
      expect(results[4]).toBe(""),
      expect(results[5]).toBe(""),
      expect(results[6]).toBe("0.0311 miles"),
      expect(results[7]).toBe("102"),
      expect(results[8]).toBe(""),
      expect(results[9]).toBe(""),
    ]);
  });
});
