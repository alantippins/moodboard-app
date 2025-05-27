import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Only use export for production builds
  ...(process.env.NODE_ENV === 'production' ? { 
    output: 'export',
    images: {
      unoptimized: true,
    }
  } : {}),
  basePath: process.env.NODE_ENV === 'production' ? '/moodboard-app' : '',
  trailingSlash: true,
  // Skip generating 404 page for static export
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true
};

export default nextConfig;
