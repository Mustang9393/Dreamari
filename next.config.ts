import type { NextConfig } from "next";
import path from "path";

const nextConfig: NextConfig = {
  turbopack: {
    root: path.resolve(__dirname),
  },
  // Campus photos for the full college dataset (src/components/colleges/
  // dataset.ts) are served from the live app's CDN.
  images: {
    remotePatterns: [{ protocol: "https", hostname: "cdn.dreamonna.com", pathname: "/media/**" }],
  },
};

export default nextConfig;
