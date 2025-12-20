import "./styles/page.scss";
import { create, save } from "@orama/orama";
import { createRoot } from "react-dom/client";
import { saveAs } from "file-saver";
import { StrictMode } from "react";
import { tools } from "./styles/modules";
import { useEffect, useRef, useState } from "react";
import Carousel from "./components/carousel/carousel";
import JSZip from "jszip";
import PreviewModal from "./components/previewModal/previewModal";
import PreviewProvider from "./context/preview";
import utils from "./utils";

function App() {
  // FS
  const observerRef = useRef<any>(null);
  const [root, setRoot] = useState<FileSystemDirectoryHandle>();

  // Build
  const [generated, setGenerated] = useState<Blob>();
  const [tree, setTree] =
    useState<Awaited<ReturnType<typeof utils.directoryEntry.fromDirectoryHandle>>>();
  const [config, setConfig] =
    useState<Awaited<ReturnType<typeof utils.customConfig.fromDirectoryHandle>>>();
  const [db, setDb] = useState<SearchDB>();

  // UI
  const [preview, setPreview] = useState(false);
  const [instructions, setInstructions] = useState(false);

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
      const config = await utils.customConfig.fromDirectoryHandle(root);
      setConfig(config);

      const db = create({
        schema: {
          title: "string",
          content: "string",
          href: "string",
        },
      });

      const tree = await utils.directoryEntry.fromDirectoryHandle(root, { db });
      setTree(tree);
      setDb(db);
    })();
  };

  const generateDirectoryZIP = async (tree: BrowserDirectoryEntry) => {
    const zip = new JSZip();
    const root = await utils.directoryEntry.toZIP(tree, { parentDirectory: zip, config });
    if (!root) return;
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
            📖 Quick Start
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
