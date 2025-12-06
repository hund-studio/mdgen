import { type ComponentProps, type FC } from "react";
import Link from "../../components/link/link";
import ReactMarkdown from "react-markdown";
import Sidebar from "../../components/sidebar/sidebar";

const Page: FC<{
  sidebar: ComponentProps<typeof Sidebar>["tree"];
  content: string;
}> = ({ sidebar, content }) => {
  return (
    <div id="page">
      <Sidebar tree={sidebar} />
      <main className="page-content">
        <ReactMarkdown components={{ a: Link }}>{content}</ReactMarkdown>
      </main>
    </div>
  );
};

export default Page;
