import { insert } from "@orama/orama";
import slugify from "slugify";
import fs from "fs/promises";
import path from "path";

const slugOptions = { lower: true };

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
  const hasIndex = items.some((name) => name.toLowerCase() === "index.md");

  const joinPaths = (...parts: string[]) => parts.join("/").replace(/\/+/g, "/");

  const currentPath = parentHref || publicUrl;

  const tree: FSTree = {
    name: dirName,
    slug: slugify(dirName, slugOptions),
    path: currentPath,
    children: [],
  };

  for (const itemName of items) {
    const itemPath = path.join(absolutePath, itemName);
    const stats = await fs.stat(itemPath);
    const slugName = slugify(itemName, slugOptions);

    if (stats.isFile()) {
      if (itemName.toLowerCase().endsWith(".md")) {
        // @todo repeated
        const textContent = await fs.readFile(itemPath, "utf-8");

        let fileName = slugName.replace(/\.md$/, ".html");
        let href = joinPaths(currentPath, fileName);

        let title: string | null = null;
        const [firstLine] = textContent.split("\n");
        if (firstLine?.startsWith("#")) {
          title = firstLine.replace(/^#\s*/, "").trim();
        }

        const entry: PageEntry = {
          content: textContent,
          href,
          name: fileName,
          slug: fileName,
          title,
        };

        if (!hasIndex) {
          if (entry.name === "readme.html") {
            entry.name = "index.html";
            entry.slug = "index.html";
            entry.href = entry.href.replace("readme.html", "index.html");
          }
        }

        if (db) {
          await insert(db, {
            title: entry.title || entry.slug,
            content: textContent,
            href: entry.href,
          });
        }
        //

        tree.children.push(entry);
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

      // @todo repeated
      const nextDirectoryPath = joinPaths(currentPath, slugName);
      //

      tree.children.push(
        await fromFSDirectory(itemPath, { parentHref: nextDirectoryPath, db, publicUrl })
      );
    }
  }

  // @todo repeated
  tree.children.sort((a, b) => {
    const isADirectory = "children" in a;
    const isBDirectory = "children" in b;
    if (!isADirectory && isBDirectory) return -1;
    if (isADirectory && !isBDirectory) return 1;
    return a.name.toLowerCase().localeCompare(b.name.toLowerCase());
  });
  //

  return tree;
};

export default fromFSDirectory;
