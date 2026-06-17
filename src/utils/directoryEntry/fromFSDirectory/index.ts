import { insert } from "@orama/orama";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";
import sortChildren from "../sortChildren";
import { extractTitle, parseFrontmatter } from "../../markdown";

const SLUG_OPTS = { lower: true };

const joinPaths = (...parts: string[]) => parts.join("/").replace(/\/+/g, "/");

const isIndexFile = (name: string) => {
  const lower = name.toLowerCase();
  return lower === "index.md" || lower === "readme.md";
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

  const tree: FSDirectoryEntry = {
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
      const raw = await fs.readFile(itemPath, "utf-8");
      const { data, body } = parseFrontmatter(raw);
      let fileName = slugName.replace(/\.md$/, ".html");

      if (!hasIndex && fileName === "readme.html") {
        fileName = "index.html";
      }

      const entry: PageEntry = {
        name: fileName,
        slug: fileName,
        href: joinPaths(currentPath, fileName),
        title: data.title ?? extractTitle(body),
        content: body,
        label: data.label,
        order: data.order,
        hidden: data.hidden,
      };

      // The folder's own index/readme drives the folder node's sidebar label
      // and ordering among its siblings.
      if (isIndexFile(itemName)) {
        if (data.label !== undefined) tree.label = data.label;
        if (data.order !== undefined) tree.order = data.order;
        if (data.hidden !== undefined) tree.hidden = data.hidden;
      }

      if (db) {
        await insert(db, {
          title: entry.title || entry.slug,
          content: body,
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

  sortChildren(tree.children);

  return tree;
};

export default fromFSDirectory;
