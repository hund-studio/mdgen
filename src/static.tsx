import "./styles/page.scss";
import { BrowserRouter, useLocation } from "react-router-dom";
import { create } from "./utils/db";
import { createRoot } from "react-dom/client";
import { load } from "@orama/orama";
import { StrictMode, useEffect, useState, type FC } from "react";
import Page from "./components/page/page";

const publicUrl = "{{{publicUrl}}}".replace(/\/$/, "") || "/";
const dataElement = document.getElementById("data");
const contentElement = document.getElementById("content");

let tree = dataElement ? JSON.parse(dataElement.textContent.trim()) : {};
let initialContent = contentElement ? contentElement.textContent.trim() : "";

const App: FC = () => {
  const [db, setDb] = useState<SearchDB>();
  const [manifest, setManifest] = useState<Record<string, string>>({});
  const [content, setContent] = useState(initialContent);
  const location = useLocation();

  useEffect(() => {
    const initApp = async () => {
      try {
        const [searchRes, manifestRes] = await Promise.all([
          fetch(`${publicUrl}/search.json`),
          fetch(`${publicUrl}/manifest.json`),
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

      try {
        const response = await fetch(`${publicUrl}/${contentPath}`);
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

  return <Page db={db} sidebar={tree} content={content} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <BrowserRouter basename={publicUrl}>
      <App />
    </BrowserRouter>
  </StrictMode>
);
