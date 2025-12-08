# 🔨 mdgen: Serverless Markdown to HTML Generator

**mdgen** is a static documentation generator that operates entirely within your browser (it is **serverless**).

By utilizing the **Filesystem API**, mdgen can read a local folder containing your Markdown (`.md`) files and render them as static **HTML** pages ready for online publication.

The entire process happens client-side: **no installation or compilation is required, and the absence of a server** ensures that your Markdown files never leave your computer.

## How to Get Started

To begin compiling your documentation:

1. Go to [mdgen.hund.studio](https://mdgen.hund.studio).
2. Select the **folder** (not a single file) containing your Markdown documentation.
3. Download the generated static HTML.

## Project Status (Beta)

The tool is currently in its beta phase (developed in just a couple of days), but it will soon be expanded to include:

- [ ] Currently, the default file used for each directory is `index.md`; it would be better to use `readme.md` and, if not found, then fall back to `index.md`;
- [ ] The ability to upload **custom CSS and styles** through the use of a `.mdgen` directory;
- [ ] Additional dark/light color scheme;
- [ ] Fuzzy search functionality;
- [x] Automatic refresh on file change **(limited browser support)**;
- [x] Support for **additional Markdown features**:
  - [x] remark-gfm
    - [x] Tables
    - [x] Checkboxes
