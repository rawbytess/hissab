# @rawbytes/hissab-cli

Natural-language calculator in your terminal — a thin wrapper around the
[Hissab engine](https://www.npmjs.com/package/@rawbytes/hissab). Evaluate
expressions from your shell, run scripts, or drop into an interactive REPL.

## Install

Requires Node ≥ 18.

```bash
npm install -g @rawbytes/hissab-cli
hissab eval "5 km to miles"
```

## Commands

```bash
hissab eval "<expr>"        # one-shot evaluation
hissab repl                 # interactive REPL (default when no subcommand)
hissab run <file>           # evaluate a file (one expression per line, shared variable scope)
hissab list <kind>          # list built-ins; kind = functions | units | operators
hissab docs [tag]           # print documentation (base overview, or a category chunk)
```

Examples:

```bash
hissab eval "1 + 2"
hissab eval "5 km to miles"
hissab eval "15% of 200"
hissab run examples/budget.hsb
hissab list functions
```

The REPL keeps a persistent variable scope across lines. Type `q`, `.exit`, or
press `Ctrl+D` to quit.

## Output

Plain text on stdout, errors on stderr, non-zero exit code on failure.
Pipe-friendly.

## Development

From the monorepo root:

```bash
pnpm install
pnpm --filter ./cli dev eval "5 km to miles"   # run from source
pnpm --filter ./cli build                      # self-contained Node bundle -> cli/dist/
```

The published package is the single Node bundle in `cli/dist/` (engine and
dependencies are inlined — zero runtime deps). To build optional standalone
per-platform binaries with Bun instead:

```bash
pnpm --filter ./cli build:bin                  # all platforms -> cli/bin/
pnpm --filter ./cli build:bin:darwin-arm64     # host only
```
