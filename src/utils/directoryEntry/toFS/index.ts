import fs from "fs/promises";
import path from "path";
import { renderToString } from "react-dom/server";
import Handlebars from "handlebars";
import React from "react";

// Nota: Questi import ?raw funzionano se usi Vite per buildare la CLI.
// Se la CLI fosse Node puro, dovresti usare fs.readFile.
import CSSBundle from "../../../static/assets/static.css?raw";
import HTMLTemplate from "../../../static/static.html?raw";
import JSBundle from "../../../static/assets/main.js?raw";

import Page from "../../../components/page/page";

const toFS = async (
  directoryEntry: any, // Il tuo Tree
  {
    outputDir,
    tree,
    config,
  }: {
    outputDir: string;
    tree?: any;
    config?: any;
  }
) => {
  await fs.mkdir(outputDir, { recursive: true });

  const assetsDir = path.join(outputDir, "assets");
  await fs.mkdir(assetsDir, { recursive: true });

  await fs.writeFile(path.join(assetsDir, "main.js"), JSBundle);
  await fs.writeFile(path.join(assetsDir, "static.css"), CSSBundle);

  if (config?.brand) {
    await fs.writeFile(path.join(assetsDir, config.brand.name), config.brand.file);
  }
  if (config?.style) {
    await fs.writeFile(path.join(assetsDir, "custom.css"), config.style);
  }

  for (const entry of directoryEntry.children) {
    if ("children" in entry) {
      const nextOutputDir = path.join(outputDir, entry.slug);
      await toFS(entry, { config, outputDir: nextOutputDir, tree: tree || directoryEntry });
      continue;
    }

    if ("buffer" in entry) {
      await fs.writeFile(path.join(outputDir, entry.name), entry.buffer);
      continue;
    }

    const template = Handlebars.compile(HTMLTemplate);
    const pageTree = tree || directoryEntry;

    const htmlContent = template({
      body: renderToString(
        React.createElement(Page, {
          path: [pageTree.path, entry.name].filter(Boolean).join("/"),
          sidebar: pageTree,
          content: entry.content,
        })
      ),
      content: entry.content,
      data: JSON.stringify(pageTree),
      style: !!config?.style,
    });

    await fs.writeFile(path.join(outputDir, entry.name), htmlContent);
  }
};

export default toFS;
