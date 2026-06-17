type BrowserDirectoryEntry = {
  name: string;
  slug: string;
  path: string;
  label?: string;
  order?: number;
  hidden?: boolean;
  children: BrowserTree[];
};

type FSDirectoryEntry = {
  name: string;
  slug: string;
  path: string;
  label?: string;
  order?: number;
  hidden?: boolean;
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
  label?: string;
  order?: number;
  hidden?: boolean;
};

type BrowserTree = BrowserDirectoryEntry | PageEntry | BrowserAssetEntry;
type FSTree = FSDirectoryEntry | PageEntry | FSAssetEntry;
