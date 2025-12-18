import { search, type InternalTypedDocument, type Results } from "@orama/orama";
import { useEffect, useState, type FC } from "react";
import type { SearchDB } from "../../App";

const SearchInput: FC<{
  db: SearchDB;
  onClose: VoidFunction;
}> = ({ onClose, db }) => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<
    Results<
      InternalTypedDocument<{
        title: string;
        content: string;
        href: string;
      }>
    >
  >();

  useEffect(() => {
    if (!db) return;

    (async () => {
      const results = await search(db, { term: input });
      const hits = results.hits.filter((entry) => !!entry.score);
      setResults({ ...results, hits });
    })();
  }, [input]);

  return (
    <div className={"page-search-wrapper"} onClick={onClose}>
      <div
        className={"page-search-input"}
        onClick={(event) => {
          event.stopPropagation();
        }}
      >
        <input
          className="text-input"
          autoFocus
          type="search"
          value={input}
          onChange={({ target: { value } }) => setInput(value)}
          placeholder="Type to search"
        />
        {(() => {
          if (!results?.hits.length) return;
          return (
            <div className={"page-search-results"}>
              {results.hits.map((entry) => (
                <div key={entry.id}>{entry.document.title}</div>
              ))}
            </div>
          );
        })()}
      </div>
    </div>
  );
};

const Search: FC<{ db?: SearchDB }> = ({ db }) => {
  const [open, setOpen] = useState(false);

  if (!db) return;

  return (
    <div className={"page-search-trigger"}>
      <input
        type="search"
        placeholder="Search"
        className="text-input"
        onFocus={() => setOpen(true)}
      />
      {(() => {
        if (!open) return;
        return <SearchInput db={db} onClose={() => setOpen(false)} />;
      })()}
    </div>
  );
};

export default Search;
