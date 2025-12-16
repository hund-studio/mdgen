// vite.config.app2.js
import { defineConfig, Plugin } from "vite";
import { resolve } from "path";
import { readFileSync } from "fs";

const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf-8"));
const version = pkg.version;

const versionPlugin = (): Plugin => {
  return {
    name: "html-version",
    transformIndexHtml(html) {
      const scriptRegex = /(\/assets\/main\.js)/;
      const cssRegex = /(\/assets\/static\.css)/;
      const newHtml = html
        .replace(scriptRegex, `$1?v=${version}`)
        .replace(cssRegex, `$1?v=${version}`);
      return newHtml;
    },
  };
};

export default defineConfig({
  plugins: [versionPlugin()],
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
