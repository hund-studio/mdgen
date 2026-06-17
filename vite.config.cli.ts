import { chmodSync, existsSync } from "fs";
import { defineConfig, Plugin } from "vite";
import path, { resolve } from "path";

const chmod = (path: string): Plugin => ({
  name: "chmod",
  closeBundle: () => {
    existsSync(path);
    chmodSync(path, 0o755);
  },
});

const r = (p: string) => resolve(__dirname, p);
const outDir = "dist-cli";
const entry = r("dist-cli/cli.js");

export default defineConfig({
  resolve: { alias: { "@static": r("src/static") } },
  plugins: [chmod(entry)],
  publicDir: false,
  build: {
    ssr: true,
    outDir,
    emptyOutDir: true,
    target: "node18",
    minify: "esbuild",
    lib: {
      entry: r("src/cli.ts"),
      formats: ["es"],
      fileName: "cli",
    },
    rollupOptions: {
      external: (id) => !id.startsWith(".") && !id.startsWith("@static") && !path.isAbsolute(id),
      output: {
        banner: "#!/usr/bin/env node",
        inlineDynamicImports: true,
        compact: true,
      },
    },
  },
});
