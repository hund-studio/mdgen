import { createContext } from "react";

/**
 * Canonical href of the page currently being rendered (e.g.
 * `/it-IT/guide/index.html`). Used by `Link` to resolve relative markdown
 * links against the current page — preserving both the directory and, in a
 * multilingual site, the locale prefix.
 */
export const pathContext = createContext<string>("");
