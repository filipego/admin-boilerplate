import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.midjourney.com", "imagedelivery.net"],
  },
  typescript: {
    // Disable type checking during build (use local dev/typecheck CI instead)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
