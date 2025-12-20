import { insert } from "@orama/orama";
import slugify from "slugify";

const slugOptions = { lower: true };

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

  const tree: BrowserTree = {
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
          // @todo repeated
          const textContent = await file.text();

          let href = slugName.replace(/\.[^/.]+$/, ".html");
          if (parentHref) href = [parentHref, href].join("/");

          let title: string | null = null;
          const [firstLine] = textContent.split("\n");
          if (firstLine?.startsWith("#")) {
            title = firstLine.replace(/^#\s*/, "").trim();
          }

          const entry: PageEntry = {
            content: textContent,
            href,
            name: slugName.replace(/\.[^/.]+$/, ".html"),
            slug: slugName.replace(/\.[^/.]+$/, ".html"),
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
            insert(db, {
              title: entry.title || entry.slug,
              content: textContent,
              href: entry.href,
            });
          }
          //

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

        // @todo repeated
        const directoryPath = (() => {
          if (!!parentHref.length) {
            return [parentHref, slugName].join("/");
          }

          return slugName;
        })();
        //

        tree.children.push(await fromDirectoryHandle(handle, { parentHref: directoryPath, db }));
        break;
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

export default fromDirectoryHandle;
