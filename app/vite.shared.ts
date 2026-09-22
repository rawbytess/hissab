import path from "node:path";

/**
 * Node built-ins that `@anthropic-ai/sdk`'s credential chain reaches through
 * guarded `await import("node:…")` calls. Those branches only run under Node
 * (they bail on `typeof process === "undefined"`), but the bundler still has to
 * resolve the specifiers, and without an alias it warns once per import and
 * leaves a throwing proxy in the bundle.
 */
const NODE_BUILTIN_SPECIFIERS = [
  "node:child_process",
  "node:crypto",
  "node:fs",
  "node:fs/promises",
  "node:path",
  "node:readline",
  "node:stream",
  "node:stream/promises",
  "node:util",
] as const;

/**
 * Aliases that keep Node-only code out of the web and extension bundles.
 *
 * Returned as anchored-regex entries rather than a plain object because Vite
 * matches string aliases by prefix — a `"node:fs"` key would also swallow
 * `node:fs/promises` and rewrite it to `<stub>.ts/promises`.
 *
 * `tools/agent-toolset` is aliased as well. It is Node-only CLI tooling that
 * *statically* imports `node:child_process`, `node:readline` and friends, so
 * unlike the credential chain it cannot be satisfied by a namespace stub. The
 * SDK only reaches it from `lib/environments/worker` via a dynamic import this
 * app never triggers, so it is replaced wholesale with an empty module.
 *
 * These are aliases rather than a plugin on purpose: Vite's dependency
 * pre-bundler honours `resolve.alias` but not plugin `resolveId` hooks, so a
 * plugin would fix the production build and still break `vite dev`.
 */
export function browserSafeAliases(appDir: string) {
  const nodeStub = path.resolve(appDir, "./src/lib/nodeBuiltinStub.ts");
  const emptyStub = path.resolve(appDir, "./src/lib/emptyModule.ts");

  return [
    ...NODE_BUILTIN_SPECIFIERS.map((specifier) => ({
      find: new RegExp(`^${specifier.replace(/\//g, "\\/")}$`),
      replacement: nodeStub,
    })),
    // Matches the SDK's own relative import (`../../tools/agent-toolset/node.mjs`).
    // The pattern has to span the whole specifier: Vite substitutes a regex
    // alias with `String.replace`, so a partial match would leave the trailing
    // path segment glued onto the stub path.
    { find: /^.*\/tools\/agent-toolset\/.*$/, replacement: emptyStub },
  ];
}
