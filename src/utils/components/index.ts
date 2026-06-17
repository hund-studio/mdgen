import * as esbuild from "esbuild";
import fs from "node:fs/promises";
import path from "node:path";
import { fileURLToPath, pathToFileURL } from "node:url";
import type { ComponentType } from "react";

export type ComponentRegistry = Record<string, ComponentType<{ content: string }>>;

const COMPONENT_EXT = /\.(tsx|ts|jsx|js)$/;

/** Directory of the running CLI bundle, where the shipped runtime helper lives. */
const cliDir = path.dirname(fileURLToPath(import.meta.url));
const runtimeHelper = path.join(cliDir, "runtime.mjs");

const listComponentFiles = async (dir: string): Promise<string[]> => {
  let entries: import("node:fs").Dirent[];
  try {
    entries = await fs.readdir(dir, { withFileTypes: true });
  } catch {
    return [];
  }

  const files: string[] = [];
  for (const entry of entries) {
    const full = path.join(dir, entry.name);
    if (entry.isDirectory()) files.push(...(await listComponentFiles(full)));
    else if (COMPONENT_EXT.test(entry.name) && !/\.d\.ts$/.test(entry.name)) files.push(full);
  }
  return files;
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

const buildEntry = (files: string[]) => {
  const imports = files.map((file, i) => `import * as c${i} from ${JSON.stringify(file)};`);
  const merge = files.map((_, i) => `c${i}`).join(", ");
  return `${imports.join("\n")}\nexport const registry = Object.assign({}, ${merge});`;
};

/**
 * Compiles the doc's `.mdgen/components/**` into:
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
  const files = await listComponentFiles(componentsDir);
  if (!files.length) return { registry: {}, hasComponents: false };

  const entry = buildEntry(files);
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
