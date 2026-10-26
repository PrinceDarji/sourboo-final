import { PRODUCT_SLUG_ALIASES } from './src/lib/catalog/products';
import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  turbopack: { root: process.cwd() },
  async redirects() {
    return [
      { source: "/home", destination: "/", permanent: true },
      ...Object.entries(PRODUCT_SLUG_ALIASES).map(([alias, slug]) => ({
        source: `/product/${alias}`, destination: `/product/${slug}`, permanent: true,
      })),
    ];
  },
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
