# 🔨 mdgen: A Markdown to HTML Generator

[![npm version](https://img.shields.io/npm/v/@hund.studio/mdgen?color=red&label=npm%20package)](https://www.npmjs.com/package/@hund.studio/mdgen)
[![GitHub repo](https://img.shields.io/badge/GitHub-Repository-black?logo=github)](https://github.com/hund-studio/mdgen)
[![Website](https://img.shields.io/badge/website-mdgen.hund.studio-blue)](https://mdgen.hund.studio/)
[![Provenance Verified](https://img.shields.io/badge/provenance-verified-blueviolet)](https://www.npmjs.com/package/@hund.studio/mdgen?activeTab=code)

> **Tip:** Now with the new CLI tool, you can skip the browser-based workflow and significantly speed up the static site generation.

**mdgen** is a static documentation generator that operates entirely within your browser (it is **serverless**).

By utilizing the **Filesystem API**, mdgen reads a local folder containing your Markdown (`.md`) files and renders them as static **HTML** pages ready for online publication. The entire process happens client-side: **no installation or compilation is required**, and your files never leave your computer.

## Table of Contents

- [🔨 mdgen: A Markdown to HTML Generator](#-mdgen-a-markdown-to-html-generator)
  - [Table of Contents](#table-of-contents)
    - [Key Features](#key-features)
  - [How to Use (Web Version)](#how-to-use-web-version)
  - [How to Use (CLI Tool)](#how-to-use-cli-tool)
    - [Quick Start (No Installation Required)](#quick-start-no-installation-required)
    - [Generating Documentation](#generating-documentation)
      - [Advanced Options](#advanced-options)
    - [Serving the Files](#serving-the-files)
  - [Configuration (`.mdgen`)](#configuration-mdgen)
    - [Current Capabilities](#current-capabilities)
    - [Planned Capabilities](#planned-capabilities)
  - [Project Status \& Roadmap](#project-status--roadmap)
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

The mdgen CLI provides a fast, terminal-based workflow for generating and managing your documentation without needing a browser.

### Quick Start (No Installation Required)

The easiest way to run the tool is via `npx`. This ensures you are always using the latest features without a permanent installation:

```bash
npx @hund.studio/mdgen [options]
```

### Generating Documentation

The CLI tool generates the output folder in the **parent directory** of where the command is executed.

1. Navigate to a folder containing your `.md` files.
2. Run the command using the following options:

#### Advanced Options

| Option            | Shorthand | Description                                     | Default     |
| :---------------- | :-------- | :---------------------------------------------- | :---------- |
| `--source <path>` | `-s`      | The directory containing your markdown files    | `.`         |
| `--outDir <path>` | `-o`      | Parent directory where the output will be saved | `.`         |
| `--name <name>`   | `-n`      | The name of the output folder                   | `generated` |
| `--watch`         | `-w`      | Watch for changes in the source directory       | `false`     |

**Examples:**

- **Custom folder name:**

```bash
npx @hund.studio/mdgen --name my-docs
```

- **Specific output path:**

```bash
npx @hund.studio/mdgen --outDir ./dist --name site
```

- **In a package script:**

```bash
"generate:doc": "npx @hund.studio/mdgen -s ./docs -o ./dist-md -n docs"
```

### Serving the Files

To view the generated static files correctly, it is recommended to use an HTTP server rather than opening the HTML files directly.

1. **Install http-server:** `npm i -g http-server`
2. **Navigate to the generated folder:** `cd ../generated`
3. **Start the server:** `npx http-server .`
4. Open the provided URL in your browser.

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

### Backlog & Future Features

- [ ] Moving to router
- [ ] Allow `.ts`/`.js` plugins from the `.mdgen` folder.
- [ ] Mobile version.
- [ ] Add Markdown YAML metadata support.
  - [ ] Enable page categories and tags for better/granular search
- [ ] Add sample `.mdgen` styles (ae. Fantasy DnD)
- [ ] Fill the examples
