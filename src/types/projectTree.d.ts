type DirectoryTree = {
  name: string;
  slug: string;
  path: string;
  children: PageRenderTree[];
};

type PageTree = {
  name: string;
  slug: string;
  href: string;
  content: string;
  title: string | null;
};

type AssetTree = {
  name: string;
  slug: string;
  buffer: ArrayBuffer;
};

type PageRenderTree = DirectoryTree | PageTree | AssetTree;
