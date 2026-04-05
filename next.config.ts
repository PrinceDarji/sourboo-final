import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    qualities: [72, 74, 75, 76, 78, 80, 82],
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.sanity.io",
      },
    ],
  },
};

export default nextConfig;
