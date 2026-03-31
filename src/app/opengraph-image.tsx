import { ImageResponse } from "next/og";

export const runtime = "edge";
export const alt = "Sharath Donepudi — Full Stack AI Developer";
export const size = { width: 1200, height: 630 };
export const contentType = "image/png";

export default function OGImage() {
  return new ImageResponse(
    (
      <div
        style={{
          width: "100%",
          height: "100%",
          display: "flex",
          flexDirection: "column",
          justifyContent: "space-between",
          background: "#F8F6F2",
          padding: "80px",
          fontFamily: "Georgia, serif",
        }}
      >
        {/* Top */}
        <div style={{ display: "flex", alignItems: "center", gap: "10px" }}>
          <div style={{ width: 8, height: 8, borderRadius: "50%", background: "#4A7C6B" }} />
          <span style={{ fontSize: 16, color: "#78716C", letterSpacing: "0.1em", textTransform: "uppercase", fontFamily: "system-ui, sans-serif" }}>
            Available for opportunities
          </span>
        </div>

        {/* Middle */}
        <div style={{ display: "flex", flexDirection: "column", gap: "16px" }}>
          <div style={{ fontSize: 96, fontWeight: 900, fontStyle: "italic", color: "#1A1917", lineHeight: 0.9, letterSpacing: "-0.03em" }}>
            Sharath.
          </div>
          <div style={{ display: "flex", flexDirection: "column", gap: "6px", marginTop: "24px" }}>
            <span style={{ fontSize: 22, color: "#44403C", fontFamily: "system-ui, sans-serif" }}>Full Stack AI Developer</span>
            <span style={{ fontSize: 18, color: "#78716C", fontFamily: "system-ui, sans-serif" }}>
              Founding Engineer <span style={{ color: "#C05C42" }}>@ Niti AI</span> · Bengaluru
            </span>
          </div>
        </div>

        {/* Bottom */}
        <div style={{ display: "flex", justifyContent: "space-between", alignItems: "flex-end" }}>
          <span style={{ fontSize: 18, color: "#78716C", fontFamily: "system-ui, sans-serif" }}>dupenodi.dev</span>
          <div style={{ width: 48, height: 2, background: "#C05C42" }} />
        </div>
      </div>
    ),
    { ...size }
  );
}
