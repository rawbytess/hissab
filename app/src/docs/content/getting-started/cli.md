# Hissab CLI

The Hissab CLI runs the same calculation engine from your terminal. Use it for
quick calculations, repeatable scripts, CI checks, shell pipelines, and local AI
agent tools.

## Install

Install the CLI from npm:

```sh
npm install @rawbytes/hissab-cli
```

For a global `hissab` command:

```sh
npm install -g @rawbytes/hissab-cli
```

After installation, verify the command:

```sh
hissab --help
```

## Commands at a glance

| Command | Purpose |
| ---------------------- | ----------------------------------- |
| `hissab eval "<expr>"` | evaluate one expression |
| `hissab repl` | interactive session (keeps labels) |
| `hissab run <file>` | run a file of expressions |
| `hissab list <kind>` | list functions, units, or operators |
| `hissab docs [chunk]` | print the syntax reference |
| `hissab docs --list` | list documentation chunks |
| `hissab docs --all` | print the full reference for large-context LLMs |

## Evaluate one expression

Use `eval` for one-shot calculations.

```sh
hissab eval "15 kilometers to miles"
hissab eval "25% of 200"
hissab eval "today - 1 feb 1990 to years"
hissab eval "derivative(2x^2, x)"
hissab eval "(2 + 3i) * (1 - i)"
```

Results are printed to stdout. **Invalid expressions print errors to stderr** and
exit with a non-zero status.

## Use the REPL

Start an interactive session with:

```sh
hissab repl
```

The REPL keeps labels available while the session is open.

```hissab
subtotal = 240 - 15%
subtotal + 18
```

Exit with `q`, `.exit`, or `Ctrl+D`.

## Run a file

Use `run` for scripts. Put **one expression per line**. Empty lines and lines
starting with `#` are skipped.

```text
distance = 15 kilometers
distance to miles
time = 2 hours
distance / time to kilometer/hour
```

Then run:

```sh
hissab run trip.hsb
```

Expressions in the file share scope, so later lines can use earlier labels,
`prev`, `line<N>` / `l<N>`, and `total<N>`.

## List built-ins

Use `list` to inspect available names for autocomplete, debugging, or agent tool
setup.

```sh
hissab list functions
hissab list units
hissab list operators
```

## Read syntax docs from the CLI

The CLI can print the same syntax reference used by Hissab agents.

```sh
hissab docs
hissab docs --list
hissab docs --all
hissab docs unit_conversion
hissab docs symbolic
hissab docs complex_numbers
hissab docs date_time
```

Fetch a specific docs chunk before writing expressions for a category you do not
use often. For LLMs with very large context windows, `hissab docs --all` dumps
the base reference plus every category chunk in one response.

## When to use the CLI

- Use the **CLI** for local scripts, terminal workflows, and AI agents that can run shell commands.
- Use the **engine library** when you are building Hissab into an application.
- Use the **web app** when you want notebooks, inline results, and local browser storage without writing code.
