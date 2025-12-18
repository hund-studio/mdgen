import "./styles/page.scss";
import { create, load } from "@orama/orama";
import { createRoot } from "react-dom/client";
import { StrictMode, useEffect, useState, type FC } from "react";
import Page from "./templates/page/page.tsx";
import type { SearchDB } from "./App.tsx";

const dataElement = document.getElementById("data");
const contentElement = document.getElementById("content");

let tree = dataElement ? JSON.parse(dataElement.textContent.trim()) : {};
let content = contentElement ? contentElement.textContent.trim() : "";

const RootApp: FC = () => {
  const [db, setDb] = useState<SearchDB>();

  useEffect(() => {
    const initSearch = async () => {
      try {
        const response = await fetch("/search.json");
        const rawData = await response.json();
        const db = create({
          schema: {
            title: "string",
            content: "string",
            href: "string",
          },
        });
        load(db, rawData);
        setDb(db);
        console.log("Orama Index caricato con successo");
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
    <RootApp />
  </StrictMode>
);
