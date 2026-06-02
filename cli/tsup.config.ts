import { defineConfig } from "tsup";

// The CLI ships as a single self-contained Node bundle: the engine
// (@rawbytes/hissab), the root lib/ helpers, and runtime deps (commander) are
// all inlined via `noExternal`, so the published package has zero runtime
// dependencies and runs under plain Node. The banner makes dist/index.js
// directly executable as the `hissab` bin.
export default defineConfig({
  clean: true,
  entry: ["src/index.ts"],
  format: ["esm"],
  outDir: "dist",
  outExtension() {
    return { js: ".js" };
  },
  target: "node18",
  platform: "node",
  noExternal: [/.*/],
  // The bundle is ESM but inlines CommonJS deps (commander, spacetime, …) that
  // call `require(...)` and reference `__dirname`. Provide real implementations
  // so the esbuild `__require` shim resolves Node built-ins instead of throwing.
  // The shebang must stay the very first line.
  banner: {
    js: [
      "#!/usr/bin/env node",
      "import { createRequire as __hissabCreateRequire } from 'node:module';",
      "import { fileURLToPath as __hissabFileURLToPath } from 'node:url';",
      "import { dirname as __hissabDirname } from 'node:path';",
      "const require = __hissabCreateRequire(import.meta.url);",
      "const __filename = __hissabFileURLToPath(import.meta.url);",
      "const __dirname = __hissabDirname(__filename);",
    ].join("\n"),
  },
  sourcemap: false,
  dts: false,
});
