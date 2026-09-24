import type { NextConfig } from "next";
import { withSentryConfig } from '@sentry/nextjs';

// Content-Security-Policy iki parcali kuruldu.
//
// Neden bolundu: sitede AdSense var ve Google'in reklam yigini surekli yeni
// alan adi cagiriyor (olcumde pagead2, doubleclick, adtrafficquality, csi.
// gstatic... her turda bir yenisi cikti). Bunlarin hepsini listeleyip
// zorlayici moda almak, bir gun Google yeni bir alan adi ekledigi anda
// reklamlari - yani geliri - sessizce kirar.
//
// Bu yuzden:
//  1) ZORLAYICI politika yalnizca reklam yiginina dokunmayan, ama gercek
//     saldirilari kesen yonleri iceriyor. Hicbiri AdSense'i etkilemiyor.
//  2) RAPOR politikasi tam sikilastirilmis hali; hicbir seyi engellemiyor,
//     yalnizca ihlalleri bildiriyor. Zamanla olgunlasinca zorlayiciya alinir.
//
// Zorlayici kisim su saldirilari bugunden kapatiyor:
//  - object-src 'none'   : eklenti/plugin uzerinden kod calistirma
//  - base-uri 'self'     : <base> etiketi enjekte edip tum goreli adresleri
//                          saldirgan sunucusuna yonlendirme
//  - form-action 'self'  : enjekte edilen bir formla kullanici verisini
//                          disari gondermek (parola/oturum sizdirma)
//  - frame-ancestors     : clickjacking (X-Frame-Options'in modern karsiligi)
const cspZorlayici = [
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const cspRaporModu = [
  "default-src 'self'",
  "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://pagead2.googlesyndication.com https://*.googlesyndication.com https://*.googletagservices.com https://*.doubleclick.net https://*.adtrafficquality.google https://*.gstatic.com https://www.googletagmanager.com https://www.google-analytics.com https://www.google.com https://challenges.cloudflare.com",
  "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
  "img-src 'self' data: blob: https:",
  "font-src 'self' data: https://fonts.gstatic.com",
  "connect-src 'self' https://motorya.com.tr https://api.motorya.com.tr wss://motorya.com.tr https://*.google-analytics.com https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://*.gstatic.com https://www.google.com https://*.ingest.sentry.io https://*.ingest.de.sentry.io",
  "frame-src https://*.googlesyndication.com https://*.doubleclick.net https://*.adtrafficquality.google https://www.google.com https://challenges.cloudflare.com",
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
].join('; ');

const securityHeaders = [
  { key: 'Strict-Transport-Security', value: 'max-age=63072000; includeSubDomains; preload' },
  { key: 'X-Content-Type-Options', value: 'nosniff' },
  { key: 'X-Frame-Options', value: 'DENY' },
  { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
  { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=(), payment=()' },
  { key: 'Content-Security-Policy', value: cspZorlayici },
  { key: 'Content-Security-Policy-Report-Only', value: cspRaporModu },
];

const nextConfig: NextConfig = {
  // Tip kontrolü CI'da ayrı adımda koşuyor (bkz. .github/workflows/deploy.yml).
  // Build sırasında tekrar çalıştırmak 908MB'lık sunucuda OOM'a yol açıyordu.
  // (Next 16 build sırasında ESLint çalıştırmıyor, ayrıca kapatmaya gerek yok.)
  typescript: { ignoreBuildErrors: true },
  async headers() {
    return [
      { source: '/:path*', headers: securityHeaders },
      // Kategori ikonlari ve logo: icerik degisirse dosya adi da degisiyor
      // (webp'ye gecerken oldugu gibi), dolayisiyla uzun onbellek guvenli.
      // PageSpeed bunlari "kisa onbellek omru" olarak isaretliyordu; her
      // gezinmede yeniden dogrulanmalari bosa istek demek.
      {
        source: '/icons/:path*',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
      {
        source: '/logo-sm.webp',
        headers: [{ key: 'Cache-Control', value: 'public, max-age=31536000, immutable' }],
      },
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
      // Ozellik "fiyat alarmi" degil: kayitli aramaya UYAN YENI ILAN
      // cikinca haber veriyor, fiyat alti kriterden yalnizca biri. Ad
      // "Alarmlarim" olunca rota da onu izledi; eski adres yer imlerinde
      // ve uygulama disi baglantilarda olabilir.
      { source: '/fiyat-alarm', destination: '/alarmlarim', permanent: true },
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
