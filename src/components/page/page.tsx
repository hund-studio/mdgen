import { type ComponentProps, type FC } from "react";
import Link from "../../components/link/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Sidebar from "../../components/sidebar/sidebar";

const Page: FC<{
  db?: ComponentProps<typeof Sidebar>["db"];
  sidebar: ComponentProps<typeof Sidebar>["tree"];
  content: string;
  path?: string;
  locale?: string | null;
  locales?: string[];
  translations?: Record<string, string | null>;
}> = ({ db, sidebar, content, path, locale, locales, translations }) => {
  path = path || window.location.pathname;

  return (
    <div id="page">
      <Sidebar
        path={path}
        db={db}
        tree={sidebar}
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
  );
};

export default Page;
