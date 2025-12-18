type DirectoryEntry = {
  name: string;
  slug: string;
  path: string;
  children: Tree[];
};

type PageEntry = {
  name: string;
  slug: string;
  href: string;
  content: string;
  title: string | null;
};

type AssetEntry = {
  name: string;
  slug: string;
  buffer: ArrayBuffer;
};

type Tree = DirectoryEntry | PageEntry | AssetEntry;
