import "./styles/page.scss";
import { BrowserRouter, useLocation } from "react-router-dom";
import { create } from "./utils/db";
import { createRoot } from "react-dom/client";
import { load } from "@orama/orama";
import { StrictMode, useEffect, useState, type FC } from "react";
import Page from "./components/page/page";

const publicUrl = "{{{publicUrl}}}".replace(/\/$/, "") || "/";
const cleanBase = publicUrl === "/" ? "" : publicUrl;
const dataElement = document.getElementById("data");
const contentElement = document.getElementById("content");
const runtimeElement = document.getElementById("runtime");

let tree = dataElement ? JSON.parse(dataElement.textContent.trim()) : {};
let initialContent = contentElement ? contentElement.textContent.trim() : "";

const runtime: MdgenRuntime = (() => {
  const fallback: MdgenRuntime = { publicUrl, locale: null, locales: [], translations: {} };
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

const App: FC = () => {
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
        const [searchRes, manifestRes] = await Promise.all([
          fetch(`${localeBase}/search.json`),
          fetch(`${localeBase}/manifest.json`),
        ]);

        const rawData = await searchRes.json();
        const manifestData = await manifestRes.json();

        const db = create();
        load(db, rawData);

        setDb(db);
        setManifest(manifestData);
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
      locale={runtime.locale}
      locales={runtime.locales}
      translations={runtime.translations}
    />
  );
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={publicUrl}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
