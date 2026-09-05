import type { NextConfig } from "next";

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
];

const nextConfig: NextConfig = {
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
    ];
  },
  async redirects() {
    return [
      // www -> apex (SEO duplicate content önlemi)
      {
        source: '/:path*',
        has: [{ type: 'host', value: 'www.motorya.com.tr' }],
        destination: 'https://motorya.com.tr/:path*',
        permanent: true,
      },
      { source: '/pages/:slug', destination: '/sayfa/:slug', permanent: true },
      // Eski URL yapisi /ilanlar?kategori=X -> /kategori/X (GSC 404 raporundan)
      {
        source: '/ilanlar',
        has: [{ type: 'query', key: 'kategori', value: '(?<slug>.*)' }],
        destination: '/kategori/:slug',
        permanent: true,
      },
    ];
  },
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: '**' },
      { protocol: 'http', hostname: '**' },
    ],
    formats: ['image/webp', 'image/avif'],
  },
};

export default nextConfig;
