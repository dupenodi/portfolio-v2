import { ScrollToTop } from "@/components/scroll-to-top";
import { SiteFooter } from "@/components/site-footer";
import { SiteRail } from "@/components/site-rail";

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
