import { Command, type OptionValues } from "commander";
import { save } from "@orama/orama";
import chokidar from "chokidar";
import fs from "fs/promises";
import path from "path";
import utils from "./utils";

const generate = async (
  options: OptionValues,
  { verbose }: { verbose: string } = { verbose: "all" }
) => {
  verbose === "all" && console.log(`${utils.cli.print.separator}`);
  verbose === "all" &&
    console.log(
      `${utils.cli.print.sl.yellow}${utils.cli.print.sl.magenta} [cmd] Generate HTML from CLI...`
    );
  verbose === "all" && console.log(`${utils.cli.print.separator}`);
  verbose === "all" &&
    console.log(`${utils.cli.print.sl.yellow}${utils.cli.print.sl.green} CLI options:`);
  verbose === "all" &&
    console.log(`${utils.cli.print.sl.yellow}${utils.cli.print.sl.gray} root:\t${path.resolve()}`);
  verbose === "all" &&
    console.log(
      `${utils.cli.print.sl.yellow}${utils.cli.print.sl.gray} source:\t${options.source}`
    );
  verbose === "all" &&
    console.log(
      `${utils.cli.print.sl.yellow}${utils.cli.print.sl.gray} outDir:\t${options.outDir}`
    );
  verbose === "all" &&
    console.log(`${utils.cli.print.sl.yellow}${utils.cli.print.sl.gray} name:\t${options.name}`);
  verbose === "all" && console.log(`${utils.cli.print.separator}`);

  const db = await utils.db.create();
  const sourceDir = path.resolve(options.source);
  const outputDir = path.resolve(options.outDir, options.name);

  verbose === "all" &&
    console.log(`${utils.cli.print.sl.yellow}${utils.cli.print.sl.green} Generator config:`);
  verbose === "all" &&
    console.log(`${utils.cli.print.sl.yellow}${utils.cli.print.sl.gray} source:\t${sourceDir}`);
  verbose === "all" &&
    console.log(`${utils.cli.print.sl.yellow}${utils.cli.print.sl.gray} output:\t${outputDir}`);

  let publicUrl = options.publicUrl || "/";
  if (!publicUrl.startsWith("/")) publicUrl = "/" + publicUrl;
  if (!publicUrl.endsWith("/")) publicUrl = publicUrl + "/";

  try {
    const [found, config] = await utils.customConfig.fromFSDirectory(sourceDir);

    if (found) {
      verbose === "all" &&
        console.log(
          `${utils.cli.print.sl.yellow}${utils.cli.print.sl.gray} config:\t${path.join(
            sourceDir,
            ".mdgen"
          )}`
        );
    }
    verbose === "all" && console.log(`${utils.cli.print.separator}`);

    const tree = await utils.directoryEntry.fromFSDirectory(sourceDir, { db, publicUrl });

    console.log(
      `${utils.cli.print.sl.yellow}${utils.cli.print.sl.orange}`,
      "[gen] Generating HTML..."
    );

    await utils.directoryEntry.toFS(tree, {
      outputDir,
      config,
      publicUrl,
    });

    const searchIndex = await save(db);

    await fs.writeFile(path.join(outputDir, "search.json"), JSON.stringify(searchIndex));

    console.log(
      `${utils.cli.print.sl.yellow}${utils.cli.print.sl.green}`,
      `[gen] HTML generation complete in: ${outputDir}`
    );
    console.log(`${utils.cli.print.separator}`);
  } catch (err) {
    console.error(
      `${utils.cli.print.sl.yellow}${utils.cli.print.sl.red}`,
      "[gen] Generation failed:",
      err
    );
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
  files into a static HTML documentation site. It scans your source directory
  and renders pages ready for online publication, processing everything
  locally on your machine.
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
      `${utils.cli.print.sl.yellow}${utils.cli.print.sl.magenta}`,
      `[watch] Watching for changes in: ${options.source}...`
    );
    console.log(`${utils.cli.print.separator}`);

    const watcher = chokidar.watch(options.source, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("all", async (event, path) => {
      console.log(
        `${utils.cli.print.sl.yellow}${utils.cli.print.sl.orange}`,
        `[${event}] ${path} changed, regenerating...`
      );
      await generate(options, { verbose: "output" });
    });
  }
}

run();
