// Browser stub for Node built-ins.
//
// `@anthropic-ai/sdk`'s credential chain reaches `node:fs` / `node:path` via
// `await import(...)` calls that are guarded by `typeof process === "undefined"`
// checks, so they never run in the browser or the extension. The bundler still
// has to resolve the specifiers though, and without an alias it warns once per
// import and leaves a throwing proxy in the bundle. `browserSafeAliases` in
// vite.shared.ts points every one of them here instead.
//
// Nothing in this module is meant to execute. If it ever does, it should say so
// loudly rather than fail as "undefined is not a function".

function unavailable(name: string): never {
  throw new Error(
    `Node built-in "${name}" is not available in the browser build of Hissab.`,
  );
}

// Namespace access, for `await import("node:fs")` then `fs.promises.readFile`.
const namespaceStub: Record<string, unknown> = new Proxy(
  {},
  {
    get(_target, property) {
      if (property === "__esModule" || typeof property === "symbol") {
        return undefined;
      }
      return unavailable(String(property));
    },
  },
);

// Named exports. `tools/agent-toolset` imports these *statically*, so they have
// to exist as real bindings or the dependency pre-bundler fails to resolve the
// module — even though `browserSafeAliases` keeps that directory out of the
// production bundle entirely. Extend this list if an SDK upgrade adds more; the
// build fails with a clear MISSING_EXPORT until you do.
export const randomUUID = () => unavailable("randomUUID");
export const execFile = () => unavailable("execFile");
export const promisify = () => unavailable("promisify");
export const pipeline = () => unavailable("pipeline");
export class Readable {
  constructor() {
    unavailable("Readable");
  }
}

export default namespaceStub;
