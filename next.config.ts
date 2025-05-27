import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use export for production builds
  ...(process.env.NODE_ENV === 'production' ? { output: 'export' } : {}),
  basePath: process.env.NODE_ENV === 'production' ? '/moodboard-app' : '',
  images: {
    unoptimized: true,
  },
  trailingSlash: true
};

export default nextConfig;
