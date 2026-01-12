import { Command, type OptionValues } from "commander";
import { save } from "@orama/orama";
import chokidar from "chokidar";
import fs from "fs/promises";
import path from "path";
import utils from "./utils";

const { print } = utils.cli;

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

  const db = await utils.db.create();
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

    // const tree = await utils.directoryEntry.fromFSDirectory(sourceDir, { db, publicUrl });
    const tree = await utils.directoryEntry.fromFSDirectory(sourceDir, { db });

    console.log(`${print.sl.yellow}${print.sl.orange}`, "[gen] Generating HTML...");

    await utils.directoryEntry.toFS(tree, {
      outputDir,
      config,
      publicUrl,
    });

    const searchIndex = await save(db);
    await fs.writeFile(path.join(outputDir, "search.json"), JSON.stringify(searchIndex));

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
