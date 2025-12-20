import { Command } from "commander";
import { create, save } from "@orama/orama";
import fs from "fs/promises";
import path from "path";
import utils from "./utils";

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
    .option("-o, --outDir <path>", "Parent directory where the output will be saved", "../")
    .option("-n, --name <name>", "Name of the output folder", "generated")
    .parse(process.argv);

  const options = program.opts();

  const db = await create({
    schema: { title: "string", content: "string", href: "string" },
  });

  const sourceDir = path.resolve(options.source);

  const outputDir = path.resolve(sourceDir, options.outDir, options.name);

  console.log(`📂 Source: ${sourceDir}`);
  console.log(`🎯 Output: ${outputDir}`);

  const config = await utils.customConfig.fromFSDirectory(sourceDir);
  const tree = await utils.directoryEntry.fromFSDirectory(sourceDir, { db });

  console.log("Generating static site...");

  await utils.directoryEntry.toFS(tree, {
    outputDir,
    tree,
    config,
  });

  const searchIndex = await save(db);

  await fs.writeFile(path.join(outputDir, "search.json"), JSON.stringify(searchIndex));

  console.log(`✅ Documentation site generated in: ${outputDir}`);
}

run();
