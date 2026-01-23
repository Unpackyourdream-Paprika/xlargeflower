import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'res.cloudinary.com',
      },
    ],
    formats: ['image/avif', 'image/webp'], // 최신 이미지 포맷 우선
  },
  // 성능 최적화
  compress: true, // Gzip 압축 활성화
  poweredByHeader: false, // X-Powered-By 헤더 제거
  reactStrictMode: true,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    optimizePackageImports: ['framer-motion'], // 번들 사이즈 최적화
  },
};

export default nextConfig;
