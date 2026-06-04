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
hissab docs --list          # list documentation tags
hissab docs --all           # print the full reference
```

Examples:

```bash
hissab eval "1 + 2"
hissab eval "5 km to miles"
hissab eval "15% of 200"
hissab eval "derivative(2x^2, x)"
hissab eval "(2 + 3i) * (1 - i)"
hissab eval "point(3,4) to polar"
hissab eval "draw(x^2)"
hissab run examples/budget.hsb
hissab docs --list
hissab docs probability
hissab list functions
```

The REPL keeps a persistent variable scope across lines. Type `q`, `.exit`, or
press `Ctrl+D` to quit.

`run` evaluates one expression per non-empty line, skips lines that start with
`#`, and shares labels, `prev`, `line<N>`, and `total<N>` across the file.

## Supported syntax

The CLI evaluates the same expression language documented in
[`../lib/documentation`](../lib/documentation): arithmetic, percentages, unit
conversion, compound units, sets/combinatorics, number theory, logarithms,
statistics, probability, finance, trigonometry, date/time math, number systems,
bitwise operations, color math, IP addresses, symbolic algebra, complex numbers,
coordinate systems, graphing with `draw`/`plot`, and labelled multi-line
workflows.

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
