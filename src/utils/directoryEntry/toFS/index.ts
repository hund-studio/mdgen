import { renderToString } from "react-dom/server";
import CSSBundle from "../../../static/assets/static.css?raw";
import fs from "fs/promises";
import Handlebars from "handlebars";
import HTMLTemplate from "../../../static/static.html?raw";
import JSBundle from "../../../static/assets/main.js?raw";
import Page from "../../../components/page/page";
import path from "path";
import React from "react";
import staticIcon from "../../../static/icon.png?raw";
import staticIconsSchemaAuto from "../../../static/assets/icons/schema/auto.svg?raw";
import staticIconsSchemaDark from "../../../static/assets/icons/schema/dark.svg?raw";
import staticIconsSchemaLight from "../../../static/assets/icons/schema/light.svg?raw";

const toFS = async (
  directoryEntry: any,
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

  if (!tree) {
    await fs.writeFile(path.join(outputDir, "icon.png"), staticIcon);

    const assetsDir = path.join(outputDir, "assets");
    await fs.mkdir(assetsDir, { recursive: true });

    await fs.writeFile(path.join(assetsDir, "main.js"), JSBundle);
    await fs.writeFile(path.join(assetsDir, "static.css"), CSSBundle);

    const iconsSchemaDir = path.join(assetsDir, "icons/schema");
    await fs.mkdir(iconsSchemaDir, { recursive: true });

    await fs.writeFile(path.join(iconsSchemaDir, "auto.svg"), staticIconsSchemaAuto);
    await fs.writeFile(path.join(iconsSchemaDir, "light.svg"), staticIconsSchemaDark);
    await fs.writeFile(path.join(iconsSchemaDir, "dark.svg"), staticIconsSchemaLight);

    if (config?.brand) {
      await fs.writeFile(path.join(assetsDir, config.brand.name), config.brand.file);
    }
    if (config?.style) {
      await fs.writeFile(path.join(assetsDir, "custom.css"), config.style);
    }
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
