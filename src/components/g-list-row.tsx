import Link from "next/link";

type GListRowProps = {
  href: string;
  index: string;
  title: string;
  meta?: string;
  external?: boolean;
};

export function GListRow({ href, index, title, meta, external }: GListRowProps) {
  const content = (
    <>
      <span className="g-ix">{index}</span>
      <div className="c-text">
        <div className="c-name">{title}</div>
        {meta ? <div className="c-meta">{meta}</div> : null}
      </div>
      {external ? <span className="c-arr">↗</span> : null}
    </>
  );

  if (external) {
    return (
      <a
        href={href}
        className="grow crow"
        target="_blank"
        rel="noopener noreferrer"
      >
        {content}
      </a>
    );
  }

  return (
    <Link href={href} className="grow crow">
      {content}
    </Link>
  );
}
