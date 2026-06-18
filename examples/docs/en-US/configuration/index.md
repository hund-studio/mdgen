---
order: 40
label: Configuration
---

# Configuration (`.mdgen`)

Create a `.mdgen` folder at the root of your source. It is **never** published:
it only configures the build.

```
my-docs/
├─ .mdgen/
│  ├─ config.json        # site config (locales, search, …)
│  ├─ style.css          # custom styles / token overrides
│  └─ components/        # React components (see dedicated page)
│     └─ index.tsx
└─ index.md
```

## `config.json`

```jsonc
{
  "locales": ["it-IT", "en-US"], // enables i18n; omit for a single-language site
  "defaultLocale": "it-IT",      // landing locale; defaults to the first entry
  "search": true                 // set to false to disable the search index + UI
}
```

All fields are optional:

- **`locales`** — list of locales. When present, it enables [multilingual sites](./i18n.md).
- **`defaultLocale`** — the default language for the root redirect. If omitted,
  the first entry of `locales` is used.
- **`search`** — `false` disables the search index and its UI.

## Deep dives

- [Multilingual sites (i18n)](./i18n.md)
- [Theming & custom styles](./theming.md)
- [React components](./components.md)
