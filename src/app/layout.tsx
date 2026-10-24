import { Saira, Saira_Condensed, Hanken_Grotesk, Space_Mono } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import UcuncuTarafBetikleri from '@/components/UcuncuTarafBetikleri';
import './globals.css';
import { Providers } from './providers';
import { KampanyaYakalayici } from '@/components/analytics/KampanyaYakalayici';
import { jsonLdHtml } from '@/lib/jsonLd';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  // Mobil tarayıcının adres çubuğu ve PWA olarak ana ekrana eklendiğinde
  // sistem çubuğu bu rengi alıyor. Beyazken site tarayıcıdan ayrışmıyordu.
  themeColor: '#D83E13',

};

/**
 * Yazı tipleri Google'dan @import ile çekiliyordu — globals.css'in ilk
 * satırında. Bu, font yüklemenin en yavaş yolu: tarayıcı önce CSS
 * dosyasını indirip ayrıştırmalı, ancak o zaman font CSS'ini keşfedip
 * ayrı bir istek atabiliyor. İki tur seri hâlde; PageSpeed ölçümünde
 * yalnızca Google Fonts CSS'i 750 ms oluşturmayı engelliyordu.
 *
 * next/font fontları derleme anında indirip KENDİ alan adımızdan servis
 * eder ve CSS'i sayfaya gömer: üçüncü taraf turu ve engelleme kalkar.
 * Değişkenler globals.css'teki --font-* tanımlarıyla aynı isimde, yani
 * stil tarafında hiçbir şey değişmiyor.
 */
const saira = Saira({ subsets: ['latin-ext'], weight: ['400','500','600','700','800'], variable: '--font-saira', display: 'swap' });
const sairaCond = Saira_Condensed({ subsets: ['latin-ext'], weight: ['500','600','700'], variable: '--font-saira-cond', display: 'swap' });
const hanken = Hanken_Grotesk({ subsets: ['latin-ext'], weight: ['400','500','600','700'], variable: '--font-hanken', display: 'swap' });
const spaceMono = Space_Mono({ subsets: ['latin'], weight: ['400','700'], variable: '--font-space-mono', display: 'swap' });

export const metadata: Metadata = {
  // iOS'ta ana ekrana eklenince tam ekran açılsın ve simgenin altında uzun
  // sayfa başlığı değil kısa ad görünsün. Android bunu manifest'ten
  // okuyor; Safari manifest'in display/short_name alanlarını yok sayıyor,
  // o yüzden ayrıca belirtmek gerekiyor.
  appleWebApp: {
    capable: true,
    title: 'Motorya',
    statusBarStyle: 'default',
  },
  title: {
    default: 'Motorya — Motosiklet Ekipman Pazarı',
    template: '%s | Motorya',
  },
  description: 'İkinci el motosiklet kıyafet, kask, mont, eldiven ve aksesuar al-sat. E-posta doğrulamalı üyeler, ücretsiz ilan, platform içi mesajlaşma.',
  keywords: ['motosiklet', 'ikinci el kask', 'ikinci el motosiklet kıyafeti', 'motosiklet aksesuar', 'ikinci el kask satış', 'motosiklet mont', 'ikinci el eldiven', 'motorya', 'motosiklet ekipman'],
  metadataBase: new URL('https://motorya.com.tr'),
  alternates: { canonical: 'https://motorya.com.tr' },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://motorya.com.tr',
    siteName: 'Motorya',
    title: 'Motorya — Türkiye\'nin Motosiklet Ekipman Pazarı',
    description: 'İkinci el motosiklet kıyafet ve aksesuar al-sat. E-posta doğrulamalı üyeler, ücretsiz ilan. Türkiye\'nin motosiklet ekipman pazarı.',
    images: [{ url: '/og-image.jpeg', width: 1200, height: 630, alt: 'Motorya — İkinci El Motosiklet Ekipman İlanları' }],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Motorya — Motosiklet Ekipman Pazarı',
    description: 'İkinci el motosiklet kıyafet ve aksesuar al-sat. Türkiye\'nin motosiklet pazarı.',
    images: ['/og-image.jpeg'],
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
  logo: 'https://motorya.com.tr/logo.png',
  sameAs: [],
  contactPoint: { '@type': 'ContactPoint', contactType: 'customer service', availableLanguage: 'Turkish' },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="tr" className={`h-full ${saira.variable} ${sairaCond.variable} ${hanken.variable} ${spaceMono.variable}`}>
      <head>
        {/* AdSense betiği async yüklenirken DNS + TLS el sıkışması ilk
            boyamayla yarışıyor; ölçümde tek başına ~314 ms. preconnect bu
            turu HTML ayrıştırılırken peşin yapıyor. Betiğin KENDİSİ artık
            UcuncuTarafBetikleri içinde: kimlik ve hesap sayfalarında hiç
            yüklenmiyor. preconnect zararsız olduğu için burada kalıyor. */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
      </head>
      <body className="min-h-full antialiased">
        {/* JSON-LD head yerine body'de: Next.js'in önerdiği yerleşim bu ve
            head'de React'in izlediği script bırakmamak, AdSense'in head'e
            enjeksiyonuyla sıra kaymasını engelliyor. Google structured
            data'yı body içinde de geçerli sayıyor. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(WEBSITE_SCHEMA) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(ORGANIZATION_SCHEMA) }} />
        {/* Kampanya kaynagi KOK layout'ta yakalaniyor: kayit sayfasi ayri
            bir layout grubunda ve dogrudan /kayit?utm_source=... ile de
            girilebiliyor. Icerikten once duruyor cunku React'te ustun
            render'i cocuklardan once calisiyor. */}
        <KampanyaYakalayici />
        <Providers>{children}</Providers>
        {/* Consent Mode varsayılanları GA'dan ÖNCE yüklenmeli: aksi halde
            onay sorulmadan çerez yazılır (KVKK). 'denied' modda GA çerezsiz
            çalışır, kullanıcı kabul edince CookieConsent tam moda geçirir. */}
        <Script id="gtag-consent-default" strategy="beforeInteractive">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('consent', 'default', {
            analytics_storage: 'denied',
            ad_storage: 'denied',
            ad_user_data: 'denied',
            ad_personalization: 'denied',
            wait_for_update: 500
          });
        `}</Script>
        {/* Reklam ve ölçümleme betikleri BURADA DEĞİL: kimlik ve hesap
            sayfalarında yüklenmemeleri gerekiyor ve kök layout hangi
            sayfada olduğumuzu bilmiyor. Kapı UcuncuTarafBetikleri'nde. */}
        <UcuncuTarafBetikleri />
      </body>
    </html>
  );
}
