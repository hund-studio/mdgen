import { create, save } from "@orama/orama";
import fs from "fs/promises";
import path from "path";
import utils from "./utils";

async function run() {
  const db = await create({
    schema: { title: "string", content: "string", href: "string" },
  });

  const sourceDir = process.cwd();
  const outputDir = path.join(sourceDir, "../generated");

  const tree = await utils.directoryEntry.fromFSDirectory(sourceDir, { db });

  console.log("Generating static site...");
  await utils.directoryEntry.toFS(tree, {
    outputDir,
    tree,
    config: {},
  });

  const searchIndex = await save(db);
  await fs.writeFile(path.join(outputDir, "search.json"), JSON.stringify(searchIndex));

  console.log(`✅ Documentation site generated in: ${outputDir}`);
}

run();
