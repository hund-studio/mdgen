import { renderToString } from "react-dom/server";
import { saveAs } from "file-saver";
import { useEffect, useState } from "react";
import JSZip from "jszip";
import Page from "./templates/page/page";
import PreviewModal from "./components/previewModal/previewModal";
import PreviewProvider from "./context/preview";
import styles from "./tools.module.scss";
import Handlebars from "handlebars";
import HTMLTemplate from "./static/static.html?raw";
import JSBundle from "./static/assets/main.js?raw";
import CSSBundle from "./static/assets/static.css?raw";

export type DirectoryTree = { name: string; children: PageRenderTree[] };
export type PageTree = { name: string; href: string; content: string };
export type AssetTree = { name: string; buffer: ArrayBuffer };
export type PageRenderTree = DirectoryTree | PageTree | AssetTree;

function App() {
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
            tree.children.push({
              name: handle.name.replace(/\.[^/.]+$/, ".html"),
              href,
              content: textContent,
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
          tree.children.push(await generateDirectoryTree(handle, handle.name));
          break;
      }
    }

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
      parentDirectory.file(
        entry.name,
        template({
          body: renderToString(<Page sidebar={tree || generatedTree} content={entry.content} />),
          data: JSON.stringify(tree || generatedTree),
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
    loadRootDirectory();
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
        <img src="/availability.svg" alt="availability" className={`${styles["availability"]}`} />
        <div className={`${styles["buttons"]} ${styles["vertical"]}`}>
          <button onClick={directoryPicker}>
            {root ? <>Change directory</> : <>Pick a directory</>}
          </button>
          {(() => {
            if (!root) return;

            return (
              <div className={`${styles["buttons"]}`}>
                <button onClick={() => setPreview(true)}>Open preview</button>
                <button onClick={downloadGenerated}>⤓ Download HTML</button>
              </div>
            );
          })()}
        </div>
        <div>hund.studio</div>
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
