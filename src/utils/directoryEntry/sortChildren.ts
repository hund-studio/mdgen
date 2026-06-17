type SortableEntry = {
  name: string;
  label?: string;
  order?: number;
  children?: unknown[];
};

const labelOf = (entry: SortableEntry) => (entry.label || entry.name).toLowerCase();

/**
 * Orders sidebar siblings.
 *
 * 1. Explicit `order` (frontmatter) wins, ascending. Entries without an order
 *    sink below those with one.
 * 2. As a tiebreaker, pages come before folders (the historical default).
 * 3. Finally, alphabetical by label/name.
 *
 * Mutates and returns the array, mirroring `Array.prototype.sort`.
 */
const sortChildren = <T extends SortableEntry>(children: T[]): T[] => {
  return children.sort((a, b) => {
    const orderA = a.order ?? Infinity;
    const orderB = b.order ?? Infinity;
    if (orderA !== orderB) return orderA - orderB;

    const isADir = Array.isArray(a.children);
    const isBDir = Array.isArray(b.children);
    if (isADir !== isBDir) return isADir ? 1 : -1;

    return labelOf(a).localeCompare(labelOf(b));
  });
};

export default sortChildren;
