import { useState } from "react";
import { withTableContent, type TableContent } from "mdgen";

/**
 * Interactive component rendered in place of the `<!-- ApiTester -->` region.
 * The markdown table inside the region stays as the no-JS fallback; here it is
 * received already parsed (via `withTableContent`) as rows of `{ Method, … }`.
 */
export const ApiTester = withTableContent(({ content }: { content: TableContent }) => {
  const [selected, setSelected] = useState(0);
  const [calls, setCalls] = useState(0);
  const row = content[selected];

  const chip = (active: boolean) => ({
    border: "1px solid var(--mdgen-color-border)",
    background: active ? "var(--mdgen-primary)" : "transparent",
    color: active ? "var(--mdgen-primary-contrast)" : "inherit",
    borderColor: active ? "var(--mdgen-primary)" : "var(--mdgen-color-border)",
    borderRadius: "var(--mdgen-radius-sm)",
    padding: "0.2rem 0.6rem",
    font: "inherit",
    fontSize: "0.85rem",
    cursor: "pointer",
  });

  return (
    <div
      style={{
        border: "1px solid var(--mdgen-color-border)",
        borderRadius: "var(--mdgen-radius)",
        overflow: "hidden",
      }}
    >
      <div
        style={{
          display: "flex",
          flexWrap: "wrap",
          gap: "0.4rem",
          padding: "0.75rem",
          borderBottom: "1px solid var(--mdgen-color-border)",
          background: "var(--mdgen-color-surface)",
        }}
      >
        {content.map((entry, index) => (
          <button key={index} style={chip(index === selected)} onClick={() => setSelected(index)}>
            {entry.Method}
          </button>
        ))}
      </div>
      <div style={{ padding: "0.75rem" }}>
        <p style={{ marginTop: 0 }}>{row?.Description}</p>
        <button style={chip(false)} onClick={() => setCalls((value) => value + 1)}>
          ▶ Invia {row?.Method}
        </button>
        {calls > 0 ? (
          <span style={{ marginLeft: "0.6rem", color: "var(--mdgen-color-dimmed)" }}>
            richiesta inviata {calls}×
          </span>
        ) : null}
      </div>
    </div>
  );
});
