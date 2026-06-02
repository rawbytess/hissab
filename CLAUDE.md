# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Repository layout

This is a pnpm monorepo (`pnpm-workspace.yaml`) for **Hissab** — a natural-language calculator. Workspaces:

- `engine/` — the core expression evaluator (lexer → parser → token tree). Pure TS library, published as the `engine` workspace package. Every other workspace depends on it.
- `app/` — Vite + React 19 client. Builds as a PWA (default) **and** as a Chrome extension from the same source via `vite.config.crx.ts` (gated on `VITE_CHROME=true`).
- `cli/` — Bun-compiled standalone binary (`hissab`) wrapping the engine. `bun build --compile` produces self-contained per-platform binaries.
- `website/` — Astro + Starlight marketing/docs site.
- `skills/` — Anthropic Agent Skills (`hissab-cli`, `hissab-cloud`) that teach LLMs to delegate math to Hissab. The bundled `documentation.md` files are **generated** from `lib/documentation/base.ts` by `scripts/sync-skill-docs.ts` — don't hand-edit them.
- `lib/` (root) — shared TS used by `app` and `cli` (e.g. `calculateExpressions.ts`, `documentation/`). Reached from `app` and `cli` via relative imports.

## Common commands

Root-level (run from repo root):

```bash
pnpm dev                   # `pnpm -r dev` — every workspace's dev server
pnpm build                 # `pnpm -r build`
pnpm test                  # `pnpm -r test`
pnpm check                 # biome lint + format, writing fixes
pnpm check:check           # biome lint + format, check-only (CI gate)
pnpm ready                 # biome check --write + all tests + all builds (pre-push gate)
pnpm sync:skill-docs       # regenerate skills/*/documentation.md from lib/documentation/base.ts
pnpm sync:skill-docs:check # fail if skill docs drift from source
```

Per-workspace (use `pnpm -F <workspace>`):

```bash
pnpm -F engine test                    # jest-playwright across chromium/firefox/webkit
pnpm -F engine test-single             # same suite, chromium only (faster local loop)
pnpm -F app dev                        # vite PWA dev at :5173 (COOP/COEP headers set)
pnpm -F app build:crx                  # Chrome extension build into app/dist
pnpm -F app chrome                     # build:crx + zip via npm-build-zip
pnpm -F cli dev eval "1 + 2"           # run CLI without compiling
pnpm -F cli build:darwin-arm64         # one-platform compile (skip the full matrix)
pnpm -F website dev                    # astro dev server
```

To run a single Jest test in the engine: `pnpm -F engine exec jest path/to/file.test.ts -t "test name"`.

## Architecture notes

**Engine as single source of truth.** `engine/src/index.ts` exposes `doLex` → `doParse` → `doExpression`. Every consumer (app editor, CLI, skills doc) goes through these. The token system (`engine/src/tokens/`) carries values *and* their unit/type metadata through the parse tree; result formatting uses `pro.ts:humanize` when no explicit `in <unit>` conversion was requested. Variables are passed in as a `Variables` map so the same engine call can resolve `line1`, `prev2`, named bindings, etc.

**Engine internals are documented in `engine/ARCHITECTURE.md`.** Reference this file whenever modifying any part of the engine (lexer, parser, tokens, operators, units, etc.). It explains the pipeline, token hierarchy, parser states, operator precedence, unit conversion strategy, and common gotchas in depth.

**When adding or changing engine features:** write test expressions in the appropriate file under `engine/tests/` (organized by category — `expression/`, `tokens/`, `variables/`, etc.) and update the user-facing syntax docs in `lib/documentation/` (base + per-category chunks under `chunks/`). Run `pnpm sync:skill-docs` after doc changes to regenerate `skills/*/documentation.md`.

**Multi-line evaluation semantics** live in `lib/calculateExpressions.ts` (not in the engine). Each line gets implicit `total<N>` (sum of all prior lines) and `prev<N>` variables injected before lex, plus the line's own result is exposed as `line<N>` / `l<N>` to later lines. This file is the contract between the app's editor and any other multi-line consumer — modify with care.

**App build modes.** PWA build (`vite.config.pwa.ts`) is the default and serves with cross-origin isolation headers (COOP/COEP — required for some WASM/SharedArrayBuffer features). The Chrome extension build uses `@crxjs/vite-plugin` and is gated on the `VITE_CHROME=true` env var being set for *both* `tsc` and `vite build` (see `build:crx` script).

## Tooling conventions

- **Biome** (`biome.json`) is the formatter and linter for the whole repo. Double quotes, 2-space indent, trailing commas, semicolons required, organize-imports enabled.
- **Path-alias** `@/*` → `src/*` in `app/`.
- **Strict TS** is on in app/ and engine/; `noUnusedLocals`/`noUnusedParameters` are deliberately off in root configs (don't re-enable without a sweep).
- Tests in `engine/` use `jest-playwright-preset` and need browser binaries — first run after a clean install may need `pnpm exec playwright install`.

## What not to do

- Don't hand-edit `skills/*/documentation.md` — re-run `pnpm sync:skill-docs`.
- The syntax docs source of truth is `lib/documentation/` (base + per-category chunks). Don't add a parallel copy in another workspace.
- Don't duplicate evaluation logic that already lives in `lib/calculateExpressions.ts`; reuse it from new consumers.
