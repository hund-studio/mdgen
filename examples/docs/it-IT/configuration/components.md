---
order: 30
label: Componenti React
---

# Componenti React (plugin)

Puoi renderizzare componenti React interattivi nella pagina mantenendo un
Markdown valido come fallback. Avvolgi una porzione di Markdown tra commenti
HTML:

```markdown
<!-- ApiTester -->

| Method | Description       |
| :----- | :---------------- |
| GET    | Get a resource    |
| POST   | Create a resource |

<!-- !ApiTester -->
```

- Senza JavaScript (o su GitHub) i commenti sono invisibili e la **tabella resta
  il fallback**.
- Nel sito generato la regione viene sostituita dal componente React registrato
  come `ApiTester`, che riceve il corpo della regione.

## Demo dal vivo

Questa è la stessa `ApiTester` usata anche nella pagina [CLI](../cli.md),
renderizzata partendo dalla tabella qui sotto:

<!-- ApiTester -->

| Method | Description                 |
| :----- | :-------------------------- |
| POST   | Create new resource         |
| GET    | Get a resource              |
| PATCH  | Update an existing resource |
| PUT    | Upsert a resource           |

<!-- !ApiTester -->

## Definire i componenti

Metti i componenti sotto `.mdgen/components/` ed esportali da `index.tsx`: viene
registrato **solo** ciò che è esportato lì (il resto della cartella puoi
organizzarlo come vuoi). Un marcatore `<!-- Nome -->` mappa sull'export `Nome`;
l'export `default` è ignorato.

```tsx
// .mdgen/components/index.tsx
export { ApiTester } from "./ApiTester";
```

```tsx
// .mdgen/components/ApiTester.tsx
import { useState } from "react";
import { withTableContent, type TableContent } from "mdgen";

// `withTableContent` trasforma la tabella della regione in righe di oggetti.
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

## Helper esportati da `mdgen`

- **`withTableContent`** — interpreta il corpo della regione (una tabella GFM)
  come un array `TableContent` e lo passa come prop `content`.
- **`withRawContent`** — passa il corpo grezzo della regione come stringa
  `content`.

I componenti vengono compilati in fase di build e **renderizzati lato server**
(quindi compaiono anche nell'HTML statico) prima di idratarsi nel browser.
Richiede la [CLI](../cli.md).
