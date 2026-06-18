import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#1e1f2e',
};

export const metadata: Metadata = {
  title: {
    default: 'Motorya — Motosiklet Ekipman Pazarı',
    template: '%s | Motorya',
  },
  description: 'İkinci el motosiklet kıyafet, kask, mont, eldiven ve aksesuar al-sat. Türkiye\'nin motosiklet ekipman pazarı. motorya.com.tr',
  keywords: ['motosiklet', 'ikinci el kask', 'motosiklet kıyafeti', 'motosiklet aksesuar', 'kask satış', 'mont satış', 'motorya'],
  metadataBase: new URL('https://motorya.com.tr'),
  alternates: { canonical: 'https://motorya.com.tr' },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://motorya.com.tr',
    siteName: 'Motorya',
    title: 'Motorya — Motosiklet Ekipman Pazarı',
    description: 'İkinci el motosiklet kıyafet ve aksesuar al-sat. Türkiye\'nin motosiklet pazarı.',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motorya — Motosiklet Ekipman Pazarı',
    description: 'İkinci el motosiklet kıyafet ve aksesuar al-sat.',
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true, 'max-snippet': -1, 'max-image-preview': 'large' },
  },
  verification: {
    google: 'motorya-google-site-verification',
  },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className="h-full">
      <head>
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
