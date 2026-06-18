---
order: 40
label: Configurazione
---

# Configurazione (`.mdgen`)

Crea una cartella `.mdgen` nella radice della sorgente. Non viene **mai**
pubblicata: serve solo a configurare la build.

```
le-mie-docs/
├─ .mdgen/
│  ├─ config.json        # configurazione del sito (locale, ricerca, …)
│  ├─ style.css          # stili personalizzati / override dei token
│  └─ components/        # componenti React (vedi pagina dedicata)
│     └─ index.tsx
└─ index.md
```

## `config.json`

```jsonc
{
  "locales": ["it-IT", "en-US"], // abilita l'i18n; ometti per un sito monolingua
  "defaultLocale": "it-IT",      // locale di atterraggio; default: il primo della lista
  "search": true                 // false per disattivare indice + UI di ricerca
}
```

Tutti i campi sono opzionali:

- **`locales`** — elenco dei locale. Se presente, attiva i [siti multilingua](./i18n.md).
- **`defaultLocale`** — la lingua di default per il redirect dalla radice. Se
  omesso, viene usato il primo elemento di `locales`.
- **`search`** — `false` disattiva l'indice di ricerca e la relativa UI.

## Approfondimenti

- [Siti multilingua (i18n)](./i18n.md)
- [Temi e stili personalizzati](./theming.md)
- [Componenti React](./components.md)
