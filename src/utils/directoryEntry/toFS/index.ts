import { renderToString } from "react-dom/server";
import { StaticRouter } from "react-router-dom";
import CSSTemplate from "@static/assets/static.css?raw";
import fs from "fs/promises";
import Handlebars from "handlebars";
import HTMLTemplate from "@static/static.html?raw";
import JSTemplate from "@static/assets/main.js?raw";
import Page from "../../../components/page/page";
import path from "path";
import React from "react";
import staticIcon from "@static/icon.png";
import staticIconsCaret from "@static/assets/icons/caret.svg?raw";
import staticIconsSchemaAuto from "@static/assets/icons/schema/auto.svg?raw";
import staticIconsSchemaDark from "@static/assets/icons/schema/dark.svg?raw";
import staticIconsSchemaLight from "@static/assets/icons/schema/light.svg?raw";
import type utils from "../..";

type Config = Awaited<ReturnType<typeof utils.customConfig.fromFSDirectory>>[1];

type I18nContext = {
  /** Locale this subtree belongs to (e.g. `it-IT`). */
  locale: string;
  /** All available locales, in declared order. */
  locales: string[];
  /** locale → set of root-relative `.html` keys present in that locale. */
  routeSets: Record<string, Set<string>>;
};

const joinPaths = (...parts: string[]) =>
  "/" + parts.join("/").replace(/^\/+/, "").replace(/\/+/g, "/");

/**
 * Writes the shared static assets (runtime, styles, icons, brand) into a
 * directory. Called once per site at the public root, even when the content is
 * split across locale subfolders.
 */
export const writeAssets = async (
  outputDir: string,
  { config, publicUrl }: { config?: Config; publicUrl: string }
) => {
  await fs.mkdir(outputDir, { recursive: true });
  await fs.writeFile(path.join(outputDir, "icon.png"), staticIcon);

  const assetsDir = path.join(outputDir, "assets");
  await fs.mkdir(assetsDir, { recursive: true });

  const jsTemplate = Handlebars.compile(JSTemplate);
  await fs.writeFile(path.join(assetsDir, "main.js"), jsTemplate({ publicUrl }));

  const cssTemplate = Handlebars.compile(CSSTemplate);
  await fs.writeFile(path.join(assetsDir, "static.css"), cssTemplate({ publicUrl }));

  const iconsDir = path.join(assetsDir, "icons");
  await fs.mkdir(iconsDir, { recursive: true });
  await fs.writeFile(path.join(iconsDir, "caret.svg"), staticIconsCaret);

  const iconsSchemaDir = path.join(assetsDir, "icons/schema");
  await fs.mkdir(iconsSchemaDir, { recursive: true });
  await fs.writeFile(path.join(iconsSchemaDir, "auto.svg"), staticIconsSchemaAuto);
  await fs.writeFile(path.join(iconsSchemaDir, "light.svg"), staticIconsSchemaLight);
  await fs.writeFile(path.join(iconsSchemaDir, "dark.svg"), staticIconsSchemaDark);

  if (config?.brand) {
    await fs.writeFile(path.join(assetsDir, config.brand.name), config.brand.file);
  }
  if (config?.style) {
    await fs.writeFile(path.join(assetsDir, "custom.css"), config.style);
  }
};

const buildRuntime = (
  entryHref: string,
  publicUrl: string,
  search: boolean,
  i18n?: I18nContext
): MdgenRuntime => {
  if (!i18n) {
    return { publicUrl, page: entryHref, search, locale: null, locales: [], translations: {} };
  }

  // Strip the leading `/<locale>/` to get the locale-relative html key.
  const prefix = `/${i18n.locale}/`;
  const relKey = entryHref.startsWith(prefix)
    ? entryHref.slice(prefix.length)
    : entryHref.replace(/^\//, "");

  const translations: Record<string, string | null> = {};
  for (const locale of i18n.locales) {
    translations[locale] = i18n.routeSets[locale]?.has(relKey)
      ? joinPaths(publicUrl, locale, relKey)
      : null;
  }

  return {
    publicUrl,
    page: entryHref,
    search,
    locale: i18n.locale,
    locales: i18n.locales,
    translations,
  };
};

const toFS = async (
  directoryEntry: FSDirectoryEntry,
  {
    config,
    outputDir,
    tree,
    publicUrl,
    manifest = {},
    emitAssets,
    i18n,
  }: {
    config?: Config;
    outputDir: string;
    tree?: FSDirectoryEntry;
    publicUrl: string;
    manifest?: Record<string, string>;
    /** Write shared assets on the root call (defaults to true). */
    emitAssets?: boolean;
    i18n?: I18nContext;
  }
) => {
  await fs.mkdir(outputDir, { recursive: true });

  const isRoot = !tree;
  if (isRoot && (emitAssets ?? true)) {
    await writeAssets(outputDir, { config, publicUrl });
  }

  for (const entry of directoryEntry.children) {
    if ("children" in entry) {
      const nextOutputDir = path.join(outputDir, entry.slug);
      await toFS(entry, {
        config,
        outputDir: nextOutputDir,
        tree: tree || directoryEntry,
        publicUrl,
        manifest,
        emitAssets,
        i18n,
      });
      continue;
    }

    if ("buffer" in entry) {
      await fs.writeFile(path.join(outputDir, entry.name), entry.buffer);
      continue;
    }

    const htmlTemplate = Handlebars.compile(HTMLTemplate);
    const pageTree = tree || directoryEntry;

    const relativeHref = entry.href.replace(/^\//, "");
    const cleanRoute =
      "/" +
      relativeHref
        .replace(".html", "")
        .replace(/index$/, "")
        .replace(/\/+$/, "");

    const htmlRoute = "/" + relativeHref;
    const contentFileName = entry.name.replace(".html", ".content");
    const manifestContentPath = path
      .join(path.dirname(relativeHref), contentFileName)
      .replace(/\\/g, "/")
      .replace(/^\.\//, "");

    manifest[cleanRoute || "/"] = manifestContentPath;
    manifest[htmlRoute] = manifestContentPath;

    if (entry.name === "index.html") {
      const dirPath = "/" + path.dirname(relativeHref).replace(/^\.$/, "");
      manifest[dirPath === "//" ? "/" : dirPath] = manifestContentPath;
    }

    const currentPath = relativeHref;
    const runtime = buildRuntime(entry.href, publicUrl, config?.search !== false, i18n);

    const htmlContent = htmlTemplate({
      body: renderToString(
        React.createElement(
          StaticRouter,
          {
            location: path.normalize([publicUrl, currentPath].join("/")),
            basename: publicUrl,
          },
          React.createElement(Page, {
            path: currentPath,
            sidebar: pageTree,
            content: entry.content,
            // Pre-render search trigger + language switcher server-side (both are
            // known at build time) to avoid layout shift on hydration.
            search: runtime.search,
            locale: runtime.locale,
            locales: runtime.locales,
            translations: runtime.translations,
          })
        )
      ),
      content: entry.content,
      data: JSON.stringify(pageTree),
      runtime: JSON.stringify(runtime),
      style: !!config?.style,
      publicUrl,
    });

    await fs.writeFile(path.join(outputDir, contentFileName), entry.content);
    await fs.writeFile(path.join(outputDir, entry.name), htmlContent);
  }

  if (isRoot) {
    await fs.writeFile(path.join(outputDir, "manifest.json"), JSON.stringify(manifest, null, 2));
  }
};

export default toFS;
