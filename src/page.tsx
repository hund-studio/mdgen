import "./index.scss";
import { createRoot } from "react-dom/client";
import { StrictMode } from "react";
import Page from "./templates/page/page.tsx";

const dataElement = document.getElementById("data");
const contentElement = document.getElementById("content");

let tree = dataElement ? JSON.parse(dataElement.textContent.trim()) : {};
let content = contentElement ? contentElement.textContent.trim() : "";

createRoot(document.getElementById("root")!).render(
  <StrictMode>
    <Page sidebar={tree} content={content} />
  </StrictMode>
);
