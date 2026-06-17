import { Highlight } from "@orama/highlight";
import { search } from "@orama/orama";
import { useEffect, useState, type FC } from "react";
import Link from "../link/link";

const highlighter = new Highlight();

const makeSearch = async (db: SearchDB, input: string) => {
  const results = await search(db, { term: input, includeVectors: true });
  const hits = results.hits.filter((entry) => !!entry.score);
  const hitsWithHighlight = hits.map((hit) => ({
    ...hit,
    highlights: highlighter.highlight(hit.document.content, input).positions,
  }));
  return { ...results, hits: hitsWithHighlight };
};

const SearchInput: FC<{
  db: SearchDB;
  onClose: VoidFunction;
}> = ({ onClose, db }) => {
  const [input, setInput] = useState("");
  const [results, setResults] = useState<Awaited<ReturnType<typeof makeSearch>>>();

  useEffect(() => {
    if (!db) return;

    (async () => {
      const results = await makeSearch(db, input);
      setResults(results);
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
                <Link
                  onClick={onClose}
                  href={entry.document.href}
                  className={"page-search-result"}
                  key={entry.id}
                >
                  <div className={"page-search-result-heading"}>{entry.document.title}</div>
                  <div className={"page-search-result-preview"}>
                    {(() => {
                      const content = entry.document.content;
                      const [firstMatch] = entry.highlights;
                      if (!firstMatch) return content;

                      let start = Math.max(0, firstMatch.start - 100);

                      const textBefore = content.substring(start, firstMatch.start);
                      const lastNewlineIndex = textBefore.lastIndexOf("\n");

                      if (lastNewlineIndex !== -1) start = start + lastNewlineIndex + 1;

                      const end = Math.min(content.length, firstMatch.end + 100);

                      const matchStart = firstMatch.start;
                      const matchEnd = firstMatch.end + 1;

                      const beforeMatch = content.substring(start, matchStart);
                      const matchedText = content.substring(matchStart, matchEnd);
                      const afterMatch = content.substring(matchEnd, end);

                      return (
                        <>
                          {start > 0 && lastNewlineIndex === -1 ? "..." : ""}
                          {beforeMatch}
                          <strong className="strong">{matchedText}</strong>
                          {afterMatch}
                          {end < content.length ? "..." : ""}
                        </>
                      );
                    })()}
                  </div>
                  <div className={"page-search-result-href"}>
                    {entry.document.href.replace("/index.html", "") || "/"}
                  </div>
                </Link>
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

  // The trigger is always rendered (server-side included) so the sidebar layout
  // stays stable; the overlay only opens once the index (db) has loaded.
  return (
    <div className={"page-search-trigger"}>
      <input
        type="search"
        placeholder="Search"
        className="text-input"
        onFocus={() => setOpen(true)}
      />
      {open && db ? <SearchInput db={db} onClose={() => setOpen(false)} /> : null}
    </div>
  );
};

export default Search;
