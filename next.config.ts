import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

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
      // Yeniden adlandırılan kategoriler (GSC 5xx/404 raporu, Eyl 2026)
      { source: '/kategori/bot', destination: '/kategori/bot-cizme', permanent: true },
      { source: '/kategori/bot/:sehir', destination: '/kategori/bot-cizme/:sehir', permanent: true },
      { source: '/kategori/koruyucu', destination: '/kategori/koruma', permanent: true },
      { source: '/kategori/koruyucu/:sehir', destination: '/kategori/koruma/:sehir', permanent: true },
      { source: '/kategori/egzoz', destination: '/kategori/parca-egzoz', permanent: true },
      { source: '/kategori/egzoz/:sehir', destination: '/kategori/parca-egzoz/:sehir', permanent: true },
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

// SENTRY_AUTH_TOKEN + org/project varsa source maps upload olur; yoksa sadece runtime capture.
export default process.env.NEXT_PUBLIC_SENTRY_DSN
  ? withSentryConfig(nextConfig, {
      org: process.env.SENTRY_ORG,
      project: process.env.SENTRY_PROJECT,
      silent: true,
      widenClientFileUpload: true,
      disableLogger: true,
    })
  : nextConfig;
