---
order: 30
label: Authoring
---

# Authoring

mdgen does not impose a strict structure: write your `.md` files and organise
them into folders however you like. Two mechanisms control how they appear in
the site:

- the **frontmatter** of each page (order, label, visibility);
- the **folders**, which become sections in the sidebar.

Pages in this section:

- [Frontmatter](./frontmatter.md)
- [Folders & the sidebar](./folders-and-sidebar.md)

## Smart fallback

For a folder's index page, mdgen looks for `index.md` first and, if missing,
falls back to `readme.md`. This way a repository that already has a `readme.md`
works without changes.
