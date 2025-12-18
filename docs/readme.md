# 🔨 mdgen: A Markdown to HTML Generator

> **Tip:** Now with the new CLI tool, you can skip the browser-based workflow and significantly speed up the static site generation.

**mdgen** is a static documentation generator that operates entirely within your browser (it is **serverless**).

By utilizing the **Filesystem API**, mdgen reads a local folder containing your Markdown (`.md`) files and renders them as static **HTML** pages ready for online publication. The entire process happens client-side: **no installation or compilation is required**, and your files never leave your computer.

## Table of Contents

- [🔨 mdgen: A Markdown to HTML Generator](#-mdgen-a-markdown-to-html-generator)
  - [Table of Contents](#table-of-contents)
    - [Key Features](#key-features)
  - [How to Use (Web Version)](#how-to-use-web-version)
  - [How to Use (CLI Tool)](#how-to-use-cli-tool)
    - [Installation \& Building](#installation--building)
    - [Generating Documentation](#generating-documentation)
    - [Serving the Files](#serving-the-files)
  - [Configuration (`.mdgen`)](#configuration-mdgen)
    - [Current Capabilities](#current-capabilities)
    - [Planned Capabilities](#planned-capabilities)
  - [Project Status \& Roadmap](#project-status--roadmap)
    - [Immediate Priorities (Next Steps)](#immediate-priorities-next-steps)
    - [Backlog \& Future Features](#backlog--future-features)

### Key Features

- **Serverless & Secure**: No data leaves your device.
- **Fuzzy Search**: Built-in Orama index generation for fast search.
- **Auto-Refresh**: Automatic refresh on file change (limited browser support).
- **Markdown Support**: Includes GFM (GitHub Flavored Markdown), Tables, and Checkboxes.
- **Smart Fallback**: Automatically detects `index.md` or falls back to `readme.md`.

## How to Use (Web Version)

The easiest way to get started without installing anything.

1. Go to [mdgen.hund.studio](https://mdgen.hund.studio).
2. Select the **folder** (not a single file) containing your Markdown documentation.
3. Download the generated static HTML.

## How to Use (CLI Tool)

For a faster workflow that doesn't rely on the browser, you can use the CLI tool.

### Installation & Building

Currently, you need to build the tool locally to use it.

1. **Build the CLI:** `npm run build:cli`
2. **Install Globally (for testing):** `npm i -g .` _(Run this command from the project root.)_

### Generating Documentation

The CLI tool generates the output folder in the **parent directory** of where the command is executed.

1. Navigate to a folder containing your `.md` files.
2. Run the command: `npx mdgen` _(Or just `mdgen` if you linked it)_

### Serving the Files

To view the generated static files correctly, it is recommended to use an HTTP server rather than opening the HTML files directly.

1. **Install http-server:** `npm i -g http-server`
2. **Navigate to the generated folder:** `cd ../generated`
3. **Start the server:** `npx http-server .`

## Configuration (`.mdgen`)

You can customize the final build by creating a special folder named `.mdgen` in the root of your documentation project.

### Current Capabilities

- **Custom CSS:** Place a file named `style.css` inside `.mdgen/`. It will be automatically detected and added to the final build, allowing you to override the default styles.

### Planned Capabilities

Future implementations that will utilize the `.mdgen` folder include:

- **Custom Logo:** Upload a custom logo to replace the default one.
- **Sidebar Customization:** Options to modify the navigation structure.
- **Special Categories:** Custom behaviors for specific page groups.

## Project Status & Roadmap

**Status:** Beta. The project is rapidly evolving. The completion of the tasks below will mark our first official stable release.

### Immediate Priorities (Next Steps)

- [ ] Additional dark/light color scheme;
- [ ] Add sample `.mdgen` styles (ae. Fantasy DnD)
- [ ] **CLI Improvements:**
  - [x] Runnning and installable script
  - [ ] Add `--output` option (using commander or similar)
- [x] Fuzzy search functionality;
  - [x] Orama index generation on compile
  - [x] Better search UI
- [x] Currently, the default file used for each directory is `index.md`; it would be better to use `readme.md` and, if not found, then fall back to `index.md`
- [x] The ability to upload **custom CSS and styles** through the use of a `.mdgen` directory
- [x] Automatic refresh on file change **(limited browser support)**
- [x] Support for **additional Markdown features**:
  - [x] remark-gfm
    - [x] Tables
    - [x] Checkboxes

### Backlog & Future Features

- [ ] Add Markdown YAML metadata support.
- [ ] Allow `.ts`/`.js` plugins from the `.mdgen` folder.
- [ ] Mobile version.
