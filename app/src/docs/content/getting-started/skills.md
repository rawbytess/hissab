# Skills

Skills are **local instructions** that teach an AI agent when and how to use
Hissab instead of doing math in the model. They work with agents that support
skills, local tools, or skill-like instruction folders — including **Claude,
Codex, OpenCode**, and similar hosts.

Use Hissab skills when you want an agent to translate a natural-language math
request into Hissab expressions, call the calculator, and answer from the
deterministic result.

## Install the Hissab CLI

The local skill expects the `hissab` command to be available.

```sh
npm install @rawbytes/hissab-cli
```

For agent hosts that run commands outside your project directory, install it
globally:

```sh
npm install -g @rawbytes/hissab-cli
```

Verify the install:

```sh
hissab eval "15 kilometers to miles"
```

## Install with Vercel Skills

Install the Hissab CLI-backed skill with Vercel's Skills CLI:

```sh
npx skills add rawbytes/hissab --skill hissab-cli
```

If your agent supports global skill installation, install it globally:

```sh
npx skills add rawbytes/hissab --skill hissab-cli -g
```

You can also target a specific supported agent:

```sh
npx skills add rawbytes/hissab --skill hissab-cli -g -a claude-code
```

:::tip

After installing, **start a fresh agent session** so the new skill instructions
are loaded.

:::

## CLI-backed skill

The `hissab-cli` skill is best when the agent can run local commands. It works
**offline after installation** and is a good fit for:

- **Coding agents** — Claude Code, Codex, OpenCode, and other terminal-based agents.
- **CI and repository automation.**
- **Local workflows** where calculations should not depend on a remote server.

The skill tells the agent to call commands such as:

```sh
hissab eval "25% of 200"
hissab docs unit_conversion
```

## Good skill behavior

A Hissab skill should make the agent:

- **Strip filler words** and send only valid Hissab expressions.
- **Fetch docs first** for unfamiliar categories such as compound units, dates, colors, or bitwise operations.
- **Use the calculator result as the source of truth.**
- **Ask for missing current facts** — or look them up with an available realtime tool — before calculating rates, prices, or other changing values.
