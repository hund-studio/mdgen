export type Frontmatter = {
  /** Overrides the title derived from the first `# heading` line. */
  title?: string;
  /** Sidebar label; falls back to title, then to the file/folder name. */
  label?: string;
  /** Sort weight in the sidebar (ascending). Lower comes first. */
  order?: number;
  /** Hide from the sidebar navigation (the page is still generated). */
  hidden?: boolean;
};

const FENCE = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/;

const coerce = (raw: string): string | number | boolean => {
  const value = raw.trim().replace(/^["']|["']$/g, "");
  if (value === "true") return true;
  if (value === "false") return false;
  if (/^-?\d+(\.\d+)?$/.test(value)) return Number(value);
  return value;
};

/**
 * Minimal, dependency-free frontmatter parser.
 *
 * Supports a flat YAML subset (`key: value` scalars) which is all mdgen's
 * configuration needs. Kept dependency-free on purpose so the exact same code
 * runs in Node (CLI) and in the browser tool without bundling `Buffer`/`js-yaml`.
 */
export const parseFrontmatter = (raw: string): { data: Frontmatter; body: string } => {
  const match = raw.match(FENCE);
  if (!match) return { data: {}, body: raw };

  const data: Record<string, string | number | boolean> = {};

  for (const line of match[1].split(/\r?\n/)) {
    const trimmed = line.trim();
    if (!trimmed || trimmed.startsWith("#")) continue;

    const sep = trimmed.indexOf(":");
    if (sep === -1) continue;

    const key = trimmed.slice(0, sep).trim();
    if (!key) continue;

    data[key] = coerce(trimmed.slice(sep + 1));
  }

  return { data: data as Frontmatter, body: raw.slice(match[0].length) };
};

/**
 * Title derived from the first `# heading` (h1) of a markdown body. Tolerant of
 * blank lines left after a frontmatter block.
 */
export const extractTitle = (body: string): string | null => {
  const match = body.match(/^#\s+(.+?)\s*$/m);
  return match ? match[1].trim() : null;
};
