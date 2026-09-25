import { MDXRemote } from "next-mdx-remote/rsc";
import Link from "next/link";
import type { MDXComponents } from "mdx/types";

function CustomLink({
  href,
  children,
  ...props
}: React.AnchorHTMLAttributes<HTMLAnchorElement>) {
  if (href?.startsWith("/")) {
    return (
      <Link href={href} {...props}>
        {children}
      </Link>
    );
  }
  if (href?.startsWith("#")) {
    return <a href={href} {...props}>{children}</a>;
  }
  return (
    <a href={href} target="_blank" rel="noopener noreferrer" {...props}>
      {children}
    </a>
  );
}

const components: MDXComponents = {
  a: CustomLink,
};

export function MDX(props: React.ComponentProps<typeof MDXRemote>) {
  return (
    <MDXRemote
      {...props}
      components={{ ...components, ...(props.components ?? {}) }}
      options={{
        ...props.options,
        blockJS: props.options?.blockJS ?? false,
        blockDangerousJS: props.options?.blockDangerousJS ?? true,
      }}
    />
  );
}
