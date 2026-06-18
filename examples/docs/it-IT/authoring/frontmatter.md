---
order: 10
label: Frontmatter
---

# Frontmatter

Ogni pagina può iniziare con un blocco di frontmatter. Tutti i campi sono
opzionali:

```markdown
---
title: Per iniziare      # sovrascrive il titolo derivato dall'H1
label: Quickstart        # etichetta in sidebar (default: title, poi nome file)
order: 10                # peso di ordinamento (crescente; se assente va in fondo)
hidden: false            # nasconde dalla sidebar (la pagina viene comunque generata)
---

# Per iniziare
```

## Campi

- **`title`** — sovrascrive il titolo derivato dall'`# H1` della pagina.
- **`label`** — il testo mostrato nella sidebar. In mancanza usa il titolo e, in
  ultima istanza, il nome del file.
- **`order`** — peso di ordinamento crescente. Le voci senza `order` finiscono in
  fondo.
- **`hidden`** — se `true`, la pagina non compare nella sidebar ma viene
  comunque generata (utile per pagine raggiungibili solo via link diretto).

## Ordinamento

L'ordine nella sidebar segue questa priorità: prima per `order`, poi le pagine
prima delle cartelle, infine in ordine alfabetico per etichetta.

Questa stessa pagina ha `order: 10`, mentre [Cartelle e sidebar](./folders-and-sidebar.md)
ha `order: 20`: per questo appare prima.
