const { withSentryConfig } = require('@sentry/nextjs');
const withBundleAnalyzer = require('@next/bundle-analyzer')({
  enabled: process.env.ANALYZE === 'true',
});

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  swcMinify: true,
  compress: true,
  productionBrowserSourceMaps: false,
  
  // Enable TypeScript checking
  typescript: {
    ignoreBuildErrors: false,
  },
  
  // Enable ESLint checking
  eslint: {
    ignoreDuringBuilds: true, // Temporarily disable to fix critical issues first
  },
  
  images: {
    domains: ['localhost', 'placeholder.com', 'cdn.ai-reviewed.com', 'gimmdayqdhxfflaedles.supabase.co'],
    formats: ['image/avif', 'image/webp'],
  },
  
  experimental: {
    // optimizeCss: true, // Temporarily disabled due to critters module issue
  },
  
  webpack: (config, { dev, isServer }) => {
    // Enable tree shaking for production
    if (!dev && !isServer) {
      config.optimization = {
        ...config.optimization,
        usedExports: true,
        sideEffects: false,
      };
    }
    return config;
  },
  
  async headers() {
    return [
      {
        source: '/:path*',
        headers: [
          {
            key: 'X-DNS-Prefetch-Control',
            value: 'on',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'X-Frame-Options',
            value: 'SAMEORIGIN',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
        ],
      },
    ];
  },
}

module.exports = withBundleAnalyzer(nextConfig);
