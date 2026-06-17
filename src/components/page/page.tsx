import { type ComponentProps, type FC } from "react";
import Sidebar from "../../components/sidebar/sidebar";
import Content, { type ComponentRegistry } from "../../components/content/content";
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
  components?: ComponentRegistry;
}> = ({ db, sidebar, content, path, search, locale, locales, translations, components }) => {
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
            <Content content={content} components={components} />
          </div>
        </main>
      </div>
    </pathContext.Provider>
  );
};

export default Page;
