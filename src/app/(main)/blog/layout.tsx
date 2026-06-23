import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Blog — Motosiklet Ekipman Rehberleri | Motorya',
  description: 'Motosiklet ekipmanı seçimi, bakımı ve ikinci el alışveriş rehberleri. Kask, mont, eldiven ve daha fazlası hakkında uzman tavsiyeleri.',
  alternates: { canonical: 'https://motorya.com.tr/blog' },
  openGraph: {
    title: 'Blog — Motorya',
    description: 'Motosiklet ekipmanı seçimi, bakımı ve ikinci el alışveriş rehberleri.',
    url: 'https://motorya.com.tr/blog',
  },
};

export default function BlogLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
