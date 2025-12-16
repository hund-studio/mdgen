import { renderToString } from "react-dom/server";
import { saveAs } from "file-saver";
import { useEffect, useRef, useState } from "react";
import CSSBundle from "./static/assets/static.css?raw";
import Handlebars from "handlebars";
import HTMLTemplate from "./static/static.html?raw";
import JSBundle from "./static/assets/main.js?raw";
import JSZip from "jszip";
import Page from "./templates/page/page";
import PreviewModal from "./components/previewModal/previewModal";
import PreviewProvider from "./context/preview";
import styles from "./tools.module.scss";

export type DirectoryTree = { name: string; path: string; children: PageRenderTree[] };
export type PageTree = { name: string; href: string; content: string; title: string | null };
export type AssetTree = { name: string; buffer: ArrayBuffer };
export type PageRenderTree = DirectoryTree | PageTree | AssetTree;

function App() {
  const observerRef = useRef<any>(null);
  const [root, setRoot] = useState<FileSystemDirectoryHandle>();
  const [generated, setGenerated] = useState<Blob>();
  const [preview, setPreview] = useState(false);
  const [tree, setTree] = useState<Awaited<ReturnType<typeof generateDirectoryTree>>>();

  const generateDirectoryTree = async (
    directoryHandle: FileSystemDirectoryHandle,
    parentHref: string = ""
  ) => {
    const tree: PageRenderTree = {
      name: directoryHandle.name,
      path: parentHref,
      children: [],
    };

    for await (const handle of directoryHandle.values()) {
      switch (handle.kind) {
        case "file":
          const file = await handle.getFile();
          if (handle.name.endsWith(".md")) {
            const textContent = await file.text();
            let href = handle.name.replace(/\.[^/.]+$/, ".html");
            if (parentHref) href = [parentHref, href].join("/");
            let title: string | null = null;
            const [firstLine] = textContent.split("\n");
            if (firstLine?.startsWith("#")) {
              title = firstLine.replace(/^#\s*/, "").trim();
            }
            tree.children.push({
              content: textContent,
              href,
              name: handle.name.replace(/\.[^/.]+$/, ".html"),
              title,
            });
          } else {
            const bufferContent = await file.arrayBuffer();
            tree.children.push({
              name: handle.name,
              buffer: bufferContent,
            });
          }
          break;
        case "directory":
          const directoryPath = (() => {
            if (!!parentHref.length) {
              return [parentHref, handle.name].join("/");
            }

            return handle.name;
          })();
          tree.children.push(await generateDirectoryTree(handle, directoryPath));
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

  const renderDirectoryTree = async (
    generatedTree: Awaited<ReturnType<typeof generateDirectoryTree>>,
    parentDirectory: JSZip
  ) => {
    const assets = parentDirectory.folder("assets");
    assets?.file("main.js", JSBundle);
    assets?.file("static.css", CSSBundle);

    for (const entry of generatedTree.children) {
      if ("children" in entry) {
        const root = parentDirectory.folder(entry.name);
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
          data: JSON.stringify(pageTree),
          content: entry.content,
        })
      );
      // tree[handle.name] = await generateDirectory(handle);
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
    generateDirectoryTree(root).then(async (generatedTree) => {
      setTree(generatedTree);
    });
  };

  const generateDirectoryZIP = async (tree: DirectoryTree) => {
    const zip = new JSZip();
    const root = zip.folder(tree.name);
    if (!root) return;
    renderDirectoryTree(tree, root);
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
      <div id="tool" className={`${styles["wrapper"]} ${styles["buttons"]} ${styles["vertical"]}`}>
        <a
          target="_blank"
          href="https://developer.mozilla.org/en-US/docs/Web/API/Window/showDirectoryPicker"
        >
          <img src="/availability.svg" alt="availability" className={`${styles["availability"]}`} />
        </a>
        <div className={`${styles["buttons"]} ${styles["vertical"]}`}>
          <button
            className={`${styles["button"]} ${styles["button--3d"]}`}
            onClick={directoryPicker}
          >
            📁 {root ? <>Change directory</> : <>Pick a directory</>}
          </button>
          {(() => {
            if (!root) return;

            return (
              <div className={`${styles["buttons"]}`}>
                <button
                  className={`${styles["button"]} ${styles["button--3d"]}`}
                  onClick={() => setPreview(true)}
                >
                  🔍 Open preview
                </button>
                <button
                  className={`${styles["button"]} ${styles["button--3d"]}`}
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
              <div className={`${styles["card"]} ${styles["buttons"]} ${styles["vertical"]}`}>
                <p className={`${styles["small"]} ${styles["nom"]}`}>Download a starter example:</p>
                <div className={`${styles["buttons"]} ${styles["center"]}`}>
                  <a href="/basic.zip" download className={`${styles["a"]}`}>
                    Basic doc
                  </a>
                  <a href="/blog.zip" download className={`${styles["a"]}`}>
                    Blog
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
        <div className={`${styles["small"]}`}>
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
        if (!preview) return;
        if (!tree) return;

        return (
          <PreviewProvider tree={tree}>
            <PreviewModal
              onClose={() => setPreview(false)}
              loadRootDirectory={loadRootDirectory}
              downloadGenerated={downloadGenerated}
            />
          </PreviewProvider>
        );
      })()}
    </>
  );
}

export default App;
