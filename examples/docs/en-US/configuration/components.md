---
order: 30
label: React components
---

# React components (plugins)

You can render interactive React components inside the page while keeping a valid
Markdown fallback. Wrap a region of Markdown in HTML comments:

```markdown
<!-- ApiTester -->

| Method | Description       |
| :----- | :---------------- |
| GET    | Get a resource    |
| POST   | Create a resource |

<!-- !ApiTester -->
```

- Without JavaScript (or on GitHub) the comments are invisible and the **table
  renders as the fallback**.
- In the built site, the region is replaced by the React component registered as
  `ApiTester`, which receives the region body.

## Live demo

This is the same `ApiTester` used on the [CLI](../cli.md) page, rendered from the
table below:

<!-- ApiTester -->

| Method | Description                 |
| :----- | :-------------------------- |
| POST   | Create new resource         |
| GET    | Get a resource              |
| PATCH  | Update an existing resource |
| PUT    | Upsert a resource           |

<!-- !ApiTester -->

## Defining components

Put your components under `.mdgen/components/` and export them from `index.tsx`:
only what is exported there is registered (organise the rest of the folder
however you like). A `<!-- Name -->` marker maps to the export `Name`; the
`default` export is ignored.

```tsx
// .mdgen/components/index.tsx
export { ApiTester } from "./ApiTester";
```

```tsx
// .mdgen/components/ApiTester.tsx
import { useState } from "react";
import { withTableContent, type TableContent } from "mdgen";

// `withTableContent` parses the region's table into rows of objects.
export const ApiTester = withTableContent(({ content }: { content: TableContent }) => {
  const [selected, setSelected] = useState(0);
  return (
    <div>
      {content.map((row, i) => (
        <button key={i} onClick={() => setSelected(i)}>{row.Method}</button>
      ))}
      <p>{content[selected]?.Description}</p>
    </div>
  );
});
```

## Helpers exported from `mdgen`

- **`withTableContent`** — parses the region body (a GFM table) into a
  `TableContent` array and passes it as the `content` prop.
- **`withRawContent`** — passes the raw region body as a `content` string.

Components are compiled at build time and **server-rendered** (so they appear in
the static HTML too) before hydrating in the browser. Requires the
[CLI](../cli.md).
