import { Saira, Saira_Condensed, Hanken_Grotesk, Space_Mono } from 'next/font/google';
import type { Metadata, Viewport } from 'next';
import Script from 'next/script';
import './globals.css';
import { Providers } from './providers';
import { jsonLdHtml } from '@/lib/jsonLd';

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
  themeColor: '#ffffff',
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
  title: {
    default: 'Motorya — Motosiklet Ekipman Pazarı',
    template: '%s | Motorya',
  },
  description: 'İkinci el motosiklet kıyafet, kask, mont, eldiven ve aksesuar al-sat. Doğrulanmış satıcılar, ücretsiz ilan, güvenli mesajlaşma.',
  keywords: ['motosiklet', 'ikinci el kask', 'ikinci el motosiklet kıyafeti', 'motosiklet aksesuar', 'ikinci el kask satış', 'motosiklet mont', 'ikinci el eldiven', 'motorya', 'motosiklet ekipman'],
  metadataBase: new URL('https://motorya.com.tr'),
  alternates: { canonical: 'https://motorya.com.tr' },
  openGraph: {
    type: 'website',
    locale: 'tr_TR',
    url: 'https://motorya.com.tr',
    siteName: 'Motorya',
    title: 'Motorya — Türkiye\'nin Motosiklet Ekipman Pazarı',
    description: 'İkinci el motosiklet kıyafet ve aksesuar al-sat. Doğrulanmış satıcılar, ücretsiz ilan. Türkiye\'nin motosiklet ekipman pazarı.',
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
            turu HTML ayrıştırılırken peşin yapıyor. */}
        <link rel="preconnect" href="https://pagead2.googlesyndication.com" crossOrigin="anonymous" />
        {/* Google AdSense — head içinde olmalı, Google botu bu şekilde doğrular.
            next/script ile body'den yüklemek denendi: "data-nscript" uyarısı
            üretti ve hydration uyuşmazlığını çözmedi, o yüzden geri alındı. */}
        <script
          async
          src="https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-4400330012095219"
          crossOrigin="anonymous"
        />
      </head>
      <body className="min-h-full antialiased">
        {/* JSON-LD head yerine body'de: Next.js'in önerdiği yerleşim bu ve
            head'de React'in izlediği script bırakmamak, AdSense'in head'e
            enjeksiyonuyla sıra kaymasını engelliyor. Google structured
            data'yı body içinde de geçerli sayıyor. */}
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(WEBSITE_SCHEMA) }} />
        <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: jsonLdHtml(ORGANIZATION_SCHEMA) }} />
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
        {/* GA 'afterInteractive' iken hidrasyonun hemen ardından yükleniyor ve
            174 KiB'lik betiği ana iş parçacığında değerlendirmek ölçümde
            engelleme süresine doğrudan giriyordu. 'lazyOnload' onload'dan
            sonraya bırakıyor: sayfa etkileşime hazır olduktan sonra çalıştığı
            için hiçbir oturum kaybedilmiyor, yalnızca kritik yoldan çıkıyor.
            Onay varsayılanları yukarıda beforeInteractive kalıyor — GA'dan
            önce çalışmaları KVKK gereği. */}
        <Script src="https://www.googletagmanager.com/gtag/js?id=G-S0BXZLVQ26" strategy="lazyOnload" />
        <Script id="gtag-init" strategy="lazyOnload">{`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', 'G-S0BXZLVQ26');
        `}</Script>
      </body>
    </html>
  );
}
