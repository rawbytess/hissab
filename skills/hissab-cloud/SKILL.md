---
name: hissab-cloud
description: Use the hosted Hissab MCP server at https://api.hissab.io/mcp to evaluate deterministic math, unit conversions, date/time arithmetic, percentages, statistics, and color/number-system operations via the `calculate_with_hissab` tool. Invoke when the user wants hallucination-free calculation without installing a CLI, when they reference Hissab, or when the agent is running inside an MCP-capable host (Claude Code, Claude Desktop, Claude Agent SDK). Includes setup instructions for registering the MCP server.
---

# Hissab Cloud (MCP)

Offload deterministic computation to the hosted Hissab MCP server instead of computing it yourself. Translate the user's intent into valid Hissab expressions and call the `calculate_with_hissab` tool exposed by the server.

## When to invoke

- Any arithmetic, percentage, unit conversion, statistical, date/time, bitwise, number-system, or color calculation.
- Whenever the user mentions Hissab.
- Whenever exact precision matters (financial, scientific, engineering numbers).
- In hosted/cloud agent environments where installing a local binary isn't practical.

## Server

- **URL:** `https://api.hissab.io/mcp`
- **Transport:** Streamable HTTP (MCP)
- **Authentication:** None today. *(Per the [official docs](https://hissab.io/docs/mcp), an auth token may be required in the future. Rate limits apply for free use; contact `mufaddal@rawbytes.com` for commercial use.)*

## Registering the server

### Claude Code

```bash
claude mcp add --transport http hissab https://api.hissab.io/mcp
```

### Claude Desktop

Add to `~/Library/Application Support/Claude/claude_desktop_config.json` (macOS) or the platform-equivalent path:

```json
{
  "mcpServers": {
    "hissab": {
      "url": "https://api.hissab.io/mcp"
    }
  }
}
```

### Future auth

Once tokens land, pass them via header. With Claude Code:

```bash
claude mcp add --transport http hissab https://api.hissab.io/mcp \
  --header "Authorization: Bearer $HISSAB_TOKEN"
```

## Tools exposed by the server

- `Hissab({ hissab_expressions: string[] })` — evaluate one or more Hissab expressions. All expressions in one call share scope (labels and `prev`).
- `Hissab_docs({ tag?: OperationTag })` — fetch documentation. Omit `tag` for the base overview and category catalog; pass a tag (e.g. `compound_units`) for that category's full chunk.

## Workflow

1. **Identify the mathematical intent** in the user's prompt. If there is none, do not invoke this skill.
2. **Skim the base reference** in [`documentation.md`](./documentation.md) for the basics (expressions, brackets, labels, `prev`) and the catalog of categories.
3. **Fetch detailed docs for any unfamiliar category** before writing expressions for it:

   ```
   Hissab_docs({ tag: "compound_units" })
   ```

   Skip the fetch for plain arithmetic; pull a chunk for anything else you're not already confident about (units, dates, statistics, color, bitwise, etc.).
4. **Formulate Hissab expression(s)** using the syntax. Use parentheses to match the user's intended grouping. Include units inline (e.g. `15 kilometers to miles`).
5. **Call the calculator**:

   ```
   Hissab({ hissab_expressions: ["expr1", "expr2", ...] })
   ```

   All expressions in one array share scope.
6. **If the tool returns an error**, inspect the message — fetch the relevant docs chunk if you haven't yet, fix the syntax and retry, or tell the user this calculation isn't something Hissab can do (cite the limitation, see below).
7. **Render a concise natural-language answer** that directly addresses the original prompt. Answer in the user's language.

## Examples

### Single expression (with a docs fetch first)
User: *"What is the variance of 45, 56, 67, 78, 89?"*

```
Hissab_docs({ tag: "statistics" })
Hissab({ hissab_expressions: ["variance(45,56,67,78,89)"] })
```

### Date/time across timezones
User: *"A flight from NYC to London is 7 hours. If I leave at 3:45 PM EST, what's the arrival time in London?"*

```
Hissab_docs({ tag: "date_time" })
Hissab({ hissab_expressions: ["3:45 pm est + 7 hours in london"] })
```

### Age calculation
User: *"I was born on 15 June 1995. How old am I today?"*

```
Hissab({ hissab_expressions: ["today - 15 jun 1995 to years"] })
```

### Multi-step calculation with labels
User: *"I earn $4500/month, spend $1200 on rent, $600 on food, $200 on utilities. How much do I save per year?"*

```
Hissab({
  hissab_expressions: [
    "monthly_savings = 4500 - 1200 - 600 - 200",
    "monthly_savings monthly to yearly"
  ]
})
```

## Limitations — surface these instead of guessing

- **No currency conversion.** Ask the user for the rate, or fetch one yourself first (e.g. via web search), then build the expression with the literal rate. Do not hallucinate FX rates.
- **Temperature and Duration units do not support multi-target breakdown.** Use separate expressions per target unit.
- **`prev` refers only to the immediately previous expression in the array.** For anything further back, use a labelled expression and refer to its label.
- **`m` is a million multiplier**, not meter. When writing compound units, spell out `meter` (e.g. `9.8 meter/second^2`). Call `Hissab_docs({ tag: "compound_units" })` for full details on compound unit forms.
- **Network dependency and free-tier rate limits.** If you need offline operation, use the [`hissab-cli`](../hissab-cli/SKILL.md) skill instead.

## Reference

- Base reference (loaded with this skill): [`documentation.md`](./documentation.md)
- Per-category chunks: call `Hissab_docs({ tag: "<tag>" })` against the MCP server.
- MCP server docs: https://hissab.io/docs/mcp
- Engine docs: https://hissab.io/guide/introduction
