import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import React from "react";
import fs from "fs/promises";
import path from "path";
import Handlebars from "handlebars";

import Page from "../../../components/page/page";
import HTMLTemplateSource from "@static/static.html?raw";
import JSTemplateSource from "@static/assets/main.js?raw";
import CSSTemplateSource from "@static/assets/static.css?raw";
import staticIcon from "@static/icon.png";
import staticIconsCaret from "@static/assets/icons/caret.svg?raw";
import staticIconsSchemaAuto from "@static/assets/icons/schema/auto.svg?raw";
import staticIconsSchemaDark from "@static/assets/icons/schema/dark.svg?raw";
import staticIconsSchemaLight from "@static/assets/icons/schema/light.svg?raw";

const compileHTML = Handlebars.compile(HTMLTemplateSource);
const compileJS = Handlebars.compile(JSTemplateSource);
const compileCSS = Handlebars.compile(CSSTemplateSource);

async function writeSystemAssets(outputDir: string, publicUrl: string, config: any) {
  const assetsDir = path.join(outputDir, "assets");
  const iconsDir = path.join(assetsDir, "icons");
  const schemaDir = path.join(iconsDir, "schema");

  await fs.mkdir(schemaDir, { recursive: true });

  await Promise.all([
    fs.writeFile(path.join(outputDir, "icon.png"), staticIcon),
    fs.writeFile(path.join(assetsDir, "main.js"), compileJS({ publicUrl })),
    fs.writeFile(path.join(assetsDir, "static.css"), compileCSS({ publicUrl })),
    fs.writeFile(path.join(iconsDir, "caret.svg"), staticIconsCaret),
    fs.writeFile(path.join(schemaDir, "auto.svg"), staticIconsSchemaAuto),
    fs.writeFile(path.join(schemaDir, "light.svg"), staticIconsSchemaDark),
    fs.writeFile(path.join(schemaDir, "dark.svg"), staticIconsSchemaLight),
  ]);

  if (config?.brand) await fs.writeFile(path.join(assetsDir, config.brand.name), config.brand.file);
  if (config?.style) await fs.writeFile(path.join(assetsDir, "custom.css"), config.style);
}

function resolveRoutes(relativeHref: string, entryName: string) {
  const clean =
    "/" +
    relativeHref
      .replace(".html", "")
      .replace(/index$/, "")
      .replace(/\/+$/, "");
  const html = "/" + relativeHref;
  const contentFile = entryName.replace(".html", ".content");
  const manifestPath = path
    .join(path.dirname(relativeHref), contentFile)
    .replace(/\\/g, "/")
    .replace(/^\.\//, "");

  return { clean: clean || "/", html, contentFile, manifestPath };
}

const toFS = async (
  directoryEntry: FSDirectoryEntry,
  { config, outputDir, tree, publicUrl, manifest = {} }: any
) => {
  await fs.mkdir(outputDir, { recursive: true });

  if (!tree) await writeSystemAssets(outputDir, publicUrl, config);

  for (const entry of directoryEntry.children) {
    if ("children" in entry) {
      await toFS(entry, {
        config,
        outputDir: path.join(outputDir, entry.slug),
        tree: tree || directoryEntry,
        publicUrl,
        manifest,
      });
      continue;
    }

    if ("buffer" in entry) {
      await fs.writeFile(path.join(outputDir, entry.name), entry.buffer);
      continue;
    }

    const pageTree = tree || directoryEntry;
    const routes = resolveRoutes(entry.href.replace(/^\//, ""), entry.name);

    manifest[routes.clean] = routes.manifestPath;
    manifest[routes.html] = routes.manifestPath;

    if (entry.name === "index.html") {
      const dirPath = "/" + path.dirname(entry.href.replace(/^\//, "")).replace(/^\.$/, "");
      manifest[dirPath === "//" ? "/" : dirPath] = routes.manifestPath;
    }

    const body = renderToString(
      React.createElement(
        StaticRouter,
        {
          location: path.normalize([publicUrl, routes.html].join("/")),
          basename: publicUrl,
        },
        React.createElement(Page, {
          path: routes.html,
          sidebar: pageTree,
          content: entry.content,
        })
      )
    );

    const htmlOutput = compileHTML({
      body,
      content: entry.content,
      data: JSON.stringify(pageTree),
      style: !!config?.style,
      publicUrl,
    });

    await Promise.all([
      fs.writeFile(path.join(outputDir, routes.contentFile), entry.content),
      fs.writeFile(path.join(outputDir, entry.name), htmlOutput),
    ]);
  }

  if (!tree) {
    await fs.writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  }
};

export default toFS;
