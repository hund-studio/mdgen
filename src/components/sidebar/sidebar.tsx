import { motion } from "motion/react";
import { search } from "@orama/orama";
import { useEffect, useState, type FC } from "react";
import Link from "../link/link";
import type { SearchDB } from "../../App";

export type DirectoryTree = { name: string; path: string; children: SidebarTree[] };
export type PageTree = { name: string; href: string; title: string | null };
export type AssetTree = { name: string };
type SidebarTree = DirectoryTree | PageTree | AssetTree;

const PageEntry: FC<{ tree: PageTree; path: string }> = ({ tree, path }) => {
  const normalizedPath = decodeURIComponent(path.replace(/\/$/, "").replace(/^\//, ""));
  const treeHref = tree.href ? decodeURIComponent(tree.href) : null;

  let activeClass = "";

  if (treeHref) {
    if (normalizedPath === treeHref) {
      activeClass = "active";
    }
  }

  return (
    <li>
      <Link className={activeClass} href={tree.href}>
        {tree.title || tree.name}
      </Link>
    </li>
  );
};

const AssetEntry: FC<{ tree: AssetTree; path: string }> = ({ tree }) => {
  return (
    <li>
      <span>{tree.name}</span>
    </li>
  );
};

const DirectoryEntry: FC<{ tree: DirectoryTree; path: string }> = ({ tree, path }) => {
  const normalizedPath = decodeURIComponent(path.replace(/\/$/, "").replace(/^\//, ""));
  const isActiveOrContainsActive = normalizedPath.startsWith(tree.path);

  const [open, setOpen] = useState(isActiveOrContainsActive);

  return (
    <li className="dropdown">
      <div className="dropdown-label" onClick={() => setOpen((prev) => !prev)}>
        {tree.name}
        <motion.div
          initial={!isActiveOrContainsActive ? { rotate: 180 } : { rotate: 0 }}
          animate={open ? { rotate: 0 } : { rotate: 180 }}
          className="dropdown-label-caret"
        />
      </div>
      <motion.div
        className="dropdown-content"
        initial={!isActiveOrContainsActive ? { height: 0 } : { height: "auto" }}
        animate={open ? { height: "auto" } : { height: 0 }}
      >
        <ul>
          <Entries path={path} tree={tree} />
        </ul>
      </motion.div>
    </li>
  );
};

const Entries: FC<{ tree: DirectoryTree; path: string }> = ({ tree, path }) => {
  return tree.children.map((entry, index) => {
    if ("children" in entry) return <DirectoryEntry path={path} tree={entry} key={index} />;
    if (!("href" in entry)) return <AssetEntry path={path} tree={entry} key={index} />;
    return <PageEntry path={path} tree={entry} key={index} />;
  });
};

const Sidebar: FC<{ db?: SearchDB; tree: DirectoryTree; path: string }> = ({ db, tree, path }) => {
  const [searchInput, setSearchInput] = useState("");

  if (!tree.children.length) return;

  useEffect(() => {
    if (!db) return;
    console.log(search(db, { term: searchInput }));
  }, [searchInput]);

  return (
    <aside className="page-aside">
      <div>
        <input type="search" onChange={({ target: { value } }) => setSearchInput(value)} />
      </div>
      <nav>
        <ul>
          <Entries path={path} tree={tree} />
        </ul>
      </nav>
    </aside>
  );
};

export default Sidebar;
