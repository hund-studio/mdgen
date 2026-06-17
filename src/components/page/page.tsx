import { type ComponentProps, type FC } from "react";
import Link from "../../components/link/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Sidebar from "../../components/sidebar/sidebar";
import { pathContext } from "../../context/path";

const Page: FC<{
  db?: ComponentProps<typeof Sidebar>["db"];
  sidebar: ComponentProps<typeof Sidebar>["tree"];
  content: string;
  path?: string;
  search?: boolean;
  locale?: string | null;
  locales?: string[];
  translations?: Record<string, string | null>;
}> = ({ db, sidebar, content, path, search, locale, locales, translations }) => {
  path = path || window.location.pathname;

  return (
    <pathContext.Provider value={path}>
      <div id="page">
        <Sidebar
          path={path}
          db={db}
          tree={sidebar}
          search={search}
          locale={locale}
          locales={locales}
          translations={translations}
        />
        <main className="page-content" id="md">
          <div className="page-content-inner">
            <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: Link }}>
              {content}
            </ReactMarkdown>
          </div>
        </main>
      </div>
    </pathContext.Provider>
  );
};

export default Page;
