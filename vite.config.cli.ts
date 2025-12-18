import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
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
      external: (id) => !id.startsWith(".") && !id.startsWith("/"),
      output: {
        banner: "#!/usr/bin/env node",
      },
    },
    outDir: "dist-cli",
    target: "node18",
    emptyOutDir: true,
  },
});
