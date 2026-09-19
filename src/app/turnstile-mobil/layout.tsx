import type { Metadata } from 'next';

// Bu sayfa yalnızca mobil uygulamanın WebView'i için var; arama motorunda
// görünmesinin hiçbir anlamı yok ve kullanıcıyı yanıltır.
export const metadata: Metadata = {
  title: 'Doğrulama',
  robots: { index: false, follow: false },
};

export default function TurnstileMobilLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
