import "./styles/page.scss";
import { create } from "./utils/db";
import { createRoot } from "react-dom/client";
import { load } from "@orama/orama";
import { StrictMode, useEffect, useState, type FC } from "react";
import Page from "./components/page/page";

const dataElement = document.getElementById("data");
const contentElement = document.getElementById("content");

let tree = dataElement ? JSON.parse(dataElement.textContent.trim()) : {};
let content = contentElement ? contentElement.textContent.trim() : "";

const App: FC = () => {
  const [db, setDb] = useState<SearchDB>();

  useEffect(() => {
    const initSearch = async () => {
      try {
        const response = await fetch("/search.json");
        const rawData = await response.json();
        const db = create();
        load(db, rawData);
        setDb(db);
      } catch (e) {
        console.error("Errore nel caricamento dell'indice di ricerca:", e);
      }
    };

    initSearch();
  }, []);

  return <Page db={db} sidebar={tree} content={content} />;
};

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <App />
  </StrictMode>
);
