type BrowserConfig = {
  brand: null | { file: File; name: string };
  style: null | string;
  locales: string[];
  defaultLocale: string | null;
};

type FSConfig = {
  brand: null | { file: Buffer; name: string };
  style: null | string;
  locales: string[];
  defaultLocale: string | null;
};

/** Per-page runtime config injected into each generated HTML page. */
type MdgenRuntime = {
  publicUrl: string;
  locale: string | null;
  locales: string[];
  /** locale → root-relative `.html` href of the equivalent page, or null if missing. */
  translations: Record<string, string | null>;
};
