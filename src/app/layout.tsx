import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
};

export const metadata: Metadata = {
  title: {
    default: 'Motorya — Motosiklet Ekipman Pazarı',
    template: '%s | Motorya',
  },
  description: 'İkinci el motosiklet kıyafet, kask, mont, eldiven ve aksesuar al-sat. Türkiye\'nin motosiklet ekipman pazarı. Güvenli ödeme, kargo takibi. motorya.com.tr',
  keywords: ['motosiklet', 'ikinci el kask', 'ikinci el motosiklet kıyafeti', 'motosiklet aksesuar', 'ikinci el kask satış', 'motosiklet mont', 'ikinci el eldiven', 'motorya', 'motosiklet ekipman'],
  metadataBase: new URL('https://motorya.com.tr'),
  alternates: { canonical: 'https://motorya.com.tr' },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://motorya.com.tr',
    siteName: 'Motorya',
    title: 'Motorya — Türkiye\'nin Motosiklet Ekipman Pazarı',
    description: 'İkinci el motosiklet kıyafet ve aksesuar al-sat. Güvenli ödeme, kargo takibi. Türkiye\'nin motosiklet ekipman pazarı.',
    images: [{ url: '/og-image.png', width: 1200, height: 630, alt: 'Motorya — Motosiklet Ekipman Pazarı' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motorya — Motosiklet Ekipman Pazarı',
    description: 'İkinci el motosiklet kıyafet ve aksesuar al-sat. Türkiye\'nin motosiklet pazarı.',
    images: ['/og-image.png'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large', 'max-video-preview': -1 },
  },
};

const WEBSITE_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'WebSite',
  name: 'Motorya',
  url: 'https://motorya.com.tr',
  description: 'Türkiye\'nin motosiklet ekipman pazarı. İkinci el kask, mont, eldiven ve aksesuar al-sat.',
  potentialAction: {
    '@type': 'SearchAction',
    target: { '@type': 'EntryPoint', urlTemplate: 'https://motorya.com.tr/ara?q={search_term_string}' },
    'query-input': 'required name=search_term_string',
  },
};

const ORGANIZATION_SCHEMA = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Motorya',
  url: 'https://motorya.com.tr',
  logo: 'https://motorya.com.tr/og-image.png',
  sameAs: [],
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: 'Turkish' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <head>
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(WEBSITE_SCHEMA) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(ORGANIZATION_SCHEMA) }} />
        {/* Google AdSense — head içinde olmalı, Google botu bu şekilde doğrular */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4400330012095219"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full antialiased">
        <Providers>{children}</Providers>
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-S0BXZLVQ26" strategy="afterInteractive" />
        <Script id="gtag-init" strategy="afterInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-S0BXZLVQ26');
        `}</Script>
      </body>
    </html>
  );
}
