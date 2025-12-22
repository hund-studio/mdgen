import { defineConfig, Plugin } from "vite";
import { resolve } from "path";
import fs from "fs";

const permissionsPlugin = (): Plugin => {
  return {
    name: "chmod-cli",
    closeBundle() {
      const path = resolve(__dirname, "dist-cli/cli.js");
      if (fs.existsSync(path)) {
        fs.chmodSync(path, 0o755);
        console.log(`\n✅ Executable permissions set on: ${path}`);
      }
    },
  };
};

export default defineConfig({
  resolve: {
    alias: {
      "@static": resolve(__dirname, "src/static"),
    },
  },
  plugins: [permissionsPlugin()],
  publicDir: false,
  build: {
    ssr: true,
    lib: {
      entry: resolve(__dirname, "src/cli.ts"),
      name: "mdgen-cli",
      fileName: "cli",
      formats: ["es"],
    },
    rollupOptions: {
      external: (id) => !id.startsWith("@static") && !id.startsWith(".") && !id.startsWith("/"),
      output: {
        banner: "#!/usr/bin/env node",
      },
    },
    outDir: "dist-cli",
    target: "node18",
    emptyOutDir: true,
  },
});
