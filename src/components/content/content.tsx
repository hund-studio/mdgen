import { type ComponentType, type FC, type ReactNode } from "react";
import ReactMarkdown from "react-markdown";
import remarkGfm from "remark-gfm";
import Link from "../link/link";

export type ComponentRegistry = Record<string, ComponentType<{ content: string }>>;

// <!-- Name --> ...body... <!-- !Name -->
//
// Both markers must sit on their own line (optionally indented). This keeps an
// inline `<!-- Name -->` written between backticks — e.g. while documenting the
// syntax — from being treated as a region. Fenced code blocks are excluded
// upstream by `splitFences`.
const MARKER =
  /^[ \t]*<!--\s*([A-Za-z][\w-]*)\s*-->[ \t]*\r?\n([\s\S]*?)\r?\n[ \t]*<!--\s*!\1\s*-->[ \t]*(?=\r?\n|$)/gm;

// Opening/closing of a CommonMark fenced code block (``` or ~~~, up to 3 leading spaces).
const FENCE_OPEN = /^ {0,3}(`{3,}|~{3,})/;
const FENCE_CLOSE = /^ {0,3}(`{3,}|~{3,})[ \t]*$/;

type Segment = { type: "code" | "text"; value: string };

/**
 * Splits markdown into `code` (fenced blocks) and `text` segments, preserving
 * the original characters exactly (line endings included). Component markers
 * inside a fenced block must stay literal, so only `text` segments are scanned
 * for `<!-- Name -->` regions.
 */
const splitFences = (content: string): Segment[] => {
  // Keep the trailing newline on each line so concatenation reconstructs the
  // input verbatim (handles both \n and \r\n).
  const lines = content.split(/(?<=\n)/);
  const segments: Segment[] = [];

  let buffer = "";
  let inCode = false;
  let fence = "";

  const flush = (type: Segment["type"]) => {
    if (buffer) segments.push({ type, value: buffer });
    buffer = "";
  };

  for (const raw of lines) {
    const line = raw.replace(/\r?\n$/, "");

    if (!inCode) {
      const open = line.match(FENCE_OPEN);
      if (open) {
        flush("text");
        inCode = true;
        fence = open[1];
      }
      buffer += raw;
    } else {
      buffer += raw;
      const close = line.match(FENCE_CLOSE);
      if (close && close[1][0] === fence[0] && close[1].length >= fence.length) {
        flush("code");
        inCode = false;
        fence = "";
      }
    }
  }

  flush(inCode ? "code" : "text");
  return segments;
};

const Markdown: FC<{ children: string }> = ({ children }) => (
  <ReactMarkdown remarkPlugins={[remarkGfm]} components={{ a: Link }}>
    {children}
  </ReactMarkdown>
);

/**
 * Renders markdown content, upgrading `<!-- Name -->…<!-- !Name -->` regions to
 * the matching registered React component (fed the region body). When no
 * component is registered for a marker, the body renders as plain markdown —
 * which is exactly the no-JS fallback. Markers inside fenced code blocks are
 * left untouched so they render as literal code.
 */
const Content: FC<{ content: string; components?: ComponentRegistry }> = ({
  content,
  components,
}) => {
  const parts: ReactNode[] = [];
  let key = 0;

  for (const segment of splitFences(content)) {
    if (segment.type === "code") {
      parts.push(<Markdown key={key++}>{segment.value}</Markdown>);
      continue;
    }

    let cursor = 0;
    let match: RegExpExecArray | null;

    MARKER.lastIndex = 0;
    while ((match = MARKER.exec(segment.value))) {
      const [full, name, body] = match;

      if (match.index > cursor) {
        parts.push(<Markdown key={key++}>{segment.value.slice(cursor, match.index)}</Markdown>);
      }

      const Component = components?.[name];
      if (Component) {
        parts.push(<Component key={key++} content={body} />);
      } else {
        parts.push(<Markdown key={key++}>{body}</Markdown>);
      }

      cursor = match.index + full.length;
    }

    if (cursor < segment.value.length) {
      parts.push(<Markdown key={key++}>{segment.value.slice(cursor)}</Markdown>);
    }
  }

  return <>{parts}</>;
};

export default Content;
