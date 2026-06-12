# Hissab App

The Hissab app is the web/PWA and Chrome extension shell for the Hissab
calculation engine. It provides notebook-style expression editing, inline
results, documentation, local browser storage, bring-your-own-key AI
calculation, external skills, and remote MCP server configuration.

## Development

From the repo root:

```sh
pnpm --filter ./app dev
pnpm --filter ./app build:pwa
pnpm --filter ./app build:crx
```

The PWA build also runs `scripts/generate-docs-crawl-pages.mjs`, which creates
static crawlable docs pages, sitemaps, and `robots.txt` in `app/dist`.

## Documentation

Hand-authored app docs live in `src/docs/content`. The navigation manifest is
`src/docs/registry.ts`.

The canonical expression reference for the engine, CLI, and agent
skills lives in `../lib/documentation`. Do not duplicate full syntax reference
content in app docs when the generated docs can provide the source of truth.

## Metadata

Public SEO metadata lives in `index.html`. PWA manifest metadata is configured
in `vite.config.pwa.ts`, while the Chrome extension manifest is
`manifest.json`.
