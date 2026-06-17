---
order: 1
label: Introduction
---

# Full documentation

> This file doubles as both the documentation of the **mdgen** tool and an example to preview the final output.

## Why mdgen

This tool was born because, too often, we write small internal tools that need documentation which is easy to browse and, ideally, easy to publish online.
Until recently we relied on solutions like Docusaurus or other frameworks to generate docs, but paid a high price in time spent on maintenance and upgrades.

Out of that need we came up with **mdgen**, a static HTML generator that works from any folder containing `.md` files.
To make it easy (and fast) to use even for non-technical people, we leveraged the browser's Filesystem API to build a tool that, once you pick the folder with your `.md` files, produces a zip containing the generated HTML files.

Of course, right after finishing the first version we realised we also needed a CLI tool to use directly, for instance from NPM scripts.

## How it works

The core idea is very simple (which is also why it is probably not the right tool for complex documentation): statically render the `.md` files with React after reading their content. Because of that, the tool does not require a strict structure to follow and can be organised quite freely (much like you would in tools such as Obsidian).

For more precise usage instructions, have a look at:

- [The guide for the web tool](./web.md)
- [The guide for the CLI tool](./cli.md)
