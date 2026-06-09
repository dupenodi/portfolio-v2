import { site } from "@/lib/site";

export type NavItem = {
  index: string;
  label: string;
  href: string;
};

export const navItems: NavItem[] = [
  { index: "00", label: "index", href: "/" },
  { index: "01", label: "work", href: "/work" },
  { index: "02", label: "projects", href: "/projects" },
  { index: "03", label: "writing", href: "/writing" },
  { index: "04", label: "travel", href: "/travel" },
];

export type ContactLink = {
  label: string;
  href: string;
  external?: boolean;
  nativeApp?: boolean;
  appUrl?: string;
};

export function getContactLinks(): ContactLink[] {
  return [
    { label: "email", href: `mailto:${site.email}`, external: true },
    { label: "resume", href: site.resumeUrl, external: true },
    { label: "github", href: site.github, external: true },
    {
      label: "linkedin",
      href: site.linkedin,
      external: true,
      nativeApp: true,
      appUrl: site.linkedinApp,
    },
    { label: "x", href: site.twitterUrl, external: true },
    { label: "writing", href: site.writing.href },
  ];
}

export function navKeyForPath(pathname: string): string {
  if (pathname === "/") return "index";
  if (pathname.startsWith("/projects")) return "projects";
  if (pathname.startsWith("/writing")) return "writing";
  if (pathname === "/work") return "work";
  if (pathname === "/travel") return "travel";
  return "";
}
