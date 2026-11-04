/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  poweredByHeader: false,
  compress: true,
  images: {
    formats: ['image/webp'],
    minimumCacheTTL: 2592000, // 30 days cache retention at Vercel Edge
    deviceSizes: [640, 750, 1080, 1200, 1920],
    imageSizes: [32, 48, 64, 128, 256],
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '**.supabase.co',
      },
      {
        protocol: 'https',
        hostname: 'trustcomputermb.com',
      },
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
    ],
  },
  experimental: {
    serverComponentsExternalPackages: ['@prisma/client', '.prisma/client', '@prisma/adapter-pg', 'pg'],
    optimizePackageImports: ['lucide-react', 'recharts'],
  },

  compiler: {
    removeConsole: process.env.NODE_ENV === 'production' ? { exclude: ['error'] } : false,
  },
  async redirects() {
    return [
      {
        source: '/compare',
        destination: '/products',
        permanent: true,
      },
    ];
  },
};

export default nextConfig;
