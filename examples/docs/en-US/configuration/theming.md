---
order: 20
label: Theming & styles
---

# Theming & custom styles

The look is driven by **design tokens** (`--mdgen-*`). To re-skin a site, drop a
`.mdgen/style.css`: it is injected **after** the default stylesheet, so
redefining a token wins by the cascade — no need to fight selectors.

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

## Common tokens

`--mdgen-color-body`, `--mdgen-color-surface`, `--mdgen-color-text`,
`--mdgen-color-dimmed`, `--mdgen-color-border`, `--mdgen-color-hover`,
`--mdgen-primary`, `--mdgen-primary-light`, `--mdgen-radius`,
`--mdgen-font-family`, …

## Light, dark and system

A built-in toggle cycles **light → dark → system**. The chosen scheme is applied
**before first paint** (no flash) and native UI follows via `color-scheme`.

In CSS you can target the themes like this:

- `@media (prefers-color-scheme: dark)` to follow the OS preference;
- `[data-schema="light"]` / `[data-schema="dark"]` for the user's explicit
  choice, which always takes precedence.
