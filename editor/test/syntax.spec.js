import { test } from "@playwright/test";

test.describe("Syntax highlighting Tests", () => {
  test.beforeEach(async ({ page, baseURL }) => {
    await page.goto(baseURL);
    await page.waitForSelector("#editor-root");
  });

  /*
  test("Basic syntax for all types", async ({ page }) => {
    await page.locator(".cm-content").type("345345");
    const resultsElements = page.locator(".cm-result");
    const results = await resultsElements.allTextContents();
    await expect(results).toHaveCSS("color");
    await expect(results[0]).toBe("3558");
  }); */
});
