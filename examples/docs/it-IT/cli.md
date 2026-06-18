---
order: 20
label: Strumento CLI
---

# Strumento CLI

La CLI genera lo stesso sito statico dello strumento web, ma in modo veloce e
scriptabile — ideale negli script di NPM o in CI. È anche l'unico modo per usare
le funzionalità che richiedono un passo di build: [siti multilingua](./configuration/i18n.md)
e [componenti React](./configuration/components.md).

## Avvio rapido (senza installazione)

```bash
npx @hund.studio/mdgen [opzioni]
```

## Opzioni

| Opzione              | Scorciatoia | Descrizione                                           | Default     |
| :------------------- | :---------- | :---------------------------------------------------- | :---------- |
| `--source <path>`    | `-s`        | La cartella che contiene i file Markdown              | `.`         |
| `--outDir <path>`    | `-o`        | Cartella padre in cui salvare l'output                | `.`         |
| `--name <name>`      | `-n`        | Nome della cartella di output                         | `generated` |
| `--public-url <url>` | `-u`        | URL o path base del sito (es. `/docs/`)               | `/`         |
| `--watch`            | `-w`        | Rigenera ad ogni modifica nella cartella sorgente     | `false`     |

**Esempio (in uno script di package.json):**

```jsonc
"generate:doc": "npx @hund.studio/mdgen -s ./docs -o ./dist-md -n docs -u /docs/"
```

## Servire i file

L'output è un sito statico in stile SPA: servilo via HTTP, non aprire i file
direttamente dal filesystem.

```bash
npx http-server ./dist-md/docs
```

Quando pubblichi il sito sotto un sotto-path (es. `/docs/`), genera con lo stesso
valore di `--public-url`.

> Lo stesso `<!-- ApiTester -->` che vedi qui sotto è un [componente React](./configuration/components.md)
> renderizzato dalla CLI; la tabella Markdown resta come fallback senza JavaScript.

<!-- ApiTester -->

| Method | Description                 |
| :----- | :-------------------------- |
| POST   | Create new resource         |
| GET    | Get a resource              |
| PATCH  | Update an existing resource |
| PUT    | Upsert a resource           |

<!-- !ApiTester -->
