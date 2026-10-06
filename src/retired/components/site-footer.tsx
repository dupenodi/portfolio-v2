import Link from "next/link";
import { ContactAnchor } from "@/retired/components/contact-anchor";
import { getContactLinks } from "@/lib/navigation";
import { site } from "@/lib/site";

export function SiteFooter() {
  const links = getContactLinks();

  return (
    <footer className="site-footer">
      <div className="site-footer-links">
        {links.map((link) =>
          link.external ? (
            <ContactAnchor
              key={link.href}
              href={link.href}
              nativeApp={link.nativeApp}
              appUrl={link.appUrl}
            >
              {link.label}
            </ContactAnchor>
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
