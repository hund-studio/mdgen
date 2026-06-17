type BrowserConfig = {
  brand: null | { file: File; name: string };
  style: null | string;
  locales: string[];
  defaultLocale: string | null;
  search: boolean;
};

type FSConfig = {
  brand: null | { file: Buffer; name: string };
  style: null | string;
  locales: string[];
  defaultLocale: string | null;
  search: boolean;
};

/** Per-page runtime config injected into each generated HTML page. */
type MdgenRuntime = {
  publicUrl: string;
  /** Canonical root-relative href of this page (e.g. `/it-IT/guide/index.html`). */
  page: string;
  /** Whether the search index is available for this site. */
  search: boolean;
  locale: string | null;
  locales: string[];
  /** locale → root-relative `.html` href of the equivalent page, or null if missing. */
  translations: Record<string, string | null>;
};
