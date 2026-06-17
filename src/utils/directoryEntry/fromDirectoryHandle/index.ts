import { insert } from "@orama/orama";
import slugify from "slugify";
import sortChildren from "../sortChildren";
import { extractTitle, parseFrontmatter } from "../../markdown";

const slugOptions = { lower: true };

const isIndexFile = (name: string) => {
  const lower = name.toLowerCase();
  return lower === "index.md" || lower === "readme.md";
};

const fromDirectoryHandle = async (
  directoryHandle: FileSystemDirectoryHandle,
  { parentHref = "", db }: { parentHref?: string; db?: SearchDB } = {}
) => {
  const hasIndex = await (async () => {
    for await (const handle of directoryHandle.values()) {
      if (handle.kind === "directory") continue;
      if (handle.name === "index.md") return true;
    }
    return false;
  })();

  const tree: BrowserDirectoryEntry = {
    name: directoryHandle.name,
    slug: slugify(directoryHandle.name, slugOptions),
    path: parentHref,
    children: [],
  };

  for await (const handle of directoryHandle.values()) {
    const slugName = slugify(handle.name, slugOptions);
    switch (handle.kind) {
      case "file":
        const file = await handle.getFile();
        if (slugName.endsWith(".md")) {
          const raw = await file.text();
          const { data, body } = parseFrontmatter(raw);

          let href = slugName.replace(/\.[^/.]+$/, ".html");
          if (parentHref) href = [parentHref, href].join("/");

          const entry: PageEntry = {
            content: body,
            href,
            name: slugName.replace(/\.[^/.]+$/, ".html"),
            slug: slugName.replace(/\.[^/.]+$/, ".html"),
            title: data.title ?? extractTitle(body),
            label: data.label,
            order: data.order,
            hidden: data.hidden,
          };

          if (!hasIndex) {
            if (entry.name === "readme.html") {
              entry.name = "index.html";
              entry.slug = "index.html";
              entry.href = entry.href.replace("readme.html", "index.html");
            }
          }

          if (isIndexFile(handle.name)) {
            if (data.label !== undefined) tree.label = data.label;
            if (data.order !== undefined) tree.order = data.order;
            if (data.hidden !== undefined) tree.hidden = data.hidden;
          }

          if (db) {
            insert(db, {
              title: entry.title || entry.slug,
              content: body,
              href: entry.href,
            });
          }

          tree.children.push(entry);
        } else {
          const bufferContent = await file.arrayBuffer();
          tree.children.push({
            name: slugName,
            slug: slugName,
            buffer: bufferContent,
          });
        }
        break;
      case "directory":
        if (handle.name.startsWith(".")) continue;

        const directoryPath = parentHref.length ? [parentHref, slugName].join("/") : slugName;

        tree.children.push(await fromDirectoryHandle(handle, { parentHref: directoryPath, db }));
        break;
    }
  }

  sortChildren(tree.children);

  return tree;
};

export default fromDirectoryHandle;
