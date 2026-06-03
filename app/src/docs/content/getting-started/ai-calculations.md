# AI Calculations

Hissab can use an LLM to **translate natural language into Hissab expressions**,
evaluate those expressions with the calculator engine, and answer from the
results.

## Bring your own provider key

Open **Settings** and connect a provider by saving an API key. The app has
provider entries for **OpenAI, Anthropic, Google Gemini, DeepSeek**, and a
**custom endpoint**.

For a custom endpoint, choose the SDK / protocol shape:

- **OpenAI-compatible**
- **Anthropic Messages API**
- **Gemini GenAI API**

:::caution

Provider keys are used **directly from the browser**. Only add keys you are
comfortable using from this app and browser profile.

:::

## Enable models

Each provider has a model list. Check the models you want available, then **pin
one enabled model as the default** — the default is what the composer uses for
new questions.

Built-in providers include static fallback model lists. For OpenAI, Anthropic,
Gemini, and DeepSeek, the app can **refresh available models** from the provider
when an API key is present. Custom endpoints use the model IDs you add manually.

## How AI calculation works

The assistant receives Hissab's syntax documentation and a calculator tool. It
should **produce Hissab expressions, call the calculator, and explain the
result**.

For unfamiliar Hissab syntax, the assistant can fetch focused documentation
chunks for categories such as compound units, probability, finance, IP address
math, symbolic algebra, and complex numbers before calculating.

For current public facts such as exchange rates, stocks, crypto, weather, or
news, the assistant should use realtime search when the selected provider path
supports it. If realtime lookup is unavailable or fails, the answer should say
so **instead of inventing numbers**.

## Realtime search

The app exposes hosted realtime search through provider adapters that implement
it:

- **OpenAI** — Responses web search tool.
- **Anthropic** — Messages web search tool.
- **Gemini** — Google Search grounding.
- **Custom endpoints** — when the selected SDK / protocol supports the matching hosted search surface.

:::note

DeepSeek uses the OpenAI-compatible chat path in the current app, but it is
**not** given the realtime search tool.

:::

## Configure external skills

The Hissab app can store custom external skills in Settings. Each skill is
edited as a `SKILL.md` document and can be enabled or disabled locally in the
browser.

A skill starts with **YAML frontmatter**, followed by **Markdown instructions**.

```markdown
---
name: my-skill
description: One-line description of when to use this skill.
---

Detailed instructions for the assistant go here.
```

The app requires `name` and `description`. The body becomes the skill
instructions.

The parser also accepts `allowed-tools` or `allowed_tools` as a comma-separated
list or bracketed list.

```markdown
---
name: research-helper
description: Use when a question needs source-backed research.
allowed-tools: [realtime_web_search, calculate_with_hissab]
---

Check current facts before calculating with them.
```

Each saved skill has an **On/Off switch**. Enabled skills can be included in the
assistant context; disabled skills remain saved but are not used.

:::note

The app validates frontmatter when you save. Missing frontmatter, missing
`name`, missing `description`, or unsupported frontmatter syntax shows an inline
error.

:::

## Configure MCP servers

The app can connect to remote MCP servers and make their tools available to the
AI assistant. Open Settings, add an MCP server, and fill in:

- **Name** — the label shown in Settings.
- **Server URL** — the remote MCP endpoint URL.
- **CORS proxy URL** — optional prefix added before the server URL.
- **Authorization header** — optional header value such as `Bearer xxx`.

The app uses the **streamable HTTP MCP transport**. The effective request URL is
the optional proxy prefix followed by the server URL.

Use **Test connection** to connect and list the server's tools. A successful
test shows the tool count and names; errors are shown inline on the server card.

Each server has an On/Off switch. Changing the URL, proxy, or authorization
header invalidates the existing connection so the next use reconnects with the
new settings.

:::caution

Because the app runs in the browser, remote servers must be reachable from the
browser and must satisfy **CORS**. If a server does not allow browser requests,
configure a CORS proxy that you trust.

:::

## Attachments

Notebook files can be included with an AI question. **Images** are passed as
image content; **text-like files** may be passed as text or file/document
content depending on the provider adapter.

Attachment support depends on the selected provider and model. If a model does
not accept a file type, the provider may reject the request.
