---
order: 20
label: Cartelle e sidebar
---

# Cartelle e sidebar

Le sottocartelle della sorgente diventano **sezioni** nella sidebar. Il loro
comportamento dipende dalla presenza o meno di una pagina indice.

## Cartella con `index.md`

Una cartella che contiene un `index.md` (o `readme.md`) diventa una voce
**cliccabile**: cliccando sull'etichetta si apre quella pagina e si espande la
sezione, mentre la **freccia** (caret) a destra espande/comprime la sezione
**senza** cambiare pagina. Etichetta e ordine della cartella vengono presi dal
frontmatter della pagina indice.

Questa sezione, **Scrivere i contenuti**, è proprio un esempio: ha un
[`index.md`](./index.md), quindi la voce è cliccabile.

## Cartella senza indice

Una cartella **senza** pagina indice è un semplice accordion: cliccando sulla
voce (o sul caret) si limita ad aprire/chiudere la sezione. L'etichetta, in
questo caso, deriva dal nome della cartella "abbellito"
(`per-iniziare` → "Per Iniziare").

## Etichette e nomi file

Per i siti multilingua mantieni **identici** i nomi di file e cartelle tra i
locale (traduci il _contenuto_, non i nomi): è così che mdgen associa le pagine
equivalenti tra le lingue. Vedi [Siti multilingua](../configuration/i18n.md).
