import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  allowedDevOrigins: ["192.168.1.130"],
  poweredByHeader: false,
  compress: true,
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "res.cloudinary.com",
        pathname: "/**",
      },
      {
        protocol: "https",
        hostname: "buymeachai.ezee.li",
        pathname: "/assets/images/**",
      },
    ],
  },
  experimental: {
    optimizePackageImports: ["lucide-react"],
  },
  // The studio's models and textures: served from cache for a day, then from cache while revalidating for a week,
  // so a returning visitor's studio loads without a round trip per file.
  async headers() {
    return [
      {
        source: "/character/:path*",
        headers: [{ key: "Cache-Control", value: "public, max-age=86400, stale-while-revalidate=604800" }],
      },
    ];
  },
  async rewrites() {
    return [
      { source: "/admin", destination: "/admin/index.html" },
    ];
  },
};

export default nextConfig;
