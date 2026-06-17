import { createElement, type ComponentType } from "react";

/** Rows of a parsed markdown table, keyed by header label. */
export type TableContent = Record<string, string>[];

/** Parses the first GFM table found in a markdown string into row objects. */
export const parseTable = (markdown: string): TableContent => {
  const rows = markdown
    .split("\n")
    .map((line) => line.trim())
    .filter((line) => line.startsWith("|"));

  if (rows.length < 2) return [];

  const cells = (line: string) =>
    line
      .replace(/^\s*\|/, "")
      .replace(/\|\s*$/, "")
      .split("|")
      .map((cell) => cell.trim());

  const headers = cells(rows[0]);

  // rows[1] is the `---|---` separator; data starts at row index 2.
  return rows.slice(2).map((line) => {
    const values = cells(line);
    return Object.fromEntries(headers.map((header, index) => [header, values[index] ?? ""]));
  });
};

/**
 * Wraps a component so it receives the comment region's body parsed as a table.
 *
 *   export const ApiTester = withTableContent(({ content }) => { ... })
 *
 * `content` arrives as a `TableContent` (array of row objects); the raw
 * markdown table also remains the no-JS fallback in the page.
 */
export const withTableContent = <P extends { content: TableContent }>(
  Component: ComponentType<P>
): ComponentType<{ content: string } & Omit<P, "content">> => {
  const Wrapped = ({ content, ...rest }: { content: string } & Omit<P, "content">) =>
    createElement(Component, { ...(rest as Omit<P, "content">), content: parseTable(content) } as P);

  Wrapped.displayName = `withTableContent(${Component.displayName || Component.name || "Component"})`;
  return Wrapped;
};

/** Passes the raw comment-region body to the component as a `content` string. */
export const withRawContent = <P extends { content: string }>(
  Component: ComponentType<P>
): ComponentType<{ content: string } & Omit<P, "content">> => Component;
