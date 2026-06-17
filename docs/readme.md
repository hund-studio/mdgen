# 🔨 mdgen: A Markdown to HTML Generator

[![npm version](https://img.shields.io/npm/v/@hund.studio/mdgen?color=red&label=npm%20package)](https://www.npmjs.com/package/@hund.studio/mdgen)
[![GitHub repo](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/hund-studio/mdgen)
[![Website](https://img.shields.io/badge/website-mdgen.hund.studio-blue)](https://mdgen.hund.studio/)
[![Provenance Verified](https://img.shields.io/badge/provenance-verified-blueviolet)](https://www.npmjs.com/package/@hund.studio/mdgen?activeTab=code)

> **Tip:** Now with the new CLI tool, you can skip the browser-based workflow and significantly speed up the static site generation.

**mdgen** turns a folder of Markdown (`.md`) files into a static **HTML** documentation site. It runs either **entirely in your browser** (serverless, via the Filesystem API — your files never leave your machine) or as a **CLI** for fast, scriptable builds.

## Table of Contents

- [Key Features](#key-features)
- [How to Use (Web Version)](#how-to-use-web-version)
- [How to Use (CLI Tool)](#how-to-use-cli-tool)
  - [Quick Start](#quick-start-no-installation-required)
  - [Options](#options)
  - [Serving the Files](#serving-the-files)
- [Authoring](#authoring)
  - [Frontmatter (order, label, hidden)](#frontmatter)
  - [Folders & the sidebar](#folders--the-sidebar)
- [Configuration (`.mdgen`)](#configuration-mdgen)
  - [`config.json`](#configjson)
  - [Multilingual sites (i18n)](#multilingual-sites-i18n)
  - [Theming & custom styles](#theming--custom-styles)
  - [React components (plugins)](#react-components-plugins)
- [Project Status & Roadmap](#project-status--roadmap)

## Key Features

- **Serverless & Secure**: in the browser, no data leaves your device.
- **Frontmatter**: order, rename and hide entries with simple YAML-ish frontmatter.
- **Multilingual (i18n)**: locale folders, per-language sidebar/search and a built-in language switcher.
- **Fuzzy Search**: built-in [Orama](https://oramasearch.com/) index (toggleable).
- **Theming**: Mantine-inspired design tokens, light/dark/system toggle, fully overridable from a single CSS file.
- **React components**: drop interactive React components into the page, with the Markdown staying as a graceful fallback.
- **Markdown Support**: GFM (tables, checkboxes, …).
- **Smart Fallback**: detects `index.md`, or falls back to `readme.md`.

## How to Use (Web Version)

The easiest way to get started without installing anything.

1. Go to [mdgen.hund.studio](https://mdgen.hund.studio).
2. Select the **folder** (not a single file) containing your Markdown documentation.
3. Download the generated static HTML.

> The web tool covers single-site generation, frontmatter and custom styles. **Multilingual sites** and **React components** require the CLI (they need a build step).

## How to Use (CLI Tool)

### Quick Start (No Installation Required)

```bash
npx @hund.studio/mdgen [options]
```

### Options

| Option               | Shorthand | Description                                      | Default     |
| :------------------- | :-------- | :----------------------------------------------- | :---------- |
| `--source <path>`    | `-s`      | The directory containing your markdown files     | `.`         |
| `--outDir <path>`    | `-o`      | Parent directory where the output will be saved  | `.`         |
| `--name <name>`      | `-n`      | The name of the output folder                    | `generated` |
| `--public-url <url>` | `-u`      | The base URL or path for the site (e.g., /docs/) | `/`         |
| `--watch`            | `-w`      | Watch for changes in the source directory        | `false`     |

**Example (in a package script):**

```jsonc
"generate:doc": "npx @hund.studio/mdgen -s ./docs -o ./dist-md -n docs -u /docs/"
```

### Serving the Files

The output is a SPA-style static site; serve it over HTTP rather than opening the files directly:

```bash
npx http-server ./dist-md/docs
```

When deploying under a sub-path (e.g. `/docs/`), build with the matching `--public-url`.

## Authoring

### Frontmatter

Any page can start with a frontmatter block. All fields are optional:

```markdown
---
title: Getting started   # overrides the H1-derived title
label: Quickstart         # sidebar label (defaults to title, then file name)
order: 10                 # sidebar sort weight (ascending; unset sinks to the bottom)
hidden: false             # hide from the sidebar (the page is still generated)
---

# Getting started
```

Sorting is by `order` first, then pages before folders, then alphabetical by label.

### Folders & the sidebar

- A folder **with** an `index.md` (or `readme.md`) becomes a **clickable** sidebar entry: clicking the label opens that page and expands the section, while the **caret** toggles the section without navigating. The folder's `label`/`order` are taken from the index page's frontmatter.
- A folder **without** an index is a plain accordion; its label defaults to the prettified folder name (`getting-started` → "Getting Started").

## Configuration (`.mdgen`)

Create a `.mdgen` folder at the root of your documentation source. It is never published — it only configures the build.

```
my-docs/
├─ .mdgen/
│  ├─ config.json        # site config (locales, search, …)
│  ├─ style.css          # custom styles / token overrides
│  └─ components/        # React components (see below)
│     └─ index.tsx
└─ index.md
```

### `config.json`

```jsonc
{
  "locales": ["it-IT", "en-US"], // enables i18n (see below); omit for a single-language site
  "defaultLocale": "it-IT",      // landing locale; defaults to the first entry
  "search": true                 // set to false to disable the search index + UI
}
```

### Multilingual sites (i18n)

Declare your `locales` in `config.json` and put each language in a folder named after its locale, **sharing the same structure** (same file/folder names, translated content):

```
my-docs/
├─ .mdgen/config.json     # { "locales": ["it-IT","en-US"], "defaultLocale": "it-IT" }
├─ it-IT/
│  ├─ index.md
│  └─ guide/index.md
└─ en-US/
   ├─ index.md
   └─ guide/index.md
```

What you get:

- A **language switcher** in the sidebar showing each language's native name.
- **Per-locale** sidebar, search index and routing (`/<locale>/…`).
- A **root redirect** that picks the best match from the visitor's `navigator.language`, falling back to `defaultLocale`.
- If a page is missing in another locale, the switcher **disables** that language for that page (no broken links).

> Tip: keep file and folder **names identical** across locales (translate the _content_, not the filenames) so equivalent pages map to each other.

### Theming & custom styles

The look is driven by **design tokens** (`--mdgen-*`). To re-skin a site, drop a `.mdgen/style.css` — it is injected **after** the default stylesheet, so redefining a token wins:

```css
/* .mdgen/style.css */
:root {
  --mdgen-primary: #e64980;
  --mdgen-radius: 12px;
}
[data-schema="dark"] {
  --mdgen-color-body: #101113;
}
```

Common tokens: `--mdgen-color-body`, `--mdgen-color-surface`, `--mdgen-color-text`, `--mdgen-color-dimmed`, `--mdgen-color-border`, `--mdgen-color-hover`, `--mdgen-primary`, `--mdgen-primary-light`, `--mdgen-radius`, `--mdgen-font-family`, …

A built-in toggle cycles **light → dark → system**; the chosen scheme is applied before first paint (no flash) and native UI follows via `color-scheme`.

### React components (plugins)

Render interactive React components inside the page while keeping a valid Markdown fallback. Wrap a region of Markdown in HTML comments:

```markdown
<!-- ApiTester -->

| Method | Description         |
| :----- | :------------------ |
| GET    | Get a resource      |
| POST   | Create a resource   |

<!-- !ApiTester -->
```

- Without JS (or on GitHub), the comments are invisible and the **table renders as the fallback**.
- In the built site, the region is replaced by the React component registered as `ApiTester`, which receives the region body.

Define your components under `.mdgen/components/` and export them from `index.tsx` (only what's exported there is registered; the rest of the folder is free to organise):

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

Helpers exported from `mdgen`:

- `withTableContent` — parses the region body (a GFM table) into a `TableContent` array and passes it as the `content` prop.
- `withRawContent` — passes the raw region body as a `content` string.

Components are compiled at build time and **server-rendered** (so they appear in the static HTML too) before hydrating in the browser. Requires the CLI.

## Project Status & Roadmap

**Status:** Beta, evolving quickly.

- ✅ Markdown YAML frontmatter (order/label/hidden)
- ✅ Multilingual (i18n) sites with language switcher
- ✅ Sidebar ordering & folder index pages
- ✅ Theming via design tokens + custom CSS
- ✅ React components/plugins from `.mdgen/components`
- 🚧 Custom logo / brand
- 🚧 Mobile layout polish
- 🚧 Page categories & tags for richer search
- 🚧 Sample `.mdgen` themes
