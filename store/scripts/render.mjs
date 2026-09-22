// Renders the Chrome Web Store images for the Hissab extension.
//
// 1. Capture: serves the built extension (extension/dist) over HTTP, opens the
//    real popup with each document in samples/ and screenshots it at 2x into
//    mockups/captures/. The mockups show these captures, so the UI in every
//    store image is the shipped UI rather than a redraw.
// 2. Render: opens each mockups/*.html at its exact store size and writes a
//    24-bit PNG with no alpha channel (a Web Store requirement) into images/.
//
// Needs Google Chrome and a current extension build:
//   pnpm -F ./extension build
//   cd store && npm install && npm run render
//
// `--skip-capture` re-renders the mockups from the existing captures;
// `--only=<name>[,<name>]` renders just those mockups.

import { createReadStream } from "node:fs";
import { mkdir, readFile, stat } from "node:fs/promises";
import http from "node:http";
import path from "node:path";
import { fileURLToPath } from "node:url";
import { chromium } from "playwright-core";
import sharp from "sharp";

const storeDir = path.resolve(
  path.dirname(fileURLToPath(import.meta.url)),
  "..",
);
const distDir = path.resolve(storeDir, "../extension/dist");
const mockupsDir = path.join(storeDir, "mockups");
const capturesDir = path.join(mockupsDir, "captures");
const imagesDir = path.join(storeDir, "images");

// Must match DOC_KEY in extension/src/storage.ts.
const DOC_KEY = "hissab-extension-doc";

// Chrome sizes the popup from extension/src/styles.css (body 520×580).
const POPUP = { width: 520, height: 580 };

const CAPTURES = ["overview", "units-dates", "finance", "developer", "graphs"];

const IMAGES = [
  { name: "screenshot-1-overview", width: 1280, height: 800 },
  { name: "screenshot-2-units-dates", width: 1280, height: 800 },
  { name: "screenshot-3-finance", width: 1280, height: 800 },
  { name: "screenshot-4-developer", width: 1280, height: 800 },
  { name: "screenshot-5-graphs", width: 1280, height: 800 },
  { name: "promo-small", width: 440, height: 280 },
  { name: "promo-marquee", width: 1400, height: 560 },
];

const CONTENT_TYPES = {
  ".html": "text/html; charset=utf-8",
  ".js": "text/javascript; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".json": "application/json",
  ".png": "image/png",
  ".svg": "image/svg+xml",
  ".woff": "font/woff",
  ".woff2": "font/woff2",
  ".ttf": "font/ttf",
  ".wasm": "application/wasm",
};

// The popup runs under the manifest's extension-page CSP (MV3's default when
// none is declared). Serving it with the same policy keeps the captures
// honest: anything the CSP blocks in the real extension fails here too.
async function extensionCsp() {
  const manifest = JSON.parse(
    await readFile(path.join(distDir, "manifest.json"), "utf8").catch(
      () => "{}",
    ),
  );
  return (
    manifest.content_security_policy?.extension_pages ??
    "script-src 'self'; object-src 'self';"
  );
}

// `/mockups/*` is served from store/mockups; everything else from the
// extension build, so the popup's absolute `/assets/...` URLs resolve.
function startServer(csp) {
  const server = http.createServer(async (req, res) => {
    const { pathname } = new URL(req.url ?? "/", "http://localhost");
    const [root, rel] = pathname.startsWith("/mockups/")
      ? [mockupsDir, pathname.slice("/mockups/".length)]
      : [distDir, pathname === "/" ? "index.html" : pathname.slice(1)];
    const file = path.join(root, decodeURIComponent(rel));
    if (!file.startsWith(root)) {
      res.writeHead(403).end();
      return;
    }
    try {
      if (!(await stat(file)).isFile()) throw new Error("not a file");
    } catch {
      res.writeHead(404).end();
      return;
    }
    res.writeHead(200, {
      "content-type":
        CONTENT_TYPES[path.extname(file)] ?? "application/octet-stream",
      ...(root === distDir && file.endsWith(".html")
        ? { "content-security-policy": csp }
        : {}),
    });
    createReadStream(file).pipe(res);
  });
  return new Promise((resolve) => {
    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address();
      resolve({ server, origin: `http://127.0.0.1:${port}` });
    });
  });
}

