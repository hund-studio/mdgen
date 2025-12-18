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
}> = ({ db, sidebar, content, path }) => {
  path = path || window.location.pathname;

  return (
    <div id="page">
      <Sidebar path={path} db={db} tree={sidebar} />
      <main className="page-content" id="md">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: Link }}>
          {content}
        </ReactMarkdown>
      </main>
    </div>
  );
};

export default Page;
