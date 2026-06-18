---
order: 10
label: Web tool
---

# Web tool

The quickest way to get started, without installing anything.

1. Go to [mdgen.hund.studio](https://mdgen.hund.studio).
2. Press **Pick a directory** and select the **folder** (not a single file) that
   contains your Markdown documentation.
3. Use **Open preview** to browse the result, then **Download HTML** to get the
   zip with the generated static site.

The web tool runs **entirely in your browser** thanks to the Filesystem API:
your files are never uploaded to a server. While the folder is open, mdgen
watches it for changes and regenerates the preview automatically.

## Browser requirements

The Filesystem API (`showDirectoryPicker`) is required to pick the folder. It is
available on Chromium-based browsers (Chrome, Edge, …); on browsers that don't
support it, use the [CLI](./cli.md).

## What the web tool covers

The web tool covers **single-site** generation, with frontmatter and custom
styles. Features that need a build step — **multilingual sites** and **React
components** — are only available via the [CLI](./cli.md).

> For details on how to organise and configure your content, see
> [Authoring](./authoring/index.md) and [Configuration](./configuration/index.md).
