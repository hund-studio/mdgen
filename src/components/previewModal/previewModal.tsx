import { previewContext } from "../../context/preview";
import { use, type FC } from "react";
import Page from "../../templates/page/page";
import styles from "../../tools.module.scss";
import type { PageRenderTree } from "../../App";

const PreviewModal: FC<{
  onClose: VoidFunction;
  loadRootDirectory: VoidFunction;
  downloadGenerated: VoidFunction;
}> = ({ onClose, loadRootDirectory, downloadGenerated }) => {
  const context = use(previewContext);

  if (!context) {
    console.warn("No context");
    return;
  }

  const { tree, current } = context;

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
        if (entry.name !== fragment) return false;
        return true;
      });
    }

    if (!match) return;
    if (!("content" in match)) return;
    return match;
  };

  const element = getCurrentElement(tree.children);

  return (
    <div className={`${styles["modal"]}`}>
      <div className={`${styles["modal-content"]}`}>
        <div className={`${styles["modal-heading"]}`}>
          <div className={`${styles["buttons"]}`}>
            <button
              className={`${styles["button--thin"]} ${styles["button--dark"]} ${styles["button"]}`}
              onClick={loadRootDirectory}
            >
              🔃 Refresh
            </button>
          </div>
          <div className={`${styles["url"]}`}>/{path}</div>
          <div className={`${styles["buttons"]}`}>
            <button
              className={`${styles["button--thin"]} ${styles["button--dark"]} ${styles["button"]}`}
              onClick={downloadGenerated}
            >
              📄 Download HTML
            </button>
            <button
              className={`${styles["button--thin"]} ${styles["button--dark"]} ${styles["button"]}`}
              onClick={onClose}
            >
              Close
            </button>
          </div>
        </div>
        <div className={`${styles["modal-preview"]}`}>
          <Page path={path} sidebar={tree} content={element?.content || "Not found"} />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
