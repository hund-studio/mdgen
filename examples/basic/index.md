# Basic Documentation Example

This is an example of how a simple documentation might be organized.

## Table of Contents

1. [Using **mdgen**](#getting-started)
2. [Markdown Language Specifications](./markdown/index.md)

## Getting Started

> This tool is based on an experimental API not yet supported by all browsers.

To start using this tool, you must first prepare a new project by creating a folder containing an `index.md` file inside it.
Once the basic structure is created, you can proceed to [mdgen](https://mdgen.hund.studio) and, by clicking the "Pick a directory" button, select the **folder** you just created.
Once the folder is selected, there are 2 options:

- View a preview of how the compiled documentation will look;
- Download the `.zip` file containing the html code.

## Roadmap

- [ ] Currently, the default file used for each directory is index.md; it would be better to use readme.md and, if not found, then fall back to index.md;
- [ ] The ability to upload custom CSS and styles through the use of a .mdgen directory;
- [ ] Additional dark/light color scheme;
- [ ] Fuzzy search functionality;
