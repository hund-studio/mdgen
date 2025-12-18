import "./styles/page.scss";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import { create, insert, save, type Orama } from "@orama/orama";
import { renderToString } from "react-dom/server";
import { saveAs } from "file-saver";
import { tools } from "./styles/modules";
import { useEffect, useRef, useState } from "react";
import Carousel from "./components/carousel/carousel";
import CSSBundle from "./static/assets/static.css?raw";
import Handlebars from "handlebars";
import HTMLTemplate from "./static/static.html?raw";
import JSBundle from "./static/assets/main.js?raw";
import JSZip from "jszip";
import Page from "./templates/page/page";
import PreviewModal from "./components/previewModal/previewModal";
import PreviewProvider from "./context/preview";
import slugify from "slugify";

export type DirectoryTree = {
  name: string;
  slug: string;
  path: string;
  children: PageRenderTree[];
};
export type PageTree = {
  name: string;
  slug: string;
  href: string;
  content: string;
  title: string | null;
};
export type AssetTree = {
  name: string;
  slug: string;
  buffer: ArrayBuffer;
};
export type PageRenderTree = DirectoryTree | PageTree | AssetTree;

export type SearchDB = Orama<{
  title: "string";
  content: "string";
  href: "string";
}>;

const slugOptions = { lower: true };

