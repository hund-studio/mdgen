import { previewContext } from "../../context/preview";
import { tools } from "../../styles/modules";
import { use, type FC, type PropsWithChildren } from "react";
import Page from "../../templates/page/page";
import type { PageRenderTree } from "../../App";

const PreviewModal: FC<
  PropsWithChildren<{
    onClose: VoidFunction;
    loadRootDirectory: VoidFunction;
    downloadGenerated: VoidFunction;
  }>
> = ({ children, onClose, loadRootDirectory, downloadGenerated }) => {
  const context = use(previewContext);

  if (!context) {
    console.warn("No context");
    return;
  }

  const { tree, current, db } = context;

  let path = current;
  path = path.replace(/^[/]+|[/]+$/g, "");
  path = path.replace(/^\.\//, "");
  path = path.replace(/(^|\/)\.\.\//g, "$1");
  if (!path.length) path = "index.html";

  const getCurrentElement = (list: (typeof tree)["children"]) => {
    const fragments = path.split("/");

    let match: PageRenderTree | undefined;

    for (const fragment of fragments) {
      let pool = list;

      if (match) {
        if ("children" in match) {
          pool = match.children;
        }
      }

      match = pool.find((entry) => {
        if (entry.slug !== fragment) return false;
        return true;
      });
    }

    if (!match) return;
    if (!("content" in match)) return;
    return match;
  };

  const element = getCurrentElement(tree.children);

  return (
    <div className={`${tools["modal"]}`}>
      <div className={`${tools["modal-content"]}`}>
        <div className={`${tools["modal-heading"]}`}>
          <div className={`${tools["buttons"]}`}>
            <button
              className={`${tools["button--thin"]} ${tools["button--dark"]} ${tools["button"]}`}
              onClick={loadRootDirectory}
            >
              🔃 Refresh
            </button>
          </div>
          <div className={`${tools["url"]}`}>/{path}</div>
          <div className={`${tools["buttons"]}`}>
            <button
              className={`${tools["button--thin"]} ${tools["button--dark"]} ${tools["button"]}`}
              onClick={downloadGenerated}
            >
              📄 Download HTML
            </button>
            <button
              className={`${tools["button--thin"]} ${tools["button--dark"]} ${tools["button"]}`}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
        <div className={`${tools["modal-preview"]}`}>
          {children}
          <Page path={path} db={db} sidebar={tree} content={element?.content || "Not found"} />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
