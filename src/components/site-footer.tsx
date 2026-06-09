import Link from "next/link";
import { getContactLinks } from "@/lib/navigation";
import { site } from "@/lib/site";

export function SiteFooter() {
  const links = getContactLinks();

  return (
    <footer className="site-footer">
      <div className="site-footer-links">
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
      <a className="r-call site-footer-call" href={site.calendly} target="_blank" rel="noopener noreferrer">
        book a call
      </a>
      <p className="site-footer-colophon">{site.colophon}</p>
    </footer>
  );
}
