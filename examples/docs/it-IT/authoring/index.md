---
order: 30
label: Scrivere i contenuti
---

# Scrivere i contenuti

mdgen non impone una struttura rigida: scrivi i tuoi file `.md` e organizzali in
cartelle come preferisci. Due meccanismi controllano come appaiono nel sito:

- il **frontmatter** di ogni pagina (ordine, etichetta, visibilità);
- le **cartelle**, che diventano sezioni nella sidebar.

Pagine di questa sezione:

- [Frontmatter](./frontmatter.md)
- [Cartelle e sidebar](./folders-and-sidebar.md)

## Fallback intelligente

Per la pagina indice di una cartella mdgen cerca prima `index.md` e, in mancanza,
ripiega su `readme.md`. Così un repository già dotato di `readme.md` funziona
senza modifiche.
