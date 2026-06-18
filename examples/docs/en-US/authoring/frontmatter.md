---
order: 10
label: Frontmatter
---

# Frontmatter

Any page can start with a frontmatter block. All fields are optional:

```markdown
---
title: Getting started   # overrides the H1-derived title
label: Quickstart        # sidebar label (defaults to title, then file name)
order: 10                # sidebar sort weight (ascending; unset sinks to the bottom)
hidden: false            # hide from the sidebar (the page is still generated)
---

# Getting started
```

## Fields

- **`title`** — overrides the title derived from the page's `# H1`.
- **`label`** — the text shown in the sidebar. Falls back to the title and,
  ultimately, the file name.
- **`order`** — ascending sort weight. Entries without `order` sink to the
  bottom.
- **`hidden`** — when `true`, the page does not appear in the sidebar but is
  still generated (handy for pages reachable only via a direct link).

## Sorting

Sidebar order follows this priority: by `order` first, then pages before
folders, then alphabetically by label.

This page has `order: 10`, while [Folders & the sidebar](./folders-and-sidebar.md)
has `order: 20`, which is why it appears first.
