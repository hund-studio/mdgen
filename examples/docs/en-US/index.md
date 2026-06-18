---
order: 1
label: Introduction
---

# mdgen documentation

> This project is at the same time the **official documentation** of mdgen and a **downloadable example** to preview what the final output looks like. Open it in the web tool or generate it with the CLI to explore it.

## What mdgen is

**mdgen** turns a folder of Markdown (`.md`) files into a static **HTML**
documentation site. It works in two ways:

- **entirely in your browser** (serverless, via the Filesystem API — your files
  never leave your machine);
- as a **CLI**, for fast, scriptable builds (for example inside NPM scripts).

## Why it exists

Too often we write small internal tools that need documentation which is easy to
browse and, ideally, easy to publish online. Until recently we relied on
solutions like Docusaurus or other frameworks, but paid a high price in time
spent on maintenance and upgrades.

Out of that need we built **mdgen**: a static HTML generator that works from any
folder containing `.md` files. To make it easy (and fast) to use even for
non-technical people, we leveraged the browser's Filesystem API: once you pick
the folder, the tool produces a zip containing the generated HTML files. Right
after the first version, the CLI followed, to use directly from scripts.

## How it works

The core idea is deliberately simple (which is also why it is probably not the
right tool for very complex documentation): read the `.md` files and statically
render them with React. Because of that, mdgen does not require a strict
structure and can be organised quite freely — much like you would in tools such
as Obsidian.

## Where to start

- [Web tool](./web.md) — generate without installing anything.
- [CLI tool](./cli.md) — fast, scriptable builds.
- [Authoring](./authoring/index.md) — frontmatter, folders and the sidebar.
- [Configuration](./configuration/index.md) — the `.mdgen` folder, i18n, theming, components.
- [Status & roadmap](./roadmap.md) — what's here and what's coming.

## Key features

- **Serverless & secure**: in the browser, no data leaves your device.
- **Frontmatter**: order, rename and hide entries with a few lines.
- **Multilingual (i18n)**: locale folders, per-language sidebar/search and a
  built-in language switcher.
- **Fuzzy search**: built-in [Orama](https://oramasearch.com/) index (toggleable).
- **Theming**: Mantine-inspired design tokens, light/dark/system toggle, fully
  overridable from a single CSS file.
- **React components**: interactive components in the page, with Markdown staying
  as a graceful fallback.
- **Markdown support**: GFM (tables, checkboxes, …).
- **Smart fallback**: detects `index.md`, or falls back to `readme.md`.
