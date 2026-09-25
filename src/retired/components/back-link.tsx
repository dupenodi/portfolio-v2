import Link from "next/link";

type BackLinkProps = {
  href: string;
  children: React.ReactNode;
};

export function BackLink({ href, children }: BackLinkProps) {
  return (
    <Link href={href} className="back">
      <span className="a">←</span> {children}
    </Link>
  );
}
