import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { ComponentType } from "react";

export type ComponentRegistry = Record<string, ComponentType<{ content: string }>>;

const INDEX_CANDIDATES = ["index.tsx", "index.ts", "index.jsx", "index.js"];

/** Directory of the running CLI bundle, where the shipped runtime helper lives. */
const cliDir = path.dirname(fileURLToPath(import.meta.url));
const runtimeHelper = path.join(cliDir, "runtime.mjs");

/** Locate the `.mdgen/components` entry barrel, if any. */
const findComponentsEntry = async (dir: string): Promise<string | null> => {
  for (const candidate of INDEX_CANDIDATES) {
    const full = path.join(dir, candidate);
    try {
      await fs.access(full);
      return full;
    } catch {
      /* try the next candidate */
    }
  }
  return null;
};

/**
 * esbuild plugin: resolve react / jsx-runtime to the host page's React via
 * globals. The shims are CommonJS (`module.exports = global`) so esbuild's
 * interop provides every named import without enumerating React's exports.
 */
const reactGlobalsPlugin = (): esbuild.Plugin => ({
  name: "mdgen-react-globals",
  setup(build) {
    build.onResolve({ filter: /^react$/ }, () => ({ path: "react", namespace: "mdgen-shim" }));
    build.onResolve({ filter: /^react\/jsx-(dev-)?runtime$/ }, () => ({
      path: "jsx",
      namespace: "mdgen-shim",
    }));
    build.onLoad({ filter: /.*/, namespace: "mdgen-shim" }, (args) => ({
      contents:
        args.path === "react"
          ? "module.exports = globalThis.__mdgenReact;"
          : "module.exports = globalThis.__mdgenJsx;",
      loader: "js",
    }));
  },
});

/**
 * The registry is the set of named exports of `.mdgen/components/index.*`, so
 * the rest of the folder (helpers, subcomponents, assets) can be organised
 * freely without being auto-registered. A `<!-- Name -->` marker maps to the
 * export `Name`. The `default` export is ignored.
 */
const buildEntry = (indexFile: string) =>
  [
    `import * as mod from ${JSON.stringify(indexFile)};`,
    "const { default: _default, ...rest } = mod;",
    "export const registry = rest;",
  ].join("\n");

/**
 * Compiles the doc's `.mdgen/components` barrel into:
 *  - an SSR registry (imported into this Node process, sharing the CLI's React),
 *  - a browser `assets/components.js` bundle (React shimmed to page globals).
 *
 * Returns the SSR registry plus whether any component was found.
 */
export const bundleComponents = async (
  sourceDir: string,
  outputDir: string
): Promise<{ registry: ComponentRegistry; hasComponents: boolean }> => {
  const componentsDir = path.join(sourceDir, ".mdgen", "components");
  const indexFile = await findComponentsEntry(componentsDir);
  if (!indexFile) return { registry: {}, hasComponents: false };

  const entry = buildEntry(indexFile);
  const shared = {
    stdin: { contents: entry, resolveDir: componentsDir, loader: "tsx" as const },
    bundle: true,
    format: "esm" as const,
    jsx: "automatic" as const,
    alias: { mdgen: runtimeHelper },
  };

  // 1. SSR bundle: react stays external so it resolves to the CLI's own copy
  //    (hooks share the same React instance during renderToString).
  const ssrFile = path.join(cliDir, ".mdgen-components.ssr.mjs");
  await esbuild.build({
    ...shared,
    platform: "node",
    external: ["react", "react-dom", "react/jsx-runtime", "react/jsx-dev-runtime"],
    outfile: ssrFile,
  });
  const ssrModule = await import(`${pathToFileURL(ssrFile).href}?t=${Date.now()}`);
  const registry: ComponentRegistry = ssrModule.registry ?? {};

  // 2. Browser bundle: react is shimmed to the page's globals; the bundle
  //    registers the components on `globalThis.__mdgenComponents`.
  await esbuild.build({
    ...shared,
    stdin: {
      ...shared.stdin,
      contents: `${entry}\nglobalThis.__mdgenComponents = registry;`,
    },
    platform: "browser",
    plugins: [reactGlobalsPlugin()],
    outfile: path.join(outputDir, "assets", "components.js"),
  });

  return { registry, hasComponents: true };
};
