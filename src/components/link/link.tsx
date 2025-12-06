import { use, type FC, type JSX } from "react";
import { previewContext } from "../../context/preview";

const Link: FC<JSX.IntrinsicElements["a"] & { preview?: boolean }> = ({
  href,
  onClick,
  ...props
}) => {
  const context = use(previewContext);
  if (href)
    href = `/${href
      .replace(/^[/]+|[/]+$/g, "")
      .replace(/^\.\//, "")
      .replace(/\.[^/.]+$/, ".html")}`;

  if (!context) {
    return <a {...props} href={href} />;
  }

  return (
    <a
      {...props}
      href={href}
      onClick={(event) => {
        event.preventDefault();
        onClick?.(event);
        if (href) context.setCurrent(href);
      }}
    />
  );
};

export default Link;
