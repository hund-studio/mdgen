import { previewContext } from "../../context/preview";
import { tools } from "../../styles/modules";
import { use, type FC, type PropsWithChildren } from "react";
import Page from "../page/page";

/** Collects every page href inside a directory subtree (for translation lookup). */
const collectHrefs = (node: BrowserDirectoryEntry, set = new Set<string>()) => {
  for (const child of node.children) {
    if ("children" in child) collectHrefs(child, set);
    else if ("href" in child) set.add(child.href);
  }
  return set;
};

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

  const { tree, current, db, config } = context;

  let path = current;
  path = path.replace(/^[/]+|[/]+$/g, "");
  path = path.replace(/^\.\//, "");
  path = path.replace(/(^|\/)\.\.\//g, "$1");
  if (!path.length) path = "index.html";

  // ── i18n (mirrors the CLI's per-locale build) ──────────────────────────────
  // Locale folders sit at the tree root; their slug is the lowercased locale.
  // The web tool builds a single combined tree, so we resolve the active locale
  // from the path's first segment and render only that locale's subtree.
  const localeNodes = new Map<string, BrowserDirectoryEntry>();
  for (const child of tree.children) {
    if ("children" in child) localeNodes.set(child.slug, child);
  }

  const locales = (config?.locales ?? []).filter((locale) =>
    localeNodes.has(locale.toLowerCase())
  );
  const i18n = locales.length > 0;
  const defaultLocale =
    (config?.defaultLocale && locales.includes(config.defaultLocale)
      ? config.defaultLocale
      : null) ??
    locales[0] ??
    null;

  let currentLocale = locales.find((locale) => locale.toLowerCase() === path.split("/")[0]) ?? null;

  // No locale in the path (e.g. the initial "/"): land on the default locale's index.
  if (i18n && !currentLocale && defaultLocale) {
    const index = localeNodes.get(defaultLocale.toLowerCase())?.indexHref;
    if (index) {
      currentLocale = defaultLocale;
      path = index.replace(/^\/+/, "");
    }
  }

  // Sidebar shows only the active locale's subtree; content lookup still walks
  // the full tree (the path keeps the locale segment).
  const localeNode = currentLocale ? localeNodes.get(currentLocale.toLowerCase()) : undefined;
  const sidebarTree = i18n && localeNode ? localeNode : tree;

  // Per-page translations: the same path under each locale, when that page exists.
  let translations: Record<string, string | null> | undefined;
  if (i18n && currentLocale) {
    const rest = path.split("/").slice(1).join("/");
    translations = {};
    for (const locale of locales) {
      const node = localeNodes.get(locale.toLowerCase());
      const candidate = `/${locale.toLowerCase()}/${rest}`;
      translations[locale] =
        locale === currentLocale || (node && collectHrefs(node).has(candidate)) ? candidate : null;
    }
  }

  const getCurrentElement = (list: (typeof tree)["children"]) => {
    const fragments = path.split("/");

    let match: BrowserTree | undefined;

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
              Refresh
            </button>
          </div>
          <div className={`${tools["url"]}`}>/{path}</div>
          <div className={`${tools["buttons"]}`}>
            <button
              className={`${tools["button--thin"]} ${tools["button--dark"]} ${tools["button"]}`}
              onClick={downloadGenerated}
            >
              Download HTML
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
          <Page
            path={path}
            db={db}
            sidebar={sidebarTree}
            content={element?.content || "Not found"}
            locale={i18n ? currentLocale : undefined}
            locales={i18n ? locales : undefined}
            translations={translations}
          />
        </div>
      </div>
    </div>
  );
};

export default PreviewModal;
