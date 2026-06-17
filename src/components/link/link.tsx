import { use, type FC, type JSX } from "react";
import { previewContext } from "../../context/preview";
import { pathContext } from "../../context/path";
import { Link as RouterLink } from "react-router-dom";

// Anything with a scheme (http:, mailto:, tel:), protocol-relative, or an
// in-page anchor is left untouched.
const EXTERNAL = /^([a-z][a-z0-9+.-]*:|\/\/|#)/i;

/**
 * Resolves a markdown href against the current page.
 *
 * Relative links (`./web.md`, `../cli.md`, `web.md`) resolve against the
 * current page's directory — which keeps the locale prefix in a multilingual
 * site. Root-relative links (`/x`) are left at the site root. Markdown
 * extensions are normalised to `.html`.
 */
const resolveHref = (raw: string, current: string) => {
  // Directory of the current page (its href always ends with a filename).
  const baseDir = current.replace(/^\/+/, "").replace(/[^/]*$/, "");
  const start = raw.startsWith("/") ? raw.replace(/^\/+/, "") : baseDir + raw.replace(/^\.\//, "");

  const stack: string[] = [];
  for (const segment of start.split("/")) {
    if (!segment || segment === ".") continue;
    if (segment === "..") stack.pop();
    else stack.push(segment);
  }

  return "/" + stack.join("/").replace(/\.[^/.]*$/, ".html");
};

const Link: FC<JSX.IntrinsicElements["a"] & { preview?: boolean }> = ({
  href,
  onClick,
  ...props
}) => {
  const preview = use(previewContext);
  const current = use(pathContext);

  if (!href || EXTERNAL.test(href)) {
    return <a {...props} href={href} onClick={onClick} />;
  }

  const resolved = resolveHref(href, current || "");

  if (!preview) {
    return <RouterLink {...props} onClick={onClick} to={resolved} />;
  }

  return (
    <a
      {...props}
      href={resolved}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        preview.setCurrent(resolved);
      }}
    />
  );
};

export default Link;
