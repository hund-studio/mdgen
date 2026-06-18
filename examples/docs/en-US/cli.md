---
order: 20
label: CLI tool
---

# CLI tool

The CLI generates the same static site as the web tool, but in a fast and
scriptable way — ideal in NPM scripts or CI. It is also the only way to use the
features that need a build step: [multilingual sites](./configuration/i18n.md)
and [React components](./configuration/components.md).

## Quick start (no installation required)

```bash
npx @hund.studio/mdgen [options]
```

## Options

| Option               | Shorthand | Description                                      | Default     |
| :------------------- | :-------- | :----------------------------------------------- | :---------- |
| `--source <path>`    | `-s`      | The directory containing your markdown files     | `.`         |
| `--outDir <path>`    | `-o`      | Parent directory where the output will be saved  | `.`         |
| `--name <name>`      | `-n`      | The name of the output folder                    | `generated` |
| `--public-url <url>` | `-u`      | The base URL or path for the site (e.g. `/docs/`)| `/`         |
| `--watch`            | `-w`      | Watch for changes in the source directory        | `false`     |

**Example (in a package.json script):**

```jsonc
"generate:doc": "npx @hund.studio/mdgen -s ./docs -o ./dist-md -n docs -u /docs/"
```

## Serving the files

The output is a SPA-style static site: serve it over HTTP rather than opening
the files directly from the filesystem.

```bash
npx http-server ./dist-md/docs
```

When deploying under a sub-path (e.g. `/docs/`), build with the matching
`--public-url`.

> The very `<!-- ApiTester -->` you see below is a [React component](./configuration/components.md)
> rendered by the CLI; the Markdown table remains the fallback without JavaScript.

<!-- ApiTester -->

| Method | Description                 |
| :----- | :-------------------------- |
| POST   | Create new resource         |
| GET    | Get a resource              |
| PATCH  | Update an existing resource |
| PUT    | Upsert a resource           |

<!-- !ApiTester -->
