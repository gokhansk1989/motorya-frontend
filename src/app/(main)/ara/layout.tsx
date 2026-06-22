import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'İlan Ara — Motosiklet Ekipman',
  description: 'İkinci el motosiklet kıyafet ve aksesuar ara. Kask, mont, eldiven, bot, koruma, yedek parça. Fiyata, markaya ve şehre göre filtrele.',
  keywords: ['ikinci el kask ara', 'motosiklet kıyafet ara', 'ikinci el mont', 'motosiklet aksesuar fiyat', 'motosiklet ekipman filtre'],
  alternates: { canonical: 'https://motorya.com.tr/ara' },
  openGraph: {
    title: 'İlan Ara — Motorya',
    description: 'İkinci el motosiklet kıyafet ve aksesuar ara. Fiyata, markaya ve şehre göre filtrele.',
    url: 'https://motorya.com.tr/ara',
  },
};

export default function AraLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
