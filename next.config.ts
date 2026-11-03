import type { NextConfig } from "next";

const basePath = "/jadual-ustaz-alif";

const nextConfig: NextConfig = {
  output: "export",
  basePath,
  // basePath also prefixes Next's generated assets; no separate CDN is used.
  assetPrefix: basePath,
  trailingSlash: true,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
  devIndicators: false,
};

export default nextConfig;
