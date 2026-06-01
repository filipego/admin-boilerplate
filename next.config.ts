import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: "https",
        hostname: "cdn.midjourney.com",
      },
      {
        protocol: "https",
        hostname: "imagedelivery.net",
      },
    ],
  },
  typescript: {
    // Disable type checking during build (use local dev/typecheck CI instead)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
