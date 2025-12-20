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

type PageEntry = {
  name: string;
  slug: string;
  href: string;
  content: string;
  title: string | null;
};

type BrowerAssetEntry = {
  name: string;
  slug: string;
  buffer: ArrayBuffer;
};

type FSAssetEntry = {
  name: string;
  slug: string;
  buffer: NonSharedBuffer;
};

type BrowserTree = BrowserDirectoryEntry | PageEntry | BrowerAssetEntry;
type FSTree = FSDirectoryEntry | PageEntry | FSAssetEntry;
