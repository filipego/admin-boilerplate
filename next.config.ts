import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    domains: ["cdn.midjourney.com", "imagedelivery.net"],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if
    // your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // Disable type checking during build (use local dev/typecheck CI instead)
    ignoreBuildErrors: true,
  },
};

export default nextConfig;
