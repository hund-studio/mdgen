import { insert } from "@orama/orama";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";

const SLUG_OPTS = { lower: true };

const joinPaths = (...parts: string[]) => parts.join("/").replace(/\/+/g, "/");

const extractTitle = (content: string): string | null => {
  const [firstLine] = content.split("\n");
  return firstLine?.startsWith("#") ? firstLine.replace(/^#\s*/, "").trim() : null;
};

const fromFSDirectory = async (
  absolutePath: string,
  {
    parentHref = "",
    db,
    publicUrl = "/",
  }: { parentHref?: string; db?: any; publicUrl?: string } = {}
) => {
  const dirName = path.basename(absolutePath);
  const items = await fs.readdir(absolutePath);
  const currentPath = parentHref || publicUrl;

  const hasIndex = items.some((name) => name.toLowerCase() === "index.md");

  const tree: FSTree = {
    name: dirName,
    slug: slugify(dirName, SLUG_OPTS),
    path: currentPath,
    children: [],
  };

  for (const itemName of items) {
    const itemPath = path.join(absolutePath, itemName);
    const stats = await fs.stat(itemPath);
    const slugName = slugify(itemName, SLUG_OPTS);

    if (stats.isDirectory()) {
      if (itemName.startsWith(".")) continue;

      const nextDirectoryPath = joinPaths(currentPath, slugName);
      const subTree = await fromFSDirectory(itemPath, {
        parentHref: nextDirectoryPath,
        db,
        publicUrl,
      });

      tree.children.push(subTree);
      continue;
    }

    if (itemName.toLowerCase().endsWith(".md")) {
      const textContent = await fs.readFile(itemPath, "utf-8");
      let fileName = slugName.replace(/\.md$/, ".html");

      if (!hasIndex && fileName === "readme.html") {
        fileName = "index.html";
      }

      const entry: PageEntry = {
        name: fileName,
        slug: fileName,
        href: joinPaths(currentPath, fileName),
        title: extractTitle(textContent),
        content: textContent,
      };

      if (db) {
        await insert(db, {
          title: entry.title || entry.slug,
          content: textContent,
          href: entry.href,
        });
      }

      tree.children.push(entry);
    } else {
      tree.children.push({
        name: itemName,
        slug: slugName,
        buffer: await fs.readFile(itemPath),
      });
    }
  }

  tree.children.sort((a, b) => {
    const isADir = "children" in a;
    const isBDir = "children" in b;

    if (isADir !== isBDir) return isADir ? 1 : -1;
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  return tree;
};

export default fromFSDirectory;
