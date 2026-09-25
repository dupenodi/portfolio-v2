import Link from "next/link";
import { BuyMeAChai } from "@/retired/components/buy-me-a-chai";
import { ContactAnchor } from "@/retired/components/contact-anchor";
import { getContactLinks } from "@/lib/navigation";
import { site } from "@/lib/site";

export function ContactLinks() {
  const links = getContactLinks();

  return (
    <>
      <div className="r-links">
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
      <a className="r-call" href={site.calendly} target="_blank" rel="noopener noreferrer">
        book a call
      </a>
      <BuyMeAChai />
    </>
  );
}
