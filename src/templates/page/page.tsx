import { type ComponentProps, type FC } from "react";
import Link from "../../components/link/link";
import ReactMarkdown from "react-markdown";
import Sidebar from "../../components/sidebar/sidebar";
import remarkGfm from "remark-gfm";

const Page: FC<{
  sidebar: ComponentProps<typeof Sidebar>["tree"];
  content: string;
}> = ({ sidebar, content }) => {
  return (
    <div id="page">
      <Sidebar tree={sidebar} />
      <main className="page-content" id="md">
        <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: Link }}>
          {content}
        </ReactMarkdown>
      </main>
    </div>
  );
};

export default Page;
