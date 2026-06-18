---
order: 20
label: Temi e stili
---

# Temi e stili personalizzati

L'aspetto è guidato da **design token** (`--mdgen-*`). Per ri-vestire un sito
basta un file `.mdgen/style.css`: viene iniettato **dopo** il foglio di stile di
default, quindi ridefinire un token vince per cascata — senza dover combattere
con i selettori.

```css
/* .mdgen/style.css */
:root {
  --mdgen-primary: #e64980;
  --mdgen-radius: 12px;
}
[data-schema="dark"] {
  --mdgen-color-body: #101113;
}
```

## Token più comuni

`--mdgen-color-body`, `--mdgen-color-surface`, `--mdgen-color-text`,
`--mdgen-color-dimmed`, `--mdgen-color-border`, `--mdgen-color-hover`,
`--mdgen-primary`, `--mdgen-primary-light`, `--mdgen-radius`,
`--mdgen-font-family`, …

## Chiaro, scuro e sistema

Un toggle integrato cicla tra **chiaro → scuro → sistema**. Lo schema scelto
viene applicato **prima del primo paint** (niente flash) e l'UI nativa lo segue
tramite `color-scheme`.

Nel CSS puoi distinguere i temi così:

- `@media (prefers-color-scheme: dark)` per seguire la preferenza del sistema;
- `[data-schema="light"]` / `[data-schema="dark"]` per la scelta esplicita
  dell'utente, che ha sempre la precedenza.
