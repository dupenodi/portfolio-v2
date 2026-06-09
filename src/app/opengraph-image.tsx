import { ImageResponse } from "next/og";
import { getSiteImageDataUrl } from "@/lib/site-image";
import { site } from "@/lib/site";

export const runtime = "nodejs";
export const alt = site.imageAlt;
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default async function OGImage() {
  const photoSrc = await getSiteImageDataUrl();
  const role = `${site.railRole.prefix} ${site.railRole.company}`;

  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          background: "#0b0b09",
          fontFamily: "system-ui, sans-serif",
          color: "#f1f0e6",
        }}
      >
        <div
          style={{
            width: 380,
            height: "100%",
            display: "flex",
            alignItems: "center",
            justifyContent: "center",
            background: "#131310",
            borderRight: "1px solid #20201b",
          }}
        >
          <img src={photoSrc} width={260} height={338} alt="" />
        </div>
        <div
          style={{
            flex: 1,
            display: "flex",
            flexDirection: "column",
            justifyContent: "space-between",
            padding: "72px 80px",
          }}
        >
          <div style={{ fontSize: 18, color: "#c2f24a", letterSpacing: "0.06em" }}>
            {site.name.toLowerCase()}
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: 16 }}>
            <div
              style={{
                fontSize: 48,
                fontWeight: 500,
                letterSpacing: "-0.03em",
                lineHeight: 1.12,
                maxWidth: 680,
              }}
            >
              {site.heroHeadline}
            </div>
            <div style={{ fontSize: 22, color: "#6c6b5e" }}>{role}</div>
          </div>
          <div style={{ fontSize: 20, color: "#6c6b5e" }}>
            {site.url.replace("https://", "")}
          </div>
        </div>
      </div>
    ),
    { ...size }
  );
}
