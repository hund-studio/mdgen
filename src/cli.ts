import { Command, type OptionValues } from "commander";
import { save } from "@orama/orama";
import chokidar from "chokidar";
import fs from "fs/promises";
import path from "path";
import utils from "./utils";

const { print } = utils.cli;

const joinUrl = (...parts: string[]) =>
  "/" + parts.join("/").replace(/^\/+/, "").replace(/\/+/g, "/");

/** Collects the locale-relative `.html` keys (e.g. `guide/index.html`) of a tree. */
const collectRouteSet = (tree: FSDirectoryEntry, locale: string): Set<string> => {
  const prefix = `/${locale}/`;
  const set = new Set<string>();

  const walk = (node: FSDirectoryEntry) => {
    for (const child of node.children) {
      if ("children" in child) {
        walk(child);
      } else if ("href" in child) {
        const key = child.href.startsWith(prefix)
          ? child.href.slice(prefix.length)
          : child.href.replace(/^\//, "");
        set.add(key);
      }
    }
  };

  walk(tree);
  return set;
};

/** Static landing page at the site root that redirects to the best-matching locale. */
const renderRootRedirect = (publicUrl: string, locales: string[], defaultLocale: string) => {
  const targets = Object.fromEntries(locales.map((l) => [l, joinUrl(publicUrl, l) + "/"]));
  const fallback = joinUrl(publicUrl, defaultLocale) + "/";

  return `<!DOCTYPE html>
<html lang="${defaultLocale}">
  <head>
    <meta charset="UTF-8" />
    <meta http-equiv="refresh" content="0; url=${fallback}" />
    <script>
      (function () {
        var targets = ${JSON.stringify(targets)};
        var fallback = ${JSON.stringify(fallback)};
        var langs = navigator.languages || [navigator.language || ""];
        for (var i = 0; i < langs.length; i++) {
          var tag = langs[i];
          if (targets[tag]) { location.replace(targets[tag]); return; }
          var base = tag.split("-")[0].toLowerCase();
          for (var code in targets) {
            if (code.split("-")[0].toLowerCase() === base) { location.replace(targets[code]); return; }
          }
        }
        location.replace(fallback);
      })();
    </script>
  </head>
  <body></body>
</html>
`;
};

const generate = async (
  options: OptionValues,
  { verbose }: { verbose: string } = { verbose: "all" }
) => {
  const isVerbose = verbose === "all";

  const logVerbose = (msg: string) => isVerbose && console.log(`${print.sl.yellow}${msg}`);

  if (isVerbose) {
    console.log(print.separator);
    logVerbose(`${print.sl.magenta} [cmd] Generate HTML from CLI...`);
    console.log(print.separator);
    logVerbose(`${print.sl.green} CLI options:`);
    logVerbose(`${print.sl.gray} root:\t${path.resolve()}`);
    logVerbose(`${print.sl.gray} source:\t${options.source}`);
    logVerbose(`${print.sl.gray} outDir:\t${options.outDir}`);
    logVerbose(`${print.sl.gray} name:\t${options.name}`);
    console.log(print.separator);
  }

  const sourceDir = path.resolve(options.source);
  const outputDir = path.resolve(options.outDir, options.name);

  if (isVerbose) {
    logVerbose(`${print.sl.green} Generator config:`);
    logVerbose(`${print.sl.gray} source:\t${sourceDir}`);
    logVerbose(`${print.sl.gray} output:\t${outputDir}`);
  }

  let publicUrl = options.publicUrl || "/";
  if (!publicUrl.startsWith("/")) publicUrl = "/" + publicUrl;
  if (!publicUrl.endsWith("/")) publicUrl = publicUrl + "/";

  try {
    const [found, config] = await utils.customConfig.fromFSDirectory(sourceDir);

    if (found && isVerbose) {
      logVerbose(`${print.sl.gray} config:\t${path.join(sourceDir, ".mdgen")}`);
    }

    if (isVerbose) console.log(print.separator);

    console.log(`${print.sl.yellow}${print.sl.orange}`, "[gen] Generating HTML...");

    const locales = config.locales ?? [];
    const searchEnabled = config.search !== false;

    if (locales.length) {
      const defaultLocale = config.defaultLocale ?? locales[0];

      // 1. Build a tree per locale (hrefs scoped under `/<locale>/`), each with its own index.
      const built: {
        locale: string;
        db?: Awaited<ReturnType<typeof utils.db.create>>;
        tree: FSDirectoryEntry;
      }[] = [];
      for (const locale of locales) {
        const localeSource = path.join(sourceDir, locale);
        try {
          await fs.access(localeSource);
        } catch {
          console.warn(`${print.sl.yellow}${print.sl.red}`, `[gen] Missing locale folder: ${locale}`);
          continue;
        }

        const db = searchEnabled ? await utils.db.create() : undefined;
        const tree = await utils.directoryEntry.fromFSDirectory(localeSource, {
          db,
          publicUrl: joinUrl(locale),
        });
        built.push({ locale, db, tree });
      }

      const presentLocales = built.map((b) => b.locale);
      const routeSets: Record<string, Set<string>> = Object.fromEntries(
        built.map(({ locale, tree }) => [locale, collectRouteSet(tree, locale)])
      );

      // 2. Shared assets at the public root (once for all locales).
      await utils.directoryEntry.writeAssets(outputDir, { config, publicUrl });

      // 3. Emit each locale into its own subfolder + per-locale search index.
      for (const { locale, db, tree } of built) {
        await utils.directoryEntry.toFS(tree, {
          outputDir: path.join(outputDir, locale),
          config,
          publicUrl,
          emitAssets: false,
          i18n: { locale, locales: presentLocales, routeSets },
        });

        if (db) {
          const searchIndex = await save(db);
          await fs.writeFile(
            path.join(outputDir, locale, "search.json"),
            JSON.stringify(searchIndex)
          );
        }
      }

      // 4. Root landing page that redirects to the best-matching locale.
      const redirectLocale = presentLocales.includes(defaultLocale)
        ? defaultLocale
        : presentLocales[0];
      await fs.writeFile(
        path.join(outputDir, "index.html"),
        renderRootRedirect(publicUrl, presentLocales, redirectLocale)
      );
    } else {
      const db = searchEnabled ? await utils.db.create() : undefined;
      const tree = await utils.directoryEntry.fromFSDirectory(sourceDir, { db });

      await utils.directoryEntry.toFS(tree, {
        outputDir,
        config,
        publicUrl,
      });

      if (db) {
        const searchIndex = await save(db);
        await fs.writeFile(path.join(outputDir, "search.json"), JSON.stringify(searchIndex));
      }
    }

    console.log(
      `${print.sl.yellow}${print.sl.green}`,
      `[gen] HTML generation complete in: ${outputDir}`
    );
    console.log(print.separator);
  } catch (err) {
    console.error(`${print.sl.yellow}${print.sl.red}`, "[gen] Generation failed:", err);
  }
};

async function run() {
  const program = new Command();

  program
    .name("mdgen")
    .description("A CLI tool to generate static documentation sites.")
    .version("1.0.0")
    .addHelpText(
      "after",
      `
Description:
  mdgen is a serverless CLI tool that transforms your local Markdown (.md)
  files into a static HTML documentation site.
`
    )
    .option("-s, --source <path>", "The directory containing your markdown files", ".")
    .option("-o, --outDir <path>", "Parent directory where the output will be saved", ".")
    .option("-n, --name <name>", "Name of the output folder", "generated")
    .option("-u, --public-url <url>", "The base URL or path for the site (e.g., /docs/)", "/")
    .option("-w, --watch", "Watch for changes in the source directory")
    .parse(process.argv);

  const options = program.opts();

  await generate(options);

  if (options.watch) {
    console.log(
      `${print.sl.yellow}${print.sl.magenta}`,
      `[watch] Watching for changes in: ${options.source}...`
    );
    console.log(print.separator);

    const watcher = chokidar.watch(options.source, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("all", async (event, filePath) => {
      console.log(
        `${print.sl.yellow}${print.sl.orange}`,
        `[${event}] ${filePath} changed, regenerating...`
      );
      await generate(options, { verbose: "output" });
    });
  }
}

run();
