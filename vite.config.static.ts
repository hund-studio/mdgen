import { defineConfig, Plugin } from "vite";
import { readFileSync } from "fs";
import { resolve } from "path";

const pkg = JSON.parse(readFileSync(resolve("package.json"), "utf-8"));
const version = pkg.version;

const publicUrlAssetsPlugin = (): Plugin => {
  const cssUrlRegex = /url\(['"]?\/(assets\/[^'")]*)['"]?\)/g;
  const hbsReplacement = 'url("{{{publicUrl}}}$1")';

  return {
    name: "css-public-url-assets",
    enforce: "post",
    generateBundle(_, bundle) {
      for (const fileName in bundle) {
        const file = bundle[fileName];

        if (file.type === "asset" && fileName.endsWith(".css")) {
          const source = file.source.toString();
          file.source = source.replace(cssUrlRegex, hbsReplacement);
        }

        if (file.type === "chunk") {
          file.code = file.code.replace(cssUrlRegex, hbsReplacement);
        }
      }
    },
  };
};

const publicUrlPlugin = (): Plugin => {
  return {
    name: "html-public-url-hbs",
    enforce: "post",
    transformIndexHtml(html) {
      const assetRegex = /(href|src)="\/(assets\/|icon\.png)/g;

      let newHtml = html.replace(assetRegex, (match, attr, path) => {
        return `${attr}="{{{publicUrl}}}${path}`;
      });

      if (!newHtml.includes("{{{publicUrl}}}icon.png")) {
        newHtml = newHtml.replace('href="/icon.png"', 'href="{{{publicUrl}}}icon.png"');
      }

      return newHtml;
    },
  };
};

const publicUrlFetchPlugin = (): Plugin => {
  const fetchRegex = /fetch\(['"]\/([^'"]+)['"]\)/g;
  const hbsReplacement = "fetch(`{{{publicUrl}}}$1`)";

  return {
    name: "fetch-public-url-hbs",
    enforce: "post",
    transform(code, id) {
      if (/\.(js|ts|jsx|tsx)$/.test(id) && !id.includes("node_modules")) {
        if (code.includes("fetch(")) {
          const newCode = code.replace(fetchRegex, hbsReplacement);
          return {
            code: newCode,
            map: null,
          };
        }
      }
    },
  };
};

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
        /(\s*)(\{{#if [^}]+\}\}\s*<link[^>]*data-head[^>]*>\s*{{\/if}})(\s*)/gi;

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
  plugins: [publicUrlAssetsPlugin(), versionPlugin(), publicUrlPlugin(), publicUrlFetchPlugin()],
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
