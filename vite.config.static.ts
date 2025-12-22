import { defineConfig, Plugin } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";

const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf-8"));
const version = pkg.version;

const versionPlugin = (): Plugin => {
  return {
    name: "html-version",
    enforce: "post",
    transformIndexHtml(html) {
      const scriptRegex = /(\/assets\/main\.js)/g;
      const cssRegex = /(\/assets\/static\.css)/g;
      let newHtml = html
        .replace(scriptRegex, `$1?v=${version}`)
        .replace(cssRegex, `$1?v=${version}`);

      const customCssLinkRegex =
        /(\s*)(\{{#if [^}]+\}\}\s*<link[^>]*data-head[^>]*>\s*{{\/if}})(\s*)/gi; // More general regex

      const customCssMatches = [...newHtml.matchAll(customCssLinkRegex)];

      if (!!customCssMatches.length) {
        let customCssTagsToMove = "";
        const targetIndent = "    ";

        for (const match of customCssMatches) {
          customCssTagsToMove += `${targetIndent}${match[2]}\n`;
        }

        newHtml = newHtml.replace(customCssLinkRegex, "");
        const headEndRegex = /(\s*)(<\/head>)/i;
        newHtml = newHtml.replace(headEndRegex, `\n${customCssTagsToMove}$2`);
      }

      return newHtml;
    },
  };
};

export default defineConfig({
  root: "templates",
  resolve: {
    alias: {
      "@static": resolve(__dirname, "src/static"),
    },
  },
  publicDir: "../public-static",
  plugins: [versionPlugin()],
  build: {
    outDir: "../src/static",
    emptyOutDir: true,
    rollupOptions: {
      input: {
        static: resolve(__dirname, "templates/static.html"),
      },
      output: {
        manualChunks: {},
        entryFileNames: "assets/main.js",
        assetFileNames: "assets/[name][extname]",
      },
      onwarn(warning, warn) {
        if (warning.code === "MODULE_LEVEL_DIRECTIVE") return;
        warn(warning);
      },
    },
  },
});
