import { ImageResponse } from "next/og";
import { site } from "@/lib/site";

export const runtime = "edge";
export const alt = site.description;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  const role = `${site.railRole.prefix} ${site.railRole.company}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#0b0b09",
          padding: 80,
          fontFamily: "system-ui, sans-serif",
          color: "#f1f0e6",
        }}
      >
        <div />
        <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
          <div style={{ fontSize: 52, fontWeight: 500, letterSpacing: "-0.03em", lineHeight: 1.1 }}>
            {site.heroHeadline}
          </div>
          <div style={{ fontSize: 22, color: "#6c6b5e" }}>{role}</div>
        </div>
        <div style={{ fontSize: 20, color: "#c2f24a" }}>{site.url.replace("https://", "")}</div>
      </div>
    ),
    { ...size }
  );
}
