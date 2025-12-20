import { Command, type OptionValues } from "commander";
import { save } from "@orama/orama";
import chokidar from "chokidar";
import fs from "fs/promises";
import path from "path";
import utils from "./utils";

const generate = async (options: OptionValues) => {
  const db = await utils.db.create();
  const sourceDir = path.resolve(options.source);
  const outputDir = path.resolve(options.outDir, options.name);

  console.log(`📂 Source: ${sourceDir}`);
  console.log(`🎯 Output: ${outputDir}`);

  try {
    const config = await utils.customConfig.fromFSDirectory(sourceDir);
    const tree = await utils.directoryEntry.fromFSDirectory(sourceDir, { db });

    console.log("Generating static site...");

    await utils.directoryEntry.toFS(tree, {
      outputDir,
      config,
    });

    const searchIndex = await save(db);

    await fs.writeFile(path.join(outputDir, "search.json"), JSON.stringify(searchIndex));

    console.log(`✅ Documentation site generated in: ${outputDir}`);
  } catch (err) {
    console.error("❌ Generation failed:", err);
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
    .option("-w, --watch", "Watch for changes in the source directory")
    .parse(process.argv);

  const options = program.opts();

  await generate(options);

  if (options.watch) {
    console.log(`👀 Watching for changes in: ${options.source}...`);

    const watcher = chokidar.watch(options.source, {
      ignored: /(^|[\/\\])\../,
      persistent: true,
      ignoreInitial: true,
    });

    watcher.on("all", async (event, path) => {
      console.log(`[${event}] ${path} changed, rebuilding...`);
      await generate(options);
    });
  }
}

run();
