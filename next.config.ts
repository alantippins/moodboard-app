import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Configuration for production builds (GitHub Pages)
  ...(process.env.NODE_ENV === 'production' ? { 
    output: 'export',
    images: {
      unoptimized: true,
    },
    // For GitHub Pages deployment
    basePath: '/moodboard-app',
    assetPrefix: '/moodboard-app',
  } : {}),
  // Development configuration
  ...(process.env.NODE_ENV !== 'production' ? {
    // No base path in development
  } : {}),
  // Common configuration
  trailingSlash: true,
};

export default nextConfig;
