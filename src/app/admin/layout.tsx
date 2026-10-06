import type { Metadata } from "next";
import { geist } from "@/lib/fonts";
import "./admin.css";

export const metadata: Metadata = {
  title: "admin — dupenodi",
  robots: { index: false, follow: false },
};

export default function AdminRoot({ children }: { children: React.ReactNode }) {
  return <div className={`${geist.className} admin`}>{children}</div>;
}
