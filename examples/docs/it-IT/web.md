---
order: 10
label: Strumento web
---

# Strumento web

Il modo più rapido per iniziare, senza installare nulla.

1. Vai su [mdgen.hund.studio](https://mdgen.hund.studio).
2. Premi **Pick a directory** e seleziona la **cartella** (non un singolo file)
   che contiene la tua documentazione Markdown.
3. Usa **Open preview** per sfogliare il risultato, poi **Download HTML** per
   scaricare lo zip con il sito statico generato.

Lo strumento web gira **interamente nel tuo browser** grazie alle Filesystem
API: i file non vengono mai caricati su un server. Mentre la cartella è aperta,
mdgen ne osserva le modifiche e rigenera l'anteprima automaticamente.

## Requisiti del browser

Le Filesystem API (`showDirectoryPicker`) sono richieste per selezionare la
cartella. Sono disponibili sui browser basati su Chromium (Chrome, Edge, …); su
browser che non le supportano usa la [CLI](./cli.md).

## Cosa copre lo strumento web

Lo strumento web copre la generazione di un **sito singolo**, con frontmatter e
stili personalizzati. Le funzionalità che richiedono un passo di build —
**siti multilingua** e **componenti React** — sono disponibili solo via
[CLI](./cli.md).

> Per i dettagli su come organizzare e configurare i contenuti vedi
> [Scrivere i contenuti](./authoring/index.md) e [Configurazione](./configuration/index.md).
