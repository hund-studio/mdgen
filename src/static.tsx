import "./styles/page.scss";
import * as React from "react";
import * as JsxRuntime from "react/jsx-runtime";
import { BrowserRouter, useLocation } from "react-router-dom";
import { create } from "./utils/db";
import { createRoot } from "react-dom/client";
import { load } from "@orama/orama";
import { StrictMode, useEffect, useState, type FC } from "react";
import Page from "./components/page/page";
import type { ComponentRegistry } from "./components/content/content";

// Expose the page's React to the separately-bundled components chunk, so doc
// components share this exact React instance (hooks work, no duplicate copy).
(globalThis as unknown as { __mdgenReact: typeof React }).__mdgenReact = React;
(globalThis as unknown as { __mdgenJsx: typeof JsxRuntime }).__mdgenJsx = JsxRuntime;

const publicUrl = "{{{publicUrl}}}".replace(/\/$/, "") || "/";
const cleanBase = publicUrl === "/" ? "" : publicUrl;
const dataElement = document.getElementById("data");
const contentElement = document.getElementById("content");
const runtimeElement = document.getElementById("runtime");

let tree = dataElement ? JSON.parse(dataElement.textContent.trim()) : {};
let initialContent = contentElement ? contentElement.textContent.trim() : "";

const runtime: MdgenRuntime = (() => {
  const fallback: MdgenRuntime = {
    publicUrl,
    page: "/",
    search: true,
    locale: null,
    locales: [],
    translations: {},
  };
  const raw = runtimeElement?.textContent?.trim();
  if (!raw) return fallback;
  try {
    return { ...fallback, ...JSON.parse(raw) };
  } catch {
    return fallback;
  }
})();

// Per-locale assets live under `/<locale>/`; without i18n everything is at the root.
const localeBase = runtime.locale ? `${cleanBase}/${runtime.locale}` : cleanBase;

const App: FC<{ components: ComponentRegistry }> = ({ components }) => {
  const [db, setDb] = useState<SearchDB>();
  const [manifest, setManifest] = useState<Record<string, string>>({});
  const [content, setContent] = useState(initialContent);
  // Canonical href of the current page; seeded from the injected runtime so it
  // matches the server-rendered markup, then kept in sync on navigation.
  const [pagePath, setPagePath] = useState(runtime.page || "/");
  const location = useLocation();

  useEffect(() => {
    const initApp = async () => {
      try {
        const manifestData = await (await fetch(`${localeBase}/manifest.json`)).json();
        setManifest(manifestData);

        // Only load the search index when search is enabled for this site.
        if (runtime.search) {
          const rawData = await (await fetch(`${localeBase}/search.json`)).json();
          const db = create();
          load(db, rawData);
          setDb(db);
        }
      } catch (e) {
        console.error("Errore inizializzazione:", e);
      }
    };
    initApp();
  }, []);

  useEffect(() => {
    const cleanPath = location.pathname.replace(/\/$/, "") || "/";

    const loadNewContent = async () => {
      const contentPath = manifest[cleanPath];
      if (!contentPath) return;

      // Derive the canonical page href from the manifest entry (keeps the
      // locale prefix), so relative links resolve from the right directory.
      setPagePath("/" + contentPath.replace(/\.content$/, ".html"));

      try {
        // `contentPath` already carries the locale prefix when i18n is enabled.
        const response = await fetch(`${cleanBase}/${contentPath}`);
        const data = await response.text();
        setContent(data);
      } catch (e) {
        console.error("Errore fetch content:", e);
      }
    };

    if (Object.keys(manifest).length > 0) {
      loadNewContent();
    }
  }, [location.pathname, manifest]);

  return (
    <Page
      db={db}
      sidebar={tree}
      content={content}
      path={pagePath}
      search={runtime.search}
      locale={runtime.locale}
      locales={runtime.locales}
      translations={runtime.translations}
      components={components}
    />
  );
};

const mount = async () => {
  let components: ComponentRegistry = {};

  // Load the doc's compiled components (they register on a global) before the
  // first render, so component regions render in one pass.
  if (runtime.components) {
    try {
      await import(/* @vite-ignore */ `${cleanBase}/assets/components.js`);
      components =
        (globalThis as unknown as { __mdgenComponents?: ComponentRegistry }).__mdgenComponents ?? {};
    } catch (e) {
      console.error("Errore caricamento componenti:", e);
    }
  }

  createRoot(document.getElementById("root")!).render(
    <StrictMode>
      <BrowserRouter basename={publicUrl}>
        <App components={components} />
      </BrowserRouter>
    </StrictMode>
  );
};

mount();
