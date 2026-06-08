import { mkdir, readFile, stat, writeFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import React from "react";
import { renderToStaticMarkup } from "react-dom/server";
import ReactMarkdown from "react-markdown";
import rehypeKatex from "rehype-katex";
import remarkDirective from "remark-directive";
import remarkGfm from "remark-gfm";
import remarkMath from "remark-math";
import ts from "typescript";

const SITE_ORIGIN = "https://hissab.io";
const DOCS_VERSION = "latest";
const __dirname = path.dirname(fileURLToPath(import.meta.url));
const appDir = path.resolve(__dirname, "..");
const distDir = path.join(appDir, "dist");
const contentDir = path.join(appDir, "src", "docs", "content");
const registryPath = path.join(appDir, "src", "docs", "registry.ts");
const distIndexPath = path.join(distDir, "index.html");
const CALLOUT_KINDS = new Set(["tip", "note", "caution", "warning", "danger"]);

function fail(message) {
  throw new Error(`[docs-crawl] ${message}`);
}

function getProperty(objectLiteral, propertyName) {
  return objectLiteral.properties.find((property) => {
    if (!ts.isPropertyAssignment(property)) return false;
    const name = property.name;
    return (
      (ts.isIdentifier(name) || ts.isStringLiteral(name)) &&
      name.text === propertyName
    );
  });
}

function getStringProperty(objectLiteral, propertyName) {
  const property = getProperty(objectLiteral, propertyName);
  if (!property) fail(`Missing ${propertyName} in docs registry.`);
  const initializer = property.initializer;
  if (!ts.isStringLiteral(initializer)) {
    fail(`${propertyName} in docs registry must be a string literal.`);
  }
  return initializer.text;
}

function getArrayProperty(objectLiteral, propertyName) {
  const property = getProperty(objectLiteral, propertyName);
  if (!property) fail(`Missing ${propertyName} in docs registry.`);
  const initializer = property.initializer;
  if (!ts.isArrayLiteralExpression(initializer)) {
    fail(`${propertyName} in docs registry must be an array literal.`);
  }
  return initializer;
}

function readDocsRegistry(sourceText) {
  const sourceFile = ts.createSourceFile(
    registryPath,
    sourceText,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );
  let sectionsInitializer;

  sourceFile.forEachChild((node) => {
    if (!ts.isVariableStatement(node)) return;
    for (const declaration of node.declarationList.declarations) {
      if (
        ts.isIdentifier(declaration.name) &&
        declaration.name.text === "docSections" &&
        declaration.initializer &&
        ts.isArrayLiteralExpression(declaration.initializer)
      ) {
        sectionsInitializer = declaration.initializer;
      }
    }
  });

  if (!sectionsInitializer) fail("Could not find docSections in registry.ts.");

  return sectionsInitializer.elements.map((sectionNode) => {
    if (!ts.isObjectLiteralExpression(sectionNode)) {
      fail("Each docs section must be an object literal.");
    }
    const title = getStringProperty(sectionNode, "title");
    const pages = getArrayProperty(sectionNode, "pages").elements.map(
      (pageNode) => {
        if (!ts.isObjectLiteralExpression(pageNode)) {
          fail(`Each page in ${title} must be an object literal.`);
        }
        return {
          sectionTitle: title,
          slug: getStringProperty(pageNode, "slug"),
          title: getStringProperty(pageNode, "title"),
        };
      },
    );
    return { title, pages };
  });
}

function escapeHtml(value) {
  return value
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;");
}

function plainText(children) {
  if (
    children === null ||
    children === undefined ||
    typeof children === "boolean"
  ) {
    return "";
  }
  if (typeof children === "string" || typeof children === "number") {
    return String(children);
  }
  if (Array.isArray(children)) return children.map(plainText).join("");
  if (React.isValidElement(children)) return plainText(children.props.children);
  return "";
}

function slugify(value) {
  return (
    value
      .toLowerCase()
      .replaceAll("&", " and ")
      .replace(/[`'"’]/g, "")
      .replace(/[^a-z0-9]+/g, "-")
      .replace(/^-+|-+$/g, "") || "section"
  );
}

function headingId(children, counts) {
  const base = slugify(plainText(children));
  const count = counts.get(base) ?? 0;
  counts.set(base, count + 1);
  return count === 0 ? base : `${base}-${count + 1}`;
}

function remarkHissabCallouts() {
  const visit = (node) => {
    if (
      node.type === "containerDirective" &&
      node.name &&
      CALLOUT_KINDS.has(node.name)
    ) {
      const data = node.data ?? {};
      data.hName = "div";
      data.hProperties = {
        className: `docs-callout docs-callout-${node.name}`,
      };
      node.data = data;
    }
    node.children?.forEach(visit);
  };
  return (tree) => visit(tree);
}

function markdownToHtml(markdown) {
  const headingCounts = new Map();
  const components = Object.fromEntries(
    [1, 2, 3, 4, 5, 6].map((level) => {
      const tag = `h${level}`;
      return [
        tag,
        ({ node: _node, children, ...props }) =>
          React.createElement(
            tag,
            { ...props, id: props.id ?? headingId(children, headingCounts) },
            children,
          ),
      ];
    }),
  );

  return renderToStaticMarkup(
    React.createElement(
      ReactMarkdown,
      {
        remarkPlugins: [
          remarkGfm,
          remarkMath,
          remarkDirective,
          remarkHissabCallouts,
        ],
        rehypePlugins: [rehypeKatex],
        skipHtml: true,
        components,
      },
      markdown,
    ),
  );
}

function pageUrl(slug) {
  return `${SITE_ORIGIN}/docs/${slug}`;
}

function localPagePath(slug) {
  return `/docs/${slug}`;
}

function docLinksHtml(sections) {
  return sections
    .map(
      (section) => `
        <section class="docs-crawl-nav-section">
          <h2>${escapeHtml(section.title)}</h2>
          <ul>
            ${section.pages
              .map(
                (page) =>
                  `<li><a href="${localPagePath(page.slug)}">${escapeHtml(page.title)}</a></li>`,
              )
              .join("\n")}
          </ul>
        </section>`,
    )
    .join("\n");
}

function pageFallback({ page, markdownHtml, navHtml }) {
  return `
      <main class="docs-crawl-shell">
        <nav class="docs-crawl-nav" aria-label="Documentation pages">
          <a href="/docs/">Documentation home</a>
          ${navHtml}
        </nav>
        <article class="DocSearch-content docs-md">
          <p class="docs-crawl-context">${escapeHtml(page.sectionTitle)}</p>
          ${markdownHtml}
        </article>
      </main>`;
}

function indexFallback(navHtml) {
  return `
      <main class="docs-crawl-shell">
        <article class="DocSearch-content docs-md">
          <h1 id="hissab-documentation">Hissab Documentation</h1>
          <p>
            Browse Hissab syntax, calculator features, AI workflows, installation,
            CLI usage, and reference material.
          </p>
        </article>
        <nav class="docs-crawl-nav" aria-label="Documentation pages">
          ${navHtml}
        </nav>
      </main>`;
}

function injectHtml(indexHtml, { title, description, canonicalUrl, fallback }) {
  const headExtras = [
    `<link rel="canonical" href="${escapeHtml(canonicalUrl)}" />`,
    '<meta name="docsearch:language" content="en" />',
    `<meta name="docsearch:version" content="${DOCS_VERSION}" />`,
  ].join("\n    ");

  return indexHtml
    .replace(/<title>[\s\S]*?<\/title>/, `<title>${escapeHtml(title)}</title>`)
    .replace(
      /<meta\s+name="description"\s+content="[\s\S]*?"\s*\/>/,
      `<meta name="description" content="${escapeHtml(description)}" />`,
    )
    .replace("</head>", `    ${headExtras}\n  </head>`)
    .replace('<div id="root"></div>', `<div id="root">${fallback}\n    </div>`);
}

async function writeDocsPage({ page, indexHtml, navHtml }) {
  const markdownPath = path.join(contentDir, `${page.slug}.md`);
  try {
    await stat(markdownPath);
  } catch {
    fail(`Missing Markdown file for docs slug "${page.slug}".`);
  }

  const markdown = await readFile(markdownPath, "utf8");
  const html = injectHtml(indexHtml, {
    title: `${page.title} | Hissab Docs`,
    description: `${page.title} in the Hissab documentation.`,
    canonicalUrl: pageUrl(page.slug),
    fallback: pageFallback({
      page,
      markdownHtml: markdownToHtml(markdown),
      navHtml,
    }),
  });
  const outputPath = path.join(distDir, "docs", `${page.slug}.html`);
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}

async function writeDocsIndex({ indexHtml, navHtml }) {
  const html = injectHtml(indexHtml, {
    title: "Hissab Documentation",
    description:
      "Documentation for Hissab syntax, calculator features, installation, AI workflows, and reference material.",
    canonicalUrl: `${SITE_ORIGIN}/docs/`,
    fallback: indexFallback(navHtml),
  });
  const outputPath = path.join(distDir, "docs", "index.html");
  await mkdir(path.dirname(outputPath), { recursive: true });
  await writeFile(outputPath, html);
}

async function writeSitemaps(pages) {
  const docsUrls = [
    `${SITE_ORIGIN}/docs/`,
    ...pages.map((page) => pageUrl(page.slug)),
  ];
  const docsSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
${docsUrls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`;
  const siteSitemap = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">
  <url><loc>${SITE_ORIGIN}/</loc></url>
${docsUrls.map((url) => `  <url><loc>${url}</loc></url>`).join("\n")}
</urlset>
`;
  const robots = `User-agent: *
Allow: /

Sitemap: ${SITE_ORIGIN}/sitemap.xml
Sitemap: ${SITE_ORIGIN}/docs-sitemap.xml
`;

  await writeFile(path.join(distDir, "docs-sitemap.xml"), docsSitemap);
  await writeFile(path.join(distDir, "sitemap.xml"), siteSitemap);
  await writeFile(path.join(distDir, "robots.txt"), robots);
}

const registry = await readFile(registryPath, "utf8");
const sections = readDocsRegistry(registry);
const pages = sections.flatMap((section) => section.pages);
const indexHtml = await readFile(distIndexPath, "utf8");
const navHtml = docLinksHtml(sections);

await writeDocsIndex({ indexHtml, navHtml });
await Promise.all(
  pages.map((page) => writeDocsPage({ page, indexHtml, navHtml })),
);
await writeSitemaps(pages);

console.log(`Generated ${pages.length + 1} docs crawl pages.`);