function App() {
  // FS
  const observerRef = useRef<any>(null);
  const [root, setRoot] = useState<FileSystemDirectoryHandle>();

  // Build
  const [generated, setGenerated] = useState<Blob>();
  const [tree, setTree] = useState<Awaited<ReturnType<typeof generateDirectoryTree>>>();
  const [config, setConfig] = useState<Awaited<ReturnType<typeof generateCustomConfig>>>();
  const [db, setDb] = useState<SearchDB>();

  // UI
  const [preview, setPreview] = useState(false);
  const [instructions, setInstructions] = useState(false);

  const generateDirectoryTree = async (
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

    const tree: PageRenderTree = {
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
            const textContent = await file.text();
            let href = slugName.replace(/\.[^/.]+$/, ".html");
            if (parentHref) href = [parentHref, href].join("/");
            let title: string | null = null;
            const [firstLine] = textContent.split("\n");
            if (firstLine?.startsWith("#")) {
              title = firstLine.replace(/^#\s*/, "").trim();
            }

            const entry = {
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

            tree.children.push(entry);

            if (db) {
              insert(db, {
                title: entry.title || entry.slug,
                content: textContent,
                href: entry.href,
              });
            }
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
          if (slugName.startsWith(".")) continue;

          const directoryPath = (() => {
            if (!!parentHref.length) {
              return [parentHref, slugName].join("/");
            }

            return slugName;
          })();
          tree.children.push(
            await generateDirectoryTree(handle, { parentHref: directoryPath, db })
          );
          break;
      }
    }

    tree.children.sort((a, b) => {
      const isADirectory = "children" in a;
      const isBDirectory = "children" in b;

      if (!isADirectory && isBDirectory) return -1;

      if (isADirectory && !isBDirectory) return 1;

      const nameA = a.name.toLowerCase();
      const nameB = b.name.toLowerCase();

      if (nameA < nameB) return -1;
      if (nameA > nameB) return 1;
      return 0;
    });

    return tree;
  };

  const generateCustomConfig = async (directoryHandle: FileSystemDirectoryHandle) => {
    const config: { brand: null | { file: File; name: string }; style: null | string } = {
      brand: null,
      style: null,
    };

    for await (const handle of directoryHandle.values()) {
      if (handle.kind !== "directory") continue;
      if (handle.name !== ".mdgen") continue;

      const handleValues = handle.values();

      for await (const handle of handleValues) {
        switch (handle.name) {
          case "style.css": {
            if (handle.kind !== "file") break;
            const file = await handle.getFile();
            config.style = await file.text();
            break;
          }
          case "logo.svg":
          case "logo.png":
          case "brand.svg":
          case "brand.png": {
            if (handle.kind !== "file") break;
            config.brand = {
              name: handle.name,
              file: await handle.getFile(),
            };
            break;
          }
        }
      }
    }

    return config;
  };

  const renderDirectoryTree = async (
    generatedTree: Awaited<ReturnType<typeof generateDirectoryTree>>,
    parentDirectory: JSZip
  ) => {
    const assets = parentDirectory.folder("assets");

    assets?.file("main.js", JSBundle);
    assets?.file("static.css", CSSBundle);

    if (config?.brand) assets?.file(config.brand.name, config.brand.file);
    if (config?.style) assets?.file("custom.css", config.style);

    for (const entry of generatedTree.children) {
      if ("children" in entry) {
        const root = parentDirectory.folder(entry.slug);
        if (!root) continue;
        renderDirectoryTree(entry, root);
        continue;
      }
      if ("buffer" in entry) {
        parentDirectory.file(entry.name, entry.buffer);
        continue;
      }
      const template = Handlebars.compile(HTMLTemplate);
      const pageTree = tree || generatedTree;
      parentDirectory.file(
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
  };

  const directoryPicker = async () => {
    const rootHandle = await showDirectoryPicker({ mode: "read" });
    setRoot(rootHandle);
  };

  useEffect(() => {
    if (!root) return;

    const observer = new FileSystemObserver(loadRootDirectory);
    observerRef.current = observer;
    observer.observe(root);
    loadRootDirectory();

    return () => {
      observer.disconnect();
    };
  }, [root]);

  const loadRootDirectory = () => {
    if (!root) return;

    (async () => {
      const config = await generateCustomConfig(root);
      setConfig(config);

      const db = create({
        schema: {
          title: "string",
          content: "string",
          href: "string",
        },
      });

      const tree = await generateDirectoryTree(root, { db });
      setTree(tree);
      setDb(db);
    })();
  };

  const generateDirectoryZIP = async (tree: DirectoryTree) => {
    const zip = new JSZip();
    const root = zip.folder(tree.name);
    if (!root) return;
    renderDirectoryTree(tree, root);
    if (db) root.file("search.json", JSON.stringify(save(db)));
    setGenerated(await zip.generateAsync({ type: "blob" }));
  };

  useEffect(() => {
    if (tree) generateDirectoryZIP(tree);
  }, [tree]);

  const downloadGenerated = () => {
    if (!generated) return;
    saveAs(generated, "generated.zip");
  };

  return (
    <>
      <div id="tool" className={`${tools["wrapper"]} ${tools["buttons"]} ${tools["vertical"]}`}>
        <a
          target="_blank"
          href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker"
        >
          <img src="/availability.svg" alt="availability" className={`${tools["availability"]}`} />
        </a>
        <div className={`${tools["buttons"]} ${tools["vertical"]}`}>
          <button
            className={`${tools["button"]} ${tools["button--thin"]}`}
            onClick={() => setInstructions(true)}
          >
            📖 Instructions
          </button>
          <button className={`${tools["button"]} ${tools["button--3d"]}`} onClick={directoryPicker}>
            📁 {root ? <>Change directory</> : <>Pick a directory</>}
          </button>
          {(() => {
            if (!root) return;

            return (
              <div className={`${tools["buttons"]}`}>
                <button
                  className={`${tools["button"]} ${tools["button--3d"]}`}
                  onClick={() => setPreview(true)}
                >
                  🔍 Open preview
                </button>
                <button
                  className={`${tools["button"]} ${tools["button--3d"]}`}
                  onClick={downloadGenerated}
                >
                  📄 Download HTML
                </button>
              </div>
            );
          })()}
          {(() => {
            if (!!root) return;

            return (
              <div className={`${tools["card"]} ${tools["buttons"]} ${tools["vertical"]}`}>
                <p className={`${tools["small"]} ${tools["nom"]}`}>Download a starter example:</p>
                <div className={`${tools["buttons"]} ${tools["center"]}`}>
                  <a href="/basic.zip" download className={`${tools["a"]}`}>
                    📑 Basic doc
                  </a>
                  <a href="/blog.zip" download className={`${tools["a"]}`}>
                    ✒️ Blog
                  </a>
                  <a href="/dnd-adventure.zip" download className={`${tools["a"]}`}>
                    🐉 DnD Adventure
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
        <div className={`${tools["small"]}`}>
          <a href="https://hund.studio" target="_blank">
            hund.studio
          </a>{" "}
          -{" "}
          <a href="https://github.com/hund-studio/mdgen" target="_blank">
            GitHub
          </a>{" "}
          - 0.0.0-beta
        </div>
      </div>
      {(() => {
        if (!instructions) return;

        return <Carousel onClose={() => setInstructions(false)} />;
      })()}
      {(() => {
        if (!preview) return;
        if (!tree) return;

        return (
          <PreviewProvider tree={tree} db={db}>
            <PreviewModal
              onClose={() => setPreview(false)}
              loadRootDirectory={loadRootDirectory}
              downloadGenerated={downloadGenerated}
            >
              {(() => {
                if (!config?.style) return;
                return <style>{config.style}</style>;
              })()}
            </PreviewModal>
          </PreviewProvider>
        );
      })()}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
