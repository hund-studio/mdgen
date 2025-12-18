import { insert } from "@orama/orama";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";

const slugOptions = { lower: true };

const fromFSDirectory = async (
  absolutePath: string,
  { parentHref = "", db }: { parentHref?: string; db?: any } = {}
) => {
  const dirName = path.basename(absolutePath);
  const items = await fs.readdir(absolutePath);

  const hasIndex = items.some((name) => name.toLowerCase() === "index.md");

  const tree: any = {
    name: dirName,
    slug: slugify(dirName, slugOptions),
    path: parentHref,
    children: [],
  };

  for (const itemName of items) {
    const itemPath = path.join(absolutePath, itemName);
    const stats = await fs.stat(itemPath);
    const slugName = slugify(itemName, slugOptions);

    if (stats.isFile()) {
      if (itemName.toLowerCase().endsWith(".md")) {
        const textContent = await fs.readFile(itemPath, "utf-8");

        let href = slugName.replace(/\.md$/, ".html");
        if (parentHref) href = `${parentHref}/${href}`;

        let title: string | null = null;
        const [firstLine] = textContent.split("\n");
        if (firstLine?.startsWith("#")) {
          title = firstLine.replace(/^#\s*/, "").trim();
        }

        const entry: any = {
          content: textContent,
          href,
          name: slugName.replace(/\.md$/, ".html"),
          slug: slugName.replace(/\.md$/, ".html"),
          title,
        };

        if (!hasIndex && entry.name === "readme.html") {
          entry.name = "index.html";
          entry.slug = "index.html";
          entry.href = entry.href.replace("readme.html", "index.html");
        }

        tree.children.push(entry);

        if (db) {
          await insert(db, {
            title: entry.title || entry.slug,
            content: textContent,
            href: entry.href,
          });
        }
      } else {
        const bufferContent = await fs.readFile(itemPath);
        tree.children.push({
          name: itemName,
          slug: slugName,
          buffer: bufferContent,
        });
      }
    } else if (stats.isDirectory()) {
      if (itemName.startsWith(".")) continue;

      const directoryPath = parentHref ? `${parentHref}/${slugName}` : slugName;

      tree.children.push(await fromFSDirectory(itemPath, { parentHref: directoryPath, db }));
    }
  }

  tree.children.sort((a: any, b: any) => {
    const isADirectory = "children" in a;
    const isBDirectory = "children" in b;
    if (!isADirectory && isBDirectory) return -1;
    if (isADirectory && !isBDirectory) return 1;
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });

  return tree;
};

export default fromFSDirectory;