async function capturePopups(browser, origin) {
  await stat(path.join(distDir, "index.html")).catch(() => {
    throw new Error(
      `No extension build at ${distDir}. Run: pnpm -F ./extension build`,
    );
  });
  await mkdir(capturesDir, { recursive: true });

  const context = await browser.newContext({
    viewport: POPUP,
    deviceScaleFactor: 2,
    colorScheme: "dark",
    // No daylight saving, so date differences stay whole days.
    timezoneId: "Asia/Kolkata",
    locale: "en-US",
  });

  // The popup declares Chillax with `font-display: optional`, so it only
  // appears once the font is in the HTTP cache, exactly as on a user's second
  // open. Warm the cache first.
  const warm = await context.newPage();
  await warm.goto(`${origin}/`, { waitUntil: "networkidle" });
  await warm.evaluate(() =>
    Promise.all(
      ["300", "400", "600", "700"].map((w) =>
        document.fonts.load(`${w} 16px Chillax`),
      ),
    ),
  );
  await warm.close();

  for (const name of CAPTURES) {
    const doc = await readFile(
      path.join(storeDir, "samples", `${name}.txt`),
      "utf8",
    );
    const page = await context.newPage();
    await page.addInitScript(
      ([key, value]) => localStorage.setItem(key, value),
      [DOC_KEY, doc],
    );
    await page.goto(`${origin}/`, { waitUntil: "networkidle" });
    await page.waitForSelector(".cm-content");
    // Keep the caret solid instead of catching it mid-blink.
    await page.addStyleTag({
      content: ".cm-cursorLayer { animation: none !important; }",
    });
    if (doc.includes("draw(")) {
      await page.waitForSelector(".nb2-graphs svg");
    }
    await page.evaluate(() => document.fonts.ready);
    await page.waitForTimeout(1200);
    const out = path.join(capturesDir, `${name}.png`);
    await page.screenshot({ path: out });
    console.log(`captured  ${path.relative(storeDir, out)}`);
    await page.close();
  }
  await context.close();
}

async function renderImages(browser, origin, only) {
  await mkdir(imagesDir, { recursive: true });
  for (const { name, width, height } of IMAGES) {
    if (only && !only.includes(name)) continue;
    const context = await browser.newContext({
      viewport: { width, height },
      deviceScaleFactor: 1,
    });
    const page = await context.newPage();
    await page.goto(`${origin}/mockups/${name}.html`, {
      waitUntil: "networkidle",
    });
    await page.evaluate(() => document.fonts.ready);
    const png = await page.screenshot({ type: "png" });
    await context.close();

    const out = path.join(imagesDir, `${name}-${width}x${height}.png`);
    await sharp(png)
      .flatten({ background: "#ffffff" })
      .removeAlpha()
      .png({ compressionLevel: 9 })
      .toFile(out);
    const meta = await sharp(out).metadata();
    if (meta.width !== width || meta.height !== height || meta.channels !== 3) {
      throw new Error(
        `${name}: got ${meta.width}×${meta.height}, ${meta.channels} channels`,
      );
    }
    console.log(`rendered  ${path.relative(storeDir, out)}`);
  }
}

const skipCapture = process.argv.includes("--skip-capture");
const only = process.argv
  .find((arg) => arg.startsWith("--only="))
  ?.slice("--only=".length)
  .split(",");
const { server, origin } = await startServer(await extensionCsp());
const browser = await chromium.launch({ channel: "chrome" });
try {
  if (!skipCapture) await capturePopups(browser, origin);
  await renderImages(browser, origin, only);
} finally {
  await browser.close();
  server.close();
}
