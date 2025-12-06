import type { FC } from "react";
import Link from "../link/link";

export type DirectoryTree = { name: string; children: SidebarTree[] };
export type PageTree = { name: string; href: string };
export type AssetTree = { name: string };
type SidebarTree = DirectoryTree | PageTree | AssetTree;

const PageEntry: FC<{ tree: PageTree }> = ({ tree }) => {
  return (
    <li>
      <Link href={tree.href}>{tree.name}</Link>
    </li>
  );
};

const AssetEntry: FC<{ tree: AssetTree }> = ({ tree }) => {
  return (
    <li>
      <span>{tree.name}</span>
    </li>
  );
};

const DirectoryEntry: FC<{ tree: DirectoryTree }> = ({ tree }) => {
  return (
    <details>
      <summary>{tree.name}</summary>
      <ul>
        <Entries tree={tree} />
      </ul>
    </details>
  );
};

const Entries: FC<{ tree: DirectoryTree }> = ({ tree }) => {
  return tree.children.map((entry, index) => {
    if ("children" in entry) return <DirectoryEntry tree={entry} key={index} />;
    if (!("href" in entry)) return <AssetEntry tree={entry} key={index} />;
    return <PageEntry tree={entry} key={index} />;
  });
};

const Sidebar: FC<{ tree: DirectoryTree }> = ({ tree }) => {
  if (!tree.children.length) return;

  return (
    <aside className="page-aside">
      <nav>
        <ul>
          <Entries tree={tree} />
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
