import { ScrollToTop } from "@/retired/components/scroll-to-top";
import { SiteFooter } from "@/retired/components/site-footer";
import { SiteRail } from "@/retired/components/site-rail";

export function SiteShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="shell">
      <ScrollToTop />
      <SiteRail />
      <div className="main">{children}</div>
      <SiteFooter />
    </div>
  );
}
