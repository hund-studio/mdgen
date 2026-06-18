import "./styles/page.scss";
import { createRoot } from "react-dom/client";
import { saveAs } from "file-saver";
import { lazy, StrictMode, Suspense } from "react";
import { tools } from "./styles/modules";
import { useEffect, useRef, useState } from "react";
import PreviewProvider from "./context/preview";

// Heavy, interaction-only chunks: keep them out of the landing bundle.
// Carousel + PreviewModal pull in react-markdown, remark-gfm, motion and the
// search highlighter; the directory pipeline (orama, jszip, utils) is imported
// on demand inside the handlers.
const Carousel = lazy(() => import("./components/carousel/carousel"));
const PreviewModal = lazy(() => import("./components/previewModal/previewModal"));

function App() {
  // FS
  const observerRef = useRef<any>(null);
  const [root, setRoot] = useState<FileSystemDirectoryHandle>();

  // Build
  const [generated, setGenerated] = useState<Blob>();
  const [tree, setTree] = useState<BrowserDirectoryEntry>();
  const [config, setConfig] = useState<BrowserConfig>();
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
      const { default: utils } = await import("./utils");

      const config = await utils.customConfig.fromDirectoryHandle(root);
      setConfig(config);

      const db = utils.db.create();

      const tree = await utils.directoryEntry.fromDirectoryHandle(root, { db });
      setTree(tree);
      setDb(db);
    })();
  };

  const generateDirectoryZIP = async (tree: BrowserDirectoryEntry) => {
    const [{ default: JSZip }, { save }, { default: utils }] = await Promise.all([
      import("jszip"),
      import("@orama/orama"),
      import("./utils"),
    ]);

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
          <div className={`${tools["availability"]}`} role="img" aria-label="availability" />
        </a>
        <div className={`${tools["buttons"]} ${tools["vertical"]}`}>
          <button
            className={`${tools["button"]} ${tools["button--thin"]}`}
            onClick={() => setInstructions(true)}
          >
            Quick Start
          </button>
          <button className={`${tools["button"]} ${tools["button--3d"]}`} onClick={directoryPicker}>
            {root ? <>Change directory</> : <>Pick a directory</>}
          </button>
          {(() => {
            if (!root) return;

            return (
              <div className={`${tools["buttons"]}`}>
                <button
                  className={`${tools["button"]} ${tools["button--3d"]}`}
                  onClick={() => setPreview(true)}
                >
                  Open preview
                </button>
                <button
                  className={`${tools["button"]} ${tools["button--3d"]}`}
                  onClick={downloadGenerated}
                >
                  Download HTML
                </button>
              </div>
            );
          })()}
          {(() => {
            if (!!root) return;

            return (
              <div className={`${tools["starter"]}`}>
                <p className={`${tools["small"]} ${tools["nom"]}`}>Download a starter example:</p>
                <div className={`${tools["examples"]}`}>
                  <a href="/docs.zip" download className={`${tools["a"]}`}>
                    Basic doc
                  </a>
                </div>
              </div>
            );
          })()}
        </div>
        <div className={`${tools["small"]}`}>
          <a href="https://hund.studio" target="_blank" className={`${tools["a"]}`}>
            hund.studio
          </a>{" "}
          -{" "}
          <a
            href="https://github.com/hund-studio/mdgen"
            target="_blank"
            className={`${tools["a"]}`}
          >
            GitHub
          </a>{" "}
          - 0.0.0-beta
        </div>
      </div>
      {instructions ? (
        <Suspense fallback={null}>
          <Carousel onClose={() => setInstructions(false)} />
        </Suspense>
      ) : null}
      {preview && tree ? (
        <Suspense fallback={null}>
          <PreviewProvider tree={tree} db={db} config={config}>
            <PreviewModal
              onClose={() => setPreview(false)}
              loadRootDirectory={loadRootDirectory}
              downloadGenerated={downloadGenerated}
            >
              {config?.style ? <style>{config.style}</style> : null}
            </PreviewModal>
          </PreviewProvider>
        </Suspense>
      ) : null}
    </>
  );
}

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>,
);
