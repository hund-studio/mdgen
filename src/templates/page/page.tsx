import { type ComponentProps, type FC } from "react";
import Link from "../../components/link/link";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Sidebar from "../../components/sidebar/sidebar";

const Page: FC<{
  sidebar: ComponentProps<typeof Sidebar>["tree"];
  content: string;
  path?: string;
}> = ({ sidebar, content, path }) => {
  path = path || window.location.pathname;

  return (
    <div id="page">
      <Sidebar path={path} tree={sidebar} />
      <main className="page-content" id="md">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: Link }}>
          {content}
        </ReactMarkdown>
      </main>
    </div>
  );
};

export default Page;
