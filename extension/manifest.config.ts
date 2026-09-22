import { defineManifest } from "@crxjs/vite-plugin";
import pkg from "./package.json";

const icons = {
  32: "icons/32.png",
  128: "icons/128.png",
};

// The manifest version is read from package.json so `pnpm bump` (which bumps
// every package.json in the repo) keeps the Web Store version in step.
export default defineManifest({
  manifest_version: 3,
  name: "Hissab - Natural-Language Calculator",
  description:
    "Strict, unit-aware calculator for units, dates, percentages, finance and developer math, with inline results and graphs.",
  version: pkg.version,
  icons,
  action: {
    default_popup: "index.html",
    default_title: "Hissab",
    default_icon: icons,
  },
  // The MV3 default is `script-src 'self'`, which blocks WebAssembly, and the
  // engine's hash functions (md5, sha256, crc32, …) run on hash-wasm. The WASM
  // is bundled in the package, so this is not remote code.
  content_security_policy: {
    extension_pages: "script-src 'self' 'wasm-unsafe-eval'; object-src 'self';",
  },
});
