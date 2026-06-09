"use client";

import Image from "next/image";
import Link from "next/link";
import { usePathname } from "next/navigation";
import { navItems, navKeyForPath } from "@/lib/navigation";
import { site } from "@/lib/site";
import { ContactLinks } from "@/components/contact-links";

export function SiteRail() {
  const pathname = usePathname();
  const activeKey = navKeyForPath(pathname);

  return (
    <aside className="rail">
      <Link href="/" className="r-id">
        <Image
          src={site.image}
          alt={site.imageAlt}
          width={56}
          height={56}
          className="r-avatar"
          priority
        />
        <div className="r-name">
          sharath
          <br />
          donepudi
        </div>
        <div className="r-loc">
          <span className="dot" aria-hidden />
          {site.location}
        </div>
      </Link>

      <nav className="rail-bar" aria-label="Site">
        <ul className="r-nav">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={activeKey === item.label ? "active" : undefined}
              >
                <span className="ix">{item.index}</span>
                {item.label}
              </Link>
            </li>
          ))}
        </ul>
      </nav>

      <p className="r-role">
        {site.railRole.prefix} <b>{site.railRole.company}</b>. {site.railRole.suffix}
      </p>

      <div className="r-spacer" />

      <div className="r-contact">
        <ContactLinks />
      </div>
    </aside>
  );
}
