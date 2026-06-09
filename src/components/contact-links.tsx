import Link from "next/link";
import { getContactLinks } from "@/lib/navigation";
import { site } from "@/lib/site";

export function ContactLinks() {
  const links = getContactLinks();

  return (
    <>
      <div className="r-links">
        {links.map((link) =>
          link.external ? (
            <a key={link.href} href={link.href} target="_blank" rel="noopener noreferrer">
              {link.label}
            </a>
          ) : (
            <Link key={link.href} href={link.href}>
              {link.label}
            </Link>
          )
        )}
      </div>
      <a className="r-call" href={site.calendly} target="_blank" rel="noopener noreferrer">
        book a call
      </a>
    </>
  );
}
