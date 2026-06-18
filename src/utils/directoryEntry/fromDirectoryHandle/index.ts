import { insert } from "@orama/orama";
import slugify from "slugify";
import sortChildren from "../sortChildren";
import { extractTitle, parseFrontmatter } from "../../markdown";

const slugOptions = { lower: true };

const joinPaths = (...parts: string[]) => parts.join("/").replace(/\/+/g, "/");

const fromDirectoryHandle = async (
  directoryHandle: FileSystemDirectoryHandle,
  { parentHref = "", db }: { parentHref?: string; db?: SearchDB } = {}
) => {
  // Hrefs are root-absolute (start at "/") so `Link` resolves them as-is. With a
  // relative href, `resolveHref` would re-join it with the current page's
  // directory and the locale prefix would compound on each click
  // (`/en-us/en-us/…`). Mirrors `fromFSDirectory` with `publicUrl: "/"`.
  const currentPath = parentHref || "/";
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
    path: currentPath,
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

          const href = joinPaths(currentPath, slugName.replace(/\.[^/.]+$/, ".html"));

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

          if (entry.name === "index.html") {
            tree.indexHref = entry.href;
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

        const directoryPath = joinPaths(currentPath, slugName);

        tree.children.push(await fromDirectoryHandle(handle, { parentHref: directoryPath, db }));
        break;
    }
  }

  sortChildren(tree.children);

  return tree;
};

export default fromDirectoryHandle;
