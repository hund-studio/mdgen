import { motion } from "motion/react";
import { useEffect, useRef, useState, type FC } from "react";
import { useLocalStorage } from "usehooks-ts";
import Link from "../link/link";
import Search from "../search/search";

const PageEntry: FC<{ tree: PageEntry; path: string }> = ({ tree, path }) => {
  const normalizedPath = decodeURIComponent(path.replace(/\/$/, "").replace(/^\//, ""));
  const treeHref = tree.href ? decodeURIComponent(tree.href) : null;

  let activeClass = "";

  if (treeHref) {
    if (normalizedPath === treeHref) {
      activeClass = "active";
    }
  }

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
  const normalizedPath = decodeURIComponent(path.replace(/\/$/, "").replace(/^\//, ""));
  const isActiveOrContainsActive = normalizedPath.startsWith(tree.path);

  const [open, setOpen] = useState(isActiveOrContainsActive);

  return (
    <li className="dropdown">
      <div className="dropdown-label" onClick={() => setOpen((prev) => !prev)}>
        {tree.label || tree.name}
        <motion.div
          initial={!isActiveOrContainsActive ? { rotate: 180 } : { rotate: 0 }}
          animate={open ? { rotate: 0 } : { rotate: 180 }}
          className="dropdown-label-caret"
        />
      </div>
      <motion.div
        className="dropdown-content"
        initial={!isActiveOrContainsActive ? { height: 0 } : { height: "auto" }}
        animate={open ? { height: "auto" } : { height: 0 }}
      >
        <ul>
          <Entries path={path} tree={tree} />
        </ul>
      </motion.div>
    </li>
  );
};

const Entries: FC<{ tree: BrowserDirectoryEntry | FSDirectoryEntry; path: string }> = ({
  tree,
  path,
}) => {
  return tree.children.map((entry, index) => {
    if ("hidden" in entry && entry.hidden) return null;
    if ("children" in entry) return <DirectoryEntry path={path} tree={entry} key={index} />;
    if (!("href" in entry)) return <AssetEntry path={path} tree={entry} key={index} />;
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
  // Render client-side only: the equivalent-page hrefs aren't known at SSR time,
  // so deferring avoids a hydration mismatch.
  const [mounted, setMounted] = useState(false);
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);

  useEffect(() => setMounted(true), []);

  useEffect(() => {
    if (!open) return;
    const onPointerDown = (event: MouseEvent) => {
      if (ref.current && !ref.current.contains(event.target as Node)) setOpen(false);
    };
    document.addEventListener("mousedown", onPointerDown);
    return () => document.removeEventListener("mousedown", onPointerDown);
  }, [open]);

  if (!mounted || !locale || !locales || locales.length < 2) return null;

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
                    if (disabled || isCurrent) event.preventDefault();
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
  locale?: string | null;
  locales?: string[];
  translations?: Record<string, string | null>;
}> = ({ db, tree, path, locale, locales, translations }) => {
  const [schema, setSchema] = useLocalStorage("schema", "auto");

  if (!tree.children.length) return;

  useEffect(() => {
    document.documentElement.setAttribute("data-schema", schema);
  }, [schema]);

  return (
    <aside className="page-aside">
      <div className="page-aside-inner">
        <Search db={db} />
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
