import { type ComponentType, type FC, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "../link/link";

export type ComponentRegistry = Record<string, ComponentType<{ content: string }>>;

// <!-- Name --> ...body... <!-- !Name -->
const MARKER = /<!--\s*([A-Za-z][\w-]*)\s*-->\r?\n?([\s\S]*?)\r?\n?<!--\s*!\1\s*-->/g;

const Markdown: FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: Link }}>
    {children}
  </ReactMarkdown>
);

/**
 * Renders markdown content, upgrading `<!-- Name -->…<!-- !Name -->` regions to
 * the matching registered React component (fed the region body). When no
 * component is registered for a marker, the body renders as plain markdown —
 * which is exactly the no-JS fallback.
 */
const Content: FC<{ content: string; components?: ComponentRegistry }> = ({
  content,
  components,
}) => {
  const parts: ReactNode[] = [];
  let cursor = 0;
  let key = 0;
  let match: RegExpExecArray | null;

  MARKER.lastIndex = 0;
  while ((match = MARKER.exec(content))) {
    const [full, name, body] = match;

    if (match.index > cursor) {
      parts.push(<Markdown key={key++}>{content.slice(cursor, match.index)}</Markdown>);
    }

    const Component = components?.[name];
    if (Component) {
      parts.push(<Component key={key++} content={body} />);
    } else {
      parts.push(<Markdown key={key++}>{body}</Markdown>);
    }

    cursor = match.index + full.length;
  }

  if (cursor < content.length) {
    parts.push(<Markdown key={key++}>{content.slice(cursor)}</Markdown>);
  }

  return <>{parts}</>;
};

export default Content;
