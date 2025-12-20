type BrowserDirectoryEntry = {
  name: string;
  slug: string;
  path: string;
  children: BrowserTree[];
};

type FSDirectoryEntry = {
  name: string;
  slug: string;
  path: string;
  children: FSTree[];
};

type BrowserAssetEntry = {
  name: string;
  slug: string;
  buffer: ArrayBuffer;
};

type FSAssetEntry = {
  name: string;
  slug: string;
  buffer: NonSharedBuffer;
};

type PageEntry = {
  name: string;
  slug: string;
  href: string;
  content: string;
  title: string | null;
};

type BrowserTree = BrowserDirectoryEntry | PageEntry | BrowserAssetEntry;
type FSTree = FSDirectoryEntry | PageEntry | FSAssetEntry;
