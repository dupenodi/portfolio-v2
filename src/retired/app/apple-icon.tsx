import { ImageResponse } from "next/og";
import { getSiteImageDataUrl } from "@/lib/site-image";

export const runtime = "nodejs";
export const size = { width: 180, height: 180 };
export const contentType = "image/png";

export default async function AppleIcon() {
  const photoSrc = await getSiteImageDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: 180,
          height: 180,
          display: "flex",
          overflow: "hidden",
          background: "#0b0b09",
        }}
      >
        <img
          src={photoSrc}
          width={180}
          height={180}
          alt=""
          style={{ objectFit: "cover", objectPosition: "50% 20%" }}
        />
      </div>
    ),
    { ...size }
  );
}
