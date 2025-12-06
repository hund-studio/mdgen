// vite.config.app2.js
import { defineConfig } from "vite";
import { resolve } from "path";

export default defineConfig({
  build: {
    outDir: "src/static",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        static: resolve(__dirname, "static.html"),
      },
      output: {
        manualChunks: {},
        entryFileNames: "assets/main.js",
        assetFileNames: "assets/[name][extname]",
      },
    },
  },
});
