---
order: 20
label: Folders & the sidebar
---

# Folders & the sidebar

Subfolders of the source become **sections** in the sidebar. Their behaviour
depends on whether an index page is present.

## Folder with an `index.md`

A folder that contains an `index.md` (or `readme.md`) becomes a **clickable**
entry: clicking the label opens that page and expands the section, while the
**caret** on the right expands/collapses the section **without** navigating. The
folder's label and order are taken from the index page's frontmatter.

This section, **Authoring**, is exactly an example: it has an
[`index.md`](./index.md), so the entry is clickable.

## Folder without an index

A folder **without** an index page is a plain accordion: clicking the entry (or
the caret) merely opens/closes the section. In that case the label defaults to
the prettified folder name (`getting-started` → "Getting Started").

## Labels and file names

For multilingual sites, keep file and folder names **identical** across locales
(translate the _content_, not the names): that is how mdgen maps equivalent
pages across languages. See [Multilingual sites](../configuration/i18n.md).
