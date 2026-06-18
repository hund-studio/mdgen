import { motion } from "motion/react";
import { use, useEffect, useRef, useState, type FC } from "react";
import { useLocalStorage } from "usehooks-ts";
import { previewContext } from "../../context/preview";
import Link from "../link/link";
import Search from "../search/search";

/** Strips leading/trailing slashes and decodes, so paths and hrefs compare cleanly. */
const normalize = (value: string) => decodeURIComponent(value.replace(/^\/+|\/+$/g, ""));

/**
 * Fallback label for a folder without a frontmatter override: turn the folder
 * name into Title Case (`getting-started` → "Getting Started").
 */
const prettify = (name: string) =>
  name
    .replace(/[-_]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());

const folderLabel = (tree: BrowserDirectoryEntry | FSDirectoryEntry) =>
  tree.label || prettify(tree.name);

const PageEntry: FC<{ tree: PageEntry; path: string }> = ({ tree, path }) => {
  const activeClass = tree.href && normalize(path) === normalize(tree.href) ? "active" : "";

  return (
    <li>
      <Link className={activeClass} href={tree.href}>
        {tree.label || tree.title || tree.name}
      </Link>
    </li>
  );
};

const AssetEntry: FC<{ tree: BrowserAssetEntry | FSAssetEntry; path: string }> = ({ tree }) => {
  return (
    <li>
      <span>{tree.name}</span>
    </li>
  );
};

const DirectoryEntry: FC<{ tree: BrowserDirectoryEntry | FSDirectoryEntry; path: string }> = ({
  tree,
  path,
}) => {
  const current = normalize(path);
  const treePath = normalize(tree.path);
  const containsActive = current === treePath || current.startsWith(`${treePath}/`);
  const isIndexActive = !!tree.indexHref && current === normalize(tree.indexHref);

  const [open, setOpen] = useState(containsActive);

  const toggle = () => setOpen((prev) => !prev);

  // The caret is its own control: it toggles the accordion without ever
  // triggering navigation (mirrors the Next.js docs sidebar).
  const caret = (
    <motion.button
      type="button"
      aria-label="Apri/chiudi sezione"
      className="dropdown-label-caret"
      initial={false}
      animate={{ rotate: open ? 0 : 180 }}
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggle();
      }}
    />
  );

  return (
    <li className="dropdown">
      <div className="dropdown-label">
        {tree.indexHref ? (
          // With an index/readme: the label navigates to it and opens the section.
          <Link
            className={`dropdown-label-text${isIndexActive ? " active" : ""}`}
            href={tree.indexHref}
            onClick={() => setOpen(true)}
          >
            {folderLabel(tree)}
          </Link>
        ) : (
          // Plain accordion: the whole label just toggles.
          <span className="dropdown-label-text" onClick={toggle}>
            {folderLabel(tree)}
          </span>
        )}
        {caret}
      </div>
      <motion.div
        className="dropdown-content"
        initial={false}
        animate={{ height: open ? "auto" : 0 }}
      >
        <ul>
          <Entries path={path} tree={tree} skipHref={tree.indexHref} />
        </ul>
      </motion.div>
    </li>
  );
};

const Entries: FC<{
  tree: BrowserDirectoryEntry | FSDirectoryEntry;
  path: string;
  /** Href of the folder's own index page, rendered as the folder link instead of a child. */
  skipHref?: string;
}> = ({ tree, path, skipHref }) => {
  return tree.children.map((entry, index) => {
    if ("hidden" in entry && entry.hidden) return null;
    if ("children" in entry) return <DirectoryEntry path={path} tree={entry} key={index} />;
    if (!("href" in entry)) return <AssetEntry path={path} tree={entry} key={index} />;
    if (skipHref && entry.href === skipHref) return null;
    return <PageEntry path={path} tree={entry} key={index} />;
  });
};

/** Full language name in its own language (e.g. `it-IT` → "Italiano (Italia)"). */
const displayName = (code: string) => {
  try {
    const name = new Intl.DisplayNames([code], { type: "language" }).of(code);
    if (name) return name.charAt(0).toUpperCase() + name.slice(1);
  } catch {
    /* Intl.DisplayNames unsupported or invalid tag → fall back to the code. */
  }
  return code;
};

const LanguageSwitcher: FC<{
  locale?: string | null;
  locales?: string[];
  translations?: Record<string, string | null>;
}> = ({ locale, locales, translations }) => {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const preview = use(previewContext);

  // Translations are known at build time, so the switcher is server-rendered;
  // the click-outside listener only matters on the client when the menu is open.
  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (!locale || !locales || locales.length < 2) return null;

  return (
    <div className="page-aside-language" ref={ref}>
      {open && (
        <ul className="page-aside-language-menu">
          {locales.map((code) => {
            const href = translations?.[code] ?? null;
            const isCurrent = code === locale;
            const disabled = !href && !isCurrent;

            return (
              <li key={code}>
                {/* Hard navigation: reloads the per-locale manifest/search + runtime. */}
                <a
                  href={href ?? undefined}
                  aria-current={isCurrent || undefined}
                  className={[isCurrent ? "active" : "", disabled ? "disabled" : ""]
                    .filter(Boolean)
                    .join(" ")}
                  onClick={(event) => {
                    if (disabled || isCurrent) {
                      event.preventDefault();
                      return;
                    }
                    // In the in-tool preview there is no real navigation: switch
                    // the previewed page instead of following the href.
                    if (preview && href) {
                      event.preventDefault();
                      preview.setCurrent(href);
                    }
                  }}
                >
                  {displayName(code)}
                </a>
              </li>
            );
          })}
        </ul>
      )}
      <button
        type="button"
        className="page-aside-language-trigger"
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
      >
        <span>{locale}</span>
        <motion.div className="page-aside-language-caret" animate={{ rotate: open ? 0 : 180 }} />
      </button>
    </div>
  );
};

const Sidebar: FC<{
  db?: SearchDB;
  tree: BrowserDirectoryEntry | FSDirectoryEntry;
  path: string;
  search?: boolean;
  locale?: string | null;
  locales?: string[];
  translations?: Record<string, string | null>;
}> = ({ db, tree, path, search = true, locale, locales, translations }) => {
  const [schema, setSchema] = useLocalStorage("schema", "auto");

  if (!tree.children.length) return;

  useEffect(() => {
    document.documentElement.setAttribute("data-schema", schema);
  }, [schema]);

  return (
    <aside className="page-aside">
      <div className="page-aside-inner">
        {search ? <Search db={db} /> : null}
        <nav>
          <ul>
            <Entries path={path} tree={tree} />
          </ul>
        </nav>
      </div>
      <div className="page-aside-inner page-aside-options">
        <LanguageSwitcher locale={locale} locales={locales} translations={translations} />
        <button
          className={`page-aside-options-button schema-${schema}`}
          onClick={() =>
            setSchema((prev) => {
              switch (prev) {
                case "light":
                  return "dark";
                case "dark":
                  return "auto";
                default:
                  return "light";
              }
            })
          }
        />
      </div>
    </aside>
  );
};

export default Sidebar;
