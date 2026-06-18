---
order: 1
label: Introduzione
---

# Documentazione di mdgen

> Questo progetto è al tempo stesso la **documentazione ufficiale** di mdgen e un **esempio** scaricabile per vedere com'è fatto l'output finale. Aprilo nello strumento web o generalo con la CLI per esplorarlo.

## Cos'è mdgen

**mdgen** trasforma una cartella di file Markdown (`.md`) in un sito di
documentazione **HTML statico**. Funziona in due modi:

- **interamente nel browser** (serverless, tramite le Filesystem API: i tuoi file
  non lasciano mai il tuo computer);
- come **CLI**, per build veloci e scriptabili (per esempio negli script di NPM).

## Perché esiste

Troppo spesso scriviamo piccoli tool interni che hanno bisogno di una
documentazione facile da consultare e, all'occorrenza, pubblicabile online.
Fino a poco tempo fa usavamo soluzioni come Docusaurus o altri framework,
pagando però un costo elevato in tempo di manutenzione e aggiornamento.

Da questa necessità è nato **mdgen**: un generatore di HTML statico a partire da
una qualunque cartella di file `.md`. Per renderlo utilizzabile (e rapido) anche
da persone non tecniche abbiamo sfruttato le Filesystem API del browser: una
volta selezionata la cartella, lo strumento produce uno zip con i file HTML
generati. Subito dopo la prima versione è arrivata anche la CLI, da usare
direttamente negli script.

## Come funziona

L'idea di base è volutamente semplice (motivo per cui probabilmente non è lo
strumento giusto per documentazioni molto complesse): leggere i file `.md` e
renderizzarli staticamente con React. Per questo mdgen non impone una struttura
rigida e può essere organizzato molto liberamente, un po' come faresti in
strumenti tipo Obsidian.

## Da dove iniziare

- [Strumento web](./web.md) — generare senza installare nulla.
- [Strumento CLI](./cli.md) — build veloci e scriptabili.
- [Scrivere i contenuti](./authoring/index.md) — frontmatter, cartelle e sidebar.
- [Configurazione](./configuration/index.md) — la cartella `.mdgen`, i18n, temi, componenti.
- [Stato e roadmap](./roadmap.md) — cosa c'è e cosa arriverà.

## Caratteristiche principali

- **Serverless e sicuro**: nel browser nessun dato lascia il dispositivo.
- **Frontmatter**: ordina, rinomina e nascondi le voci con poche righe.
- **Multilingua (i18n)**: cartelle per locale, sidebar/ricerca per lingua e
  selettore di lingua integrato.
- **Ricerca fuzzy**: indice integrato basato su [Orama](https://oramasearch.com/)
  (disattivabile).
- **Temi**: design token ispirati a Mantine, toggle chiaro/scuro/sistema,
  sovrascrivibili da un singolo file CSS.
- **Componenti React**: componenti interattivi nella pagina, con il Markdown che
  resta come fallback.
- **Supporto Markdown**: GFM (tabelle, checkbox, …).
- **Fallback intelligente**: rileva `index.md`, altrimenti ripiega su `readme.md`.
