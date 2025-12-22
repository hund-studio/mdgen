import { renderToString } from "react-dom/server";
import CSSBundle from "@static/assets/static.css?raw";
import Handlebars from "handlebars";
import HTMLTemplate from "@static/static.html?raw";
import JSBundle from "@static/assets/main.js?raw";
import JSZip from "jszip";
import Page from "../../../components/page/page";
import staticIcon from "@static/icon.png";
import staticIconsSchemaAuto from "@static/assets/icons/schema/auto.svg?raw";
import staticIconsSchemaDark from "@static/assets/icons/schema/dark.svg?raw";
import staticIconsSchemaLight from "@static/assets/icons/schema/light.svg?raw";
import staticIconsCaret from "@static/assets/icons/caret.svg?raw";
import type utils from "../..";

const toZIP = async (
  directoryEntry: BrowserDirectoryEntry,
  {
    config,
    parentDirectory,
    tree,
  }: {
    config?: Awaited<ReturnType<typeof utils.customConfig.fromDirectoryHandle>>;
    parentDirectory: JSZip;
    tree?: BrowserDirectoryEntry;
  }
) => {
  const current = parentDirectory.folder(directoryEntry.name);
  if (!current) return;

  if (!tree) {
    const assets = current.folder("assets");

    assets?.file("main.js", JSBundle);
    assets?.file("static.css", CSSBundle);

    assets?.file("icon.png", staticIcon);

    const icons = assets?.folder("icons");

    icons?.file("caret.svg", staticIconsCaret);

    const iconsSchema = assets?.folder("icons/schema");

    iconsSchema?.file("auto.svg", staticIconsSchemaAuto);
    iconsSchema?.file("dark.svg", staticIconsSchemaDark);
    iconsSchema?.file("light.svg", staticIconsSchemaLight);

    if (config?.brand) assets?.file(config.brand.name, config.brand.file);
    if (config?.style) assets?.file("custom.css", config.style);
  }

  for (const entry of directoryEntry.children) {
    if ("children" in entry) {
      const root = current.folder(entry.slug);
      if (!root) continue;
      toZIP(entry, { config, parentDirectory: root, tree });
      continue;
    }
    if ("buffer" in entry) {
      current.file(entry.name, entry.buffer);
      continue;
    }
    const template = Handlebars.compile(HTMLTemplate);
    const pageTree = tree || directoryEntry;
    current.file(
      entry.name,
      template({
        body: renderToString(
          <Page
            path={[pageTree.path, entry.name].join("/")}
            sidebar={pageTree}
            content={entry.content}
          />
        ),
        content: entry.content,
        data: JSON.stringify(pageTree),
        style: !!config?.style,
      })
    );
  }

  return current;
};

export default toZIP;
