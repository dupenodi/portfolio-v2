import { ImageResponse } from "next/og";
import { getSiteImageDataUrl } from "@/lib/site-image";

export const runtime = "nodejs";
export const size = { width: 32, height: 32 };
export const contentType = "image/png";

export default async function Icon() {
  const photoSrc = await getSiteImageDataUrl();

  return new ImageResponse(
    (
      <div
        style={{
          width: 32,
          height: 32,
          display: "flex",
          overflow: "hidden",
          background: "#0b0b09",
        }}
      >
        <img
          src={photoSrc}
          width={32}
          height={32}
          alt=""
          style={{ objectFit: "cover", objectPosition: "50% 20%" }}
        />
      </div>
    ),
    { ...size }
  );
}
