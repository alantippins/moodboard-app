import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Always use export for production builds
  ...(process.env.NODE_ENV === 'production' ? { 
    output: 'export',
    images: {
      unoptimized: true,
    },
    // For GitHub Pages deployment
    assetPrefix: '/moodboard-app',
  } : {}),
  // Base path for all environments
  basePath: process.env.NODE_ENV === 'production' ? '/moodboard-app' : '',
  trailingSlash: true,
  // Skip generating 404 page for static export
  skipTrailingSlashRedirect: true,
  skipMiddlewareUrlNormalize: true
};

export default nextConfig;
